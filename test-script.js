import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 10 },
        { duration: "60s", target: 40 },
        { duration: "20s", target: 0 },
    ],
};

export default function () {
    const res = http.post("http://localhost:3001/api/mock_stream");

    check(res, {
        "is status 200": (r) => r.status === 200,
        "respone time < 500ms": (r) => r.timings.duration < 500,
    });

    sleep(1);
}
