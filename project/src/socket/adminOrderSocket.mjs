import { createHmac, timingSafeEqual } from "node:crypto";
import pg from "pg";
import { WebSocket, WebSocketServer } from "ws";

const { Client, Pool } = pg;

export const ADMIN_ORDER_WEBSOCKET_PATH = "/ws/admin/orders";

const SESSION_COOKIE_NAME = "session";
const HEARTBEAT_INTERVAL_MS = 30_000;
const DATABASE_RECONNECT_DELAY_MS = 5_000;

function getSessionSecret(dev) {
  const secret = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;

  if (secret) return secret;
  if (dev) return "dev-only-change-this-auth-secret";

  throw new Error("Thiếu cấu hình bảo mật hệ thống. Vui lòng liên hệ quản trị viên.");
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    if (cookie.slice(0, separatorIndex).trim() === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    }
  }

  return null;
}

function verifyAdminSession(token, dev) {
  const [encodedHeader, encodedBody, signature] = token.split(".");
  if (!encodedHeader || !encodedBody || !signature) return null;

  const unsignedToken = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = createHmac("sha256", getSessionSecret(dev))
    .update(unsignedToken)
    .digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedBody, "base64url").toString("utf8"),
    );

    if (
      !payload.sub ||
      payload.role !== "ADMIN" ||
      !payload.exp ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function rejectUpgrade(socket, status, message) {
  socket.write(
    `HTTP/1.1 ${status} ${message}\r\nConnection: close\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${message}`,
  );
  socket.end();
}

export async function setupAdminOrderSocket({
  dev,
  eventChannel,
  httpServer,
  connectionString,
  notificationConnectionString,
}) {
  if (!/^[a-z_][a-z0-9_]*$/.test(eventChannel)) {
    throw new Error("Kênh đồng bộ hóa dữ liệu không hợp lệ.");
  }

  const authPool = new Pool({ connectionString });
  const websocketServer = new WebSocketServer({ noServer: true });

  const getActiveAdminId = async (request) => {
    const token = getCookie(request, SESSION_COOKIE_NAME);
    if (!token) return null;

    const session = verifyAdminSession(token, dev);
    if (!session) return null;

    const result = await authPool.query(
      `SELECT "role", "status" FROM "public"."users" WHERE "id" = $1 LIMIT 1`,
      [session.sub],
    );
    const admin = result.rows[0];

    return admin?.role === "ADMIN" && admin.status === "ACTIVE"
      ? session.sub
      : null;
  };

  const handleUpgrade = (request, socket, head) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    const pathname = url.pathname;

    if (pathname !== ADMIN_ORDER_WEBSOCKET_PATH) return;

    void getActiveAdminId(request)
      .then((adminId) => {
        if (!adminId) {
          rejectUpgrade(socket, 401, "Không có quyền truy cập.");
          return;
        }

        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
          websocketServer.emit("connection", websocket, request, {
            adminId,
            kind: "admin",
          });
        });
      })
      .catch((error) => {
        console.error("[admin-order-socket] Không thể xác thực admin:", error);
        rejectUpgrade(socket, 500, "Lỗi kết nối máy chủ.");
      });
  };

  httpServer.on("upgrade", handleUpgrade);

  const connectionBySocket = new Map();

  websocketServer.on("connection", (websocket, _request, connection) => {
    let alive = true;
    connectionBySocket.set(websocket, connection);

    websocket.on("pong", () => {
      alive = true;
    });
    websocket.on("error", (error) => {
      console.error("[admin-order-socket] Lỗi kết nối admin:", error);
    });
    void authPool
      .query(
        `SELECT
           (
             SELECT COUNT(*)::int
             FROM "public"."notifications"
             WHERE "user_id" = $1::uuid AND "is_read" = FALSE
           ) AS "unreadNotificationCount",
           (
             SELECT COUNT(*)::int
             FROM "public"."contacts"
             WHERE "status" = 'PENDING'
           ) AS "pendingContactCount"`,
          [connection.adminId],
        )
        .then((result) => {
          websocket.send(
            JSON.stringify({
              data: {
                pendingContactCount: result.rows[0]?.pendingContactCount ?? 0,
                unreadNotificationCount:
                  result.rows[0]?.unreadNotificationCount ?? 0,
              },
              event: "CONNECTED",
            }),
          );
        })
        .catch((error) => {
          console.error(
            "[admin-order-socket] Không thể tải số notification:",
            error,
          );
        });

    const heartbeat = setInterval(() => {
      if (!alive) {
        websocket.terminate();
        clearInterval(heartbeat);
        return;
      }

      alive = false;
      websocket.ping();
    }, HEARTBEAT_INTERVAL_MS);

    websocket.once("close", () => {
      connectionBySocket.delete(websocket);
      clearInterval(heartbeat);
    });
  });

  const broadcast = async (event) => {
    await Promise.all(
      [...websocketServer.clients].map(async (client) => {
        if (client.readyState !== WebSocket.OPEN) return;

        const connection = connectionBySocket.get(client);
        if (!connection) return;

        if (connection.kind !== "admin") return;

        if (event.event === "NEW_CONTACT") {
          client.send(JSON.stringify(event));
          return;
        }

        if (event.event !== "NEW_ORDER") return;

        const result = await authPool.query(
          `SELECT
             notification."id",
             notification."type",
             notification."title",
             notification."message",
             notification."data",
             notification."is_read" AS "isRead",
             notification."created_at" AS "createdAt",
             (
               SELECT COUNT(*)::int
               FROM "public"."notifications" unread
               WHERE unread."user_id" = $1::uuid
                 AND unread."is_read" = FALSE
             ) AS "unreadNotificationCount"
           FROM "public"."notifications" notification
           WHERE notification."user_id" = $1::uuid
             AND notification."order_id" = $2::uuid
             AND notification."type" = 'NEW_ORDER'
           LIMIT 1`,
          [connection.adminId, event.data.orderId],
        );
        const notification = result.rows[0];

        if (!notification) return;

        client.send(
          JSON.stringify({
            ...event,
            data: {
              ...event.data,
              notification: {
                createdAt: notification.createdAt,
                data: notification.data,
                id: notification.id,
                isRead: notification.isRead,
                message: notification.message,
                title: notification.title,
                type: notification.type,
              },
              unreadNotificationCount:
                notification.unreadNotificationCount ?? 0,
            },
          }),
        );
      }),
    );
  };

  let notificationClient = null;
  let reconnectTimer = null;
  let shuttingDown = false;

  const connectDatabaseNotifications = async () => {
    if (shuttingDown) return;

    const client = new Client({
      connectionString: notificationConnectionString,
    });
    notificationClient = client;

    const reconnect = () => {
      if (shuttingDown || reconnectTimer) return;

      notificationClient = null;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connectDatabaseNotifications().catch((error) => {
          console.error(
            "[admin-order-socket] Không thể kết nối lại PostgreSQL:",
            error,
          );
          reconnect();
        });
      }, DATABASE_RECONNECT_DELAY_MS);
    };

    client.on("notification", (notification) => {
      if (notification.channel !== eventChannel || !notification.payload) return;

      try {
        void broadcast(JSON.parse(notification.payload)).catch((error) => {
          console.error(
            "[admin-order-socket] Không thể broadcast notification:",
            error,
          );
        });
      } catch (error) {
        console.error("[admin-order-socket] Payload không hợp lệ:", error);
      }
    });
    client.once("error", (error) => {
      console.error("[admin-order-socket] PostgreSQL bị lỗi:", error);
      reconnect();
    });
    client.once("end", reconnect);

    await client.connect();
    await client.query(`LISTEN ${eventChannel}`);
    console.log(
      `[admin-order-socket] Đang lắng nghe PostgreSQL channel "${eventChannel}"`,
    );
  };

  await connectDatabaseNotifications();

  return {
    async close() {
      shuttingDown = true;
      httpServer.off("upgrade", handleUpgrade);
      if (reconnectTimer) clearTimeout(reconnectTimer);

      websocketServer.clients.forEach((client) =>
        client.close(1001, "Server shutdown"),
      );
      websocketServer.close();
      await notificationClient?.end().catch(() => undefined);
      await authPool.end();
    },
  };
}
