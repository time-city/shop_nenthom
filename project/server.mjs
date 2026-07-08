import { createServer } from "node:http";
import nextEnv from "@next/env";
import next from "next";

const { loadEnvConfig } = nextEnv;
const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

async function start() {
  const httpServer = createServer();
  const app = next({ dev, hostname, port, httpServer });
  const handle = app.getRequestHandler();

  await app.prepare();

  httpServer.on("request", (request, response) => {
    void handle(request, response);
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Server chạy tại http://${hostname}:${port}`);
  });

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

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
