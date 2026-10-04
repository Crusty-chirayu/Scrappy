import PgBoss from "pg-boss";
import { ScrapeParseMatchPipeline, IngestionJobPayload } from "./pipeline.js";

export const PG_BOSS_CONNECTION_STRING =
  process.env.PG_BOSS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:55322/postgres";

export const QUEUES = {
  INGESTION: "job:scrape-and-ingest",
  FETCH_HTTP: "job:fetch-http",
  FETCH_BROWSER: "job:fetch-browser",
  PARSE: "job:parse",
  MATCH: "job:match",
  ALERT: "job:alert",
  NOTIFY: "job:notify",
} as const;

export interface BossWorkerOptions {
  connectionString?: string;
  concurrency?: number;
}

export class BossManager {
  private boss: PgBoss;
  private pipeline: ScrapeParseMatchPipeline;
  private isStarted = false;

  constructor(options: BossWorkerOptions = {}) {
    const conn = options.connectionString || PG_BOSS_CONNECTION_STRING;
    this.boss = new PgBoss(conn);
    this.pipeline = new ScrapeParseMatchPipeline();
  }

  public async start(): Promise<void> {
    if (this.isStarted) return;

    console.info("[pg-boss] Starting worker daemon...");
    await this.boss.start();
    this.isStarted = true;

    // Create queues
    for (const queue of Object.values(QUEUES)) {
      await this.boss.createQueue(queue);
    }
    console.info(`[pg-boss] Successfully initialized ${Object.keys(QUEUES).length} queues.`);

    // Register job consumers
    await this.registerConsumers();
  }

  public async stop(): Promise<void> {
    if (!this.isStarted) return;
    console.info("[pg-boss] Gracefully shutting down worker...");
    await this.boss.stop();
    this.isStarted = false;
  }

  public getBoss(): PgBoss {
    return this.boss;
  }

  public async dispatchIngestion(payload: IngestionJobPayload): Promise<string | null> {
    if (!this.isStarted) {
      await this.start();
    }
    return await this.boss.send(QUEUES.INGESTION, payload);
  }

  private async registerConsumers(): Promise<void> {
    // 1. Ingestion queue worker (complete pipeline: Scrape -> Parse -> Match -> Price Obs -> Alert -> Realtime & Email)
    await this.boss.work<IngestionJobPayload>(
      QUEUES.INGESTION,
      { batchSize: 5 },
      async (jobs) => {
        for (const job of jobs) {
          try {
            console.info(`[pg-boss] Processing job ${job.id} on queue ${QUEUES.INGESTION}...`);
            const result = await this.pipeline.runIngestion(job.data);
            console.info(
              `[pg-boss] Completed job ${job.id}: Product ${result.matchedProductId}, ` +
                `Alerts: ${result.alertsTriggeredCount}, In-App: ${result.notificationsCreated}, Email: ${result.emailsSent}`,
            );
          } catch (err) {
            console.error(`[pg-boss] Job ${job.id} failed:`, err);
            throw err;
          }
        }
      },
    );

    // 2. Alert-only queue consumer
    await this.boss.work(QUEUES.ALERT, async (jobs) => {
      for (const job of jobs) {
        console.info(`[pg-boss] Processing alert job ${job.id}`);
      }
    });

    // 3. Notify queue consumer
    await this.boss.work(QUEUES.NOTIFY, async (jobs) => {
      for (const job of jobs) {
        console.info(`[pg-boss] Processing notify job ${job.id}`);
      }
    });
  }
}

export const defaultBossManager = new BossManager();
