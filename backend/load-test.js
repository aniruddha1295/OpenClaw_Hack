import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,       // 10 virtual users
  duration: '30s', // 30 second test
};

export default function () {
  // Test the health endpoint
  const res = http.get('http://localhost:3005/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time is < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
