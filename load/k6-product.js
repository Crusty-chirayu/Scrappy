import http from "k6/http";
import { check, sleep } from "k6";

// Constitution Rule 8 Budget: product page TTFB < 300ms (cached)
export const options = {
  stages: [
    { duration: "5s", target: 20 },  // Ramp up to 20 virtual users
    { duration: "10s", target: 20 }, // Steady load
    { duration: "5s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],          // Error rate < 1%
    http_req_duration: ["p(95)<300"],        // 95% of product requests must complete within 300ms
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3005";
const PRODUCT_ID = "b2000000-0000-0000-0000-000000000001";

export default function () {
  const res = http.get(`${BASE_URL}/compare/${PRODUCT_ID}`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has product HTML": (r) => r.body && r.body.includes("Apple iPhone 15"),
  });

  sleep(0.1);
}
