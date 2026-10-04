/**
 * Load & Latency Benchmark Runner for SCRAPPY
 * Verifies Constitution Rule 8:
 * - Search API p95 < 150ms
 * - Product Page TTFB < 300ms (cached)
 */

interface LatencyStats {
  count: number;
  errors: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

function calculateStats(latencies: number[], errors: number): LatencyStats {
  if (latencies.length === 0) {
    return { count: 0, errors, min: 0, max: 0, mean: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  const getPercentile = (p: number) => {
    const idx = Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1);
    return Math.round(sorted[idx]);
  };

  return {
    count: sorted.length,
    errors,
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
    mean: Math.round(sum / sorted.length),
    p50: getPercentile(50),
    p90: getPercentile(90),
    p95: getPercentile(95),
    p99: getPercentile(99),
  };
}

async function runBenchmark(
  name: string,
  url: string,
  concurrency: number,
  totalRequests: number,
): Promise<LatencyStats> {
  console.info(`\n=== Running Load Benchmark: ${name} ===`);
  console.info(`Target: ${url}`);
  console.info(`Concurrency: ${concurrency} workers | Total Requests: ${totalRequests}`);

  // Warmup 5 requests
  for (let i = 0; i < 5; i++) {
    try {
      await fetch(url);
    } catch {
      // Warmup ignore
    }
  }

  const latencies: number[] = [];
  let errors = 0;
  let completed = 0;

  const runWorker = async () => {
    while (completed < totalRequests) {
      completed++;
      const start = performance.now();
      try {
        const res = await fetch(url);
        const duration = performance.now() - start;
        if (res.ok) {
          await res.text();
          latencies.push(duration);
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }
  };

  const workers = Array.from({ length: concurrency }, () => runWorker());
  await Promise.all(workers);

  const stats = calculateStats(latencies, errors);
  console.info(`Results for ${name}:`, JSON.stringify({
    "Requests Completed": stats.count,
    "Errors": stats.errors,
    "Min Latency": `${stats.min} ms`,
    "Mean Latency": `${stats.mean} ms`,
    "p50 Latency": `${stats.p50} ms`,
    "p90 Latency": `${stats.p90} ms`,
    "p95 Latency": `${stats.p95} ms`,
    "p99 Latency": `${stats.p99} ms`,
    "Max Latency": `${stats.max} ms`,
  }, null, 2));

  return stats;
}

async function main() {
  const baseUrl = process.env.TARGET_URL || "http://localhost:3005";
  console.info(`SCRAPPY Load Test Runner - Target Base URL: ${baseUrl}`);

  // 1. Benchmark Search API (Rule 8: search API p95 < 150ms)
  const searchStats = await runBenchmark(
    "Search API (/api/search?q=iPhone)",
    `${baseUrl}/api/search?q=iPhone&limit=10`,
    10,
    60,
  );

  // 2. Benchmark Product Page (Rule 8: product page TTFB < 300ms cached)
  const productStats = await runBenchmark(
    "Product Page (/compare/b2000000-0000-0000-0000-000000000001)",
    `${baseUrl}/compare/b2000000-0000-0000-0000-000000000001`,
    10,
    60,
  );

  console.info("\n=== Constitution Rule 8 Performance Gate Verification ===");
  let failed = false;

  if (searchStats.p95 >= 150) {
    console.error(`❌ Search API p95 failed: ${searchStats.p95}ms >= 150ms budget`);
    failed = true;
  } else {
    console.info(`✓ Search API p95 passed: ${searchStats.p95}ms < 150ms budget`);
  }

  if (productStats.p95 >= 300) {
    console.error(`❌ Product page p95 failed: ${productStats.p95}ms >= 300ms budget`);
    failed = true;
  } else {
    console.info(`✓ Product page p95 passed: ${productStats.p95}ms < 300ms budget`);
  }

  if (searchStats.errors > 0 || productStats.errors > 0) {
    console.error(`❌ Non-zero error rate: Search errors=${searchStats.errors}, Product errors=${productStats.errors}`);
    failed = true;
  } else {
    console.info(`✓ Zero error rate achieved.`);
  }

  if (failed) {
    process.exit(1);
  } else {
    console.info("\n🎉 ALL CONSTITUTION RULE 8 LOAD BUDGETS PASSED!\n");
  }
}

main().catch((err) => {
  console.error("Benchmark failed with error:", err);
  process.exit(1);
});
