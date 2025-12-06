/**
 * Load test for feed read endpoints
 * 
 * Tests: GET /api/feed
 * 
 * Run: k6 run tests/load/feed-read.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 150 },  // Ramp up to 150 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
}

const API_URL = __ENV.API_URL || 'http://localhost:3000/api'
const AUTH_TOKEN = __ENV.AUTH_TOKEN || ''

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }

  // Test feed endpoint
  const feedRes = http.get(`${API_URL}/feed`, params)
  const feedSuccess = check(feedRes, {
    'feed status is 200': (r) => r.status === 200,
    'feed response time < 500ms': (r) => r.timings.duration < 500,
    'feed has items': (r) => {
      try {
        const data = JSON.parse(r.body)
        return Array.isArray(data.items || data)
      } catch {
        return false
      }
    },
  })

  errorRate.add(!feedSuccess)

  // Test different view types
  const views = ['default', 'following', 'marketplace', 'universe']
  const view = views[Math.floor(Math.random() * views.length)]
  
  const viewRes = http.get(`${API_URL}/feed?view=${view}`, params)
  check(viewRes, {
    'view status is 200': (r) => r.status === 200,
    'view response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1) // Simulate user think time
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/load/results/feed-read-summary.json': JSON.stringify(data),
  }
}
