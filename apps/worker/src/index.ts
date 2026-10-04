import { validateEnv, WorkerEnvSchema } from "@scrappy/core";
import { defaultBossManager, QUEUES } from "./boss.js";

export * from "./mailer.js";
export * from "./pipeline.js";
export * from "./boss.js";
export * from "./handlers.js";

const env = validateEnv(WorkerEnvSchema, process.env, "Worker Process");

export async function startWorker() {
  if (process.env.DEBUG === "1") {
    console.info(`[Worker] Initializing pg-boss worker daemon in ${env.NODE_ENV} mode...`);
    console.info(`[Worker] Concurrency: ${env.WORKER_CONCURRENCY}, DB: ${env.DATABASE_URL}`);
  }

  await defaultBossManager.start();
  console.info(`[Worker] Background worker ready (concurrency: ${env.WORKER_CONCURRENCY})`);

  return {
    status: "running",
    queues: Object.values(QUEUES),
    boss: defaultBossManager,
  };
}

if (process.env.NODE_ENV !== "test") {
  if (process.env.RUN_WORKER_STANDALONE === "true") {
    startWorker().catch((err) => {
      console.error("[Worker] Fatal startup error:", err);
      process.exit(1);
    });
  } else {
    console.info("[Worker] Standby worker process initialized");
  }
}
