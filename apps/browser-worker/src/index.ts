import http from "node:http";
import { validateEnv, BrowserWorkerEnvSchema } from "@scrappy/core";

const env = validateEnv(BrowserWorkerEnvSchema, process.env, "Browser Worker");

export function createBrowserWorkerServer() {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "healthy",
          maxConcurrentBrowsers: env.MAX_CONCURRENT_BROWSERS,
          pageTimeoutMs: env.PAGE_TIMEOUT_MS,
        }),
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });

  return server;
}

if (process.env.NODE_ENV !== "test") {
  const server = createBrowserWorkerServer();
  server.listen(env.PORT, () => {
    console.info(`[Browser Worker] Running isolated browser worker on port ${env.PORT}`);
  });
}
