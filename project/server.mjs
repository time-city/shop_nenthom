import { createServer } from "node:http";
import nextEnv from "@next/env";
import next from "next";
import {
  ADMIN_ORDER_WEBSOCKET_PATH,
  setupAdminOrderSocket,
} from "./src/socket/adminOrderSocket.mjs";

const { loadEnvConfig } = nextEnv;
const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const eventChannel =
  process.env.ADMIN_ORDER_EVENT_CHANNEL ?? "admin_order_events";

async function start() {
  const connectionString = process.env.DATABASE_URL;
  const notificationConnectionString =
    process.env.DIRECT_URL ?? connectionString;

  if (!connectionString || !notificationConnectionString) {
    throw new Error("Thiếu DATABASE_URL hoặc DIRECT_URL");
  }

  const httpServer = createServer();
  const app = next({ dev, hostname, port, httpServer });
  const handle = app.getRequestHandler();

  await app.prepare();

  httpServer.on("request", (request, response) => {
    void handle(request, response);
  });

  const adminOrderSocket = await setupAdminOrderSocket({
    connectionString,
    dev,
    eventChannel,
    httpServer,
    notificationConnectionString,
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Server chạy tại http://${hostname}:${port}`);
    console.log(
      `> WebSocket endpoint: ws://${hostname}:${port}${ADMIN_ORDER_WEBSOCKET_PATH}`,
    );
  });

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    await adminOrderSocket.close();
    await app.close();
    httpServer.close(() => process.exit(0));
  };

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}

start().catch((error) => {
  console.error("[server] Không thể khởi động:", error);
  process.exit(1);
});
