import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    capacity_test: {
      executor: "ramping-arrival-rate",
      startRate: 5,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [
        { target: 10, duration: "30s" },
        { target: 15, duration: "30s" },
        { target: 20, duration: "30s" },
        { target: 25, duration: "30s" },
        { target: 30, duration: "30s" },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],       
    http_req_duration: ["p(95)<2500", "p(99)<4000"],
    checks: ["rate>0.99"],
  },
};


export default function () {
    const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

    const payload = JSON.stringify({
        message: "What is the fiscal year of this month?",
    });

    const params = {
        headers: { "Content-Type": "application/json" },
    };

    const res = http.post(`${BASE_URL}/api/chat`, payload, params);

    check(res, {
        "is status 200": (r) => r.status === 200,
        "response time < 2000ms": (r) => r.timings.duration < 2000,
    });

    sleep(1);
}

//k6 run --out web-dashboard capacity-test.js
