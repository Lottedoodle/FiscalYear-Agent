import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    regression: {
      executor: 'constant-arrival-rate',
      rate: 20,           // 20 req/s 
      timeUnit: '1s',
      duration: '45s',    // CI test
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.001"],
    http_req_duration: ["p(95)<1500", "p(99)<2500"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || __ENV.API_URL || "http://localhost:3000";

  const payload = JSON.stringify({
    messages: [
      { role: "user", parts: [{ type: "text", text: "CI Regression Test" }] },
    ],
    sessionId: "db0861bd-4b54-4a2c-bd19-6a38f14dffc1",
    userId: "8056d3da-4110-4271-a8bc-719555f878ed",
  });

  const res = http.post(`${BASE_URL}/api/chat`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: "5s",
  });

  let parsed = null;
  try {
    parsed = res.json();
  } catch (_) {
    parsed = null;
  }

  check(res, {
    "status is 200": (r) => r.status === 200,

    
    "response is not empty": (r) => !!r.body && r.body.length > 0,

    
    "has content field": () =>
      parsed !== null &&
      typeof parsed === "object" &&
      parsed.content !== undefined,
  });

  sleep(0.5);
}