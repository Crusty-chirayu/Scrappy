import http from "k6/http";
import { check, sleep } from "k6";

// Constitution Rule 8 Budget: search API p95 < 150ms
export const options = {
  stages: [
    { duration: "5s", target: 20 },  // Ramp up to 20 virtual users
    { duration: "10s", target: 20 }, // Steady load
    { duration: "5s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],          // Error rate < 1%
    http_req_duration: ["p(95)<150"],        // 95% of search requests must complete within 150ms
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3005";
const SEARCH_QUERIES = ["iPhone", "Sony", "MacBook", "Samsung", "Headphones"];

export default function () {
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const res = http.get(`${BASE_URL}/api/search?q=${query}&limit=10`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has response payload": (r) => r.body && r.body.length > 0,
  });

  sleep(0.1);
}
