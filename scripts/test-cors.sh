#!/bin/bash

# CORS Test Script
# This script tests CORS configuration by sending OPTIONS and GET requests

API_URL="${1:-http://localhost:8080}"
ORIGIN="${2:-http://localhost:3000}"

echo "Testing CORS configuration..."
echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo ""

# Test 1: Health check endpoint (no auth required)
echo "=== Test 1: Health Check (GET) ==="
curl -i -X GET "$API_URL/api/health" \
  -H "Origin: $ORIGIN" \
  2>/dev/null | head -20
echo ""

# Test 2: OPTIONS request (preflight)
echo "=== Test 2: Preflight Request (OPTIONS) ==="
curl -i -X OPTIONS "$API_URL/api/campaigns" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  2>/dev/null | head -20
echo ""

# Test 3: GET request with Authorization header
echo "=== Test 3: GET with Authorization (should fail without valid token) ==="
curl -i -X GET "$API_URL/api/campaigns" \
  -H "Origin: $ORIGIN" \
  -H "Authorization: Bearer test-token" \
  2>/dev/null | head -20
echo ""

echo "CORS test completed!"
echo ""
echo "Expected results:"
echo "- Test 1: Should return 200 OK with CORS headers"
echo "- Test 2: Should return 204 No Content with CORS headers"
echo "- Test 3: Should return 401 Unauthorized (invalid token) but with CORS headers"
