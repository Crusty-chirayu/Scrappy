import { validateEnv, WorkerEnvSchema } from "@scrappy/core";
import { defaultBossManager, QUEUES } from "./boss.js";

export * from "./mailer.js";
export * from "./pipeline.js";
export * from "./boss.js";
export * from "./handlers.js";

const env = validateEnv(WorkerEnvSchema, process.env, "Worker Process");

export async function startWorker() {
  console.info(`[Worker] Initializing Scrappy pg-boss worker daemon in ${env.NODE_ENV} mode...`);
  console.info(`[Worker] Concurrency: ${env.WORKER_CONCURRENCY}, DB Target: ${env.DATABASE_URL}`);

  await defaultBossManager.start();

  return {
    status: "running",
    queues: Object.values(QUEUES),
    boss: defaultBossManager,
  };
}

if (process.env.NODE_ENV !== "test" && process.env.RUN_WORKER_STANDALONE === "true") {
  startWorker().catch((err) => {
    console.error("[Worker] Fatal startup error:", err);
    process.exit(1);
  });
}
