# Load Testing

This directory contains load testing scripts and scenarios for SageSpace.

## Setup

### Install k6

\`\`\`bash
# macOS
brew install k6

# Windows (via Chocolatey)
choco install k6

# Linux
# See https://k6.io/docs/getting-started/installation/
\`\`\`

### Install Artillery (Alternative)

\`\`\`bash
npm install -g artillery
\`\`\`

## Test Scenarios

### Feed Read Endpoints

**File**: `feed-read.js`

Tests high-volume feed reads with:
- Concurrent users: 100
- Duration: 5 minutes
- Ramp-up: 30 seconds

### Content Creation

**File**: `content-create.js`

Tests content creation endpoints:
- Concurrent users: 50
- Duration: 3 minutes
- Tests rate limiting

### AI Conversations

**File**: `ai-conversations.js`

Tests Sage AI conversation endpoints:
- Concurrent users: 30
- Duration: 5 minutes
- Tests response times

### Marketplace

**File**: `marketplace.js`

Tests marketplace endpoints:
- Concurrent users: 50
- Duration: 3 minutes
- Tests purchase flow

## Running Tests

### k6

\`\`\`bash
# Run feed read test
k6 run tests/load/feed-read.js

# Run with custom VUs
k6 run --vus 200 --duration 10m tests/load/feed-read.js

# Run with environment variables
k6 run --env API_URL=https://api.sagespace.com tests/load/feed-read.js
\`\`\`

### Artillery

\`\`\`bash
# Run test
artillery run tests/load/feed-read.yml

# Generate report
artillery run --output report.json tests/load/feed-read.yml
artillery report report.json
\`\`\`

## Environment Variables

Set these before running:

\`\`\`bash
export API_URL=http://localhost:3000/api
export AUTH_TOKEN=your-test-token
export TEST_USER_ID=test-user-id
\`\`\`

## Expected Results

### Performance Targets

- **Feed Read**: < 200ms p95
- **Content Create**: < 500ms p95
- **AI Conversations**: < 2s p95
- **Marketplace**: < 300ms p95

### Error Rates

- **Target**: < 0.1% error rate
- **Acceptable**: < 1% error rate
- **Critical**: > 5% error rate (investigate immediately)

## Monitoring During Tests

- Watch Supabase dashboard for database performance
- Monitor API response times
- Check error rates
- Watch for rate limiting

## Interpreting Results

- **p50**: Median response time
- **p95**: 95th percentile (most users experience this or better)
- **p99**: 99th percentile (worst case for most users)
- **Error Rate**: Percentage of failed requests

---

**Note**: These are starting points. Adjust based on your actual load requirements.
