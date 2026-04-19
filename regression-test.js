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
  // Copy URL from Env or localhost as a default
  const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
  
  const res = http.post(`${BASE_URL}/api/chat`, JSON.stringify({
    message: 'CI Regression Test',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}