import { validateEnv, WorkerEnvSchema } from "@scrappy/core";

const env = validateEnv(WorkerEnvSchema, process.env, "Worker Process");

export const JOB_QUEUES = [
  "job:fetch",
  "job:parse",
  "job:match",
  "job:alert",
  "job:notify",
  "job:report",
  "job:export",
  "job:ai",
] as const;

export type JobQueueName = (typeof JOB_QUEUES)[number];

export async function startWorker() {
  console.info(`[Worker] Initializing Scrappy worker daemon in ${env.NODE_ENV} mode...`);
  console.info(`[Worker] Concurrency: ${env.WORKER_CONCURRENCY}, DB Target: ${env.DATABASE_URL}`);
  console.info(`[Worker] Registered queues: ${JOB_QUEUES.join(", ")}`);

  return {
    status: "running",
    queues: JOB_QUEUES,
  };
}

if (process.env.NODE_ENV !== "test") {
  startWorker().catch((err) => {
    console.error("[Worker] Fatal startup error:", err);
    process.exit(1);
  });
}
