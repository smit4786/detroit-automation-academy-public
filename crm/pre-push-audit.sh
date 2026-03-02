#!/bin/bash
# Pre-Push Security Gate: Pings the local MCP Server for a Privacy Audit
# Built for DAA CRM by @Privacy-Auditor

MCP_URL="http://localhost:8000/analyze-code"
CODE_CONTENT=$(cat frontend/src/App.tsx) # Example file to audit

echo "🕵️  Initiating MCP Privacy Audit for App.tsx..."

RESPONSE=$(curl -s -X POST "$MCP_URL" 
     -H "Content-Type: application/json" 
     -d "{"code": "$CODE_CONTENT", "file_extension": "tsx"}")

AUDIT_PASSED=$(echo $RESPONSE | grep -o '"audit_passed":true')

if [ "$AUDIT_PASSED" == '"audit_passed":true' ]; then
    echo "✅ Audit Passed. No PII detected."
    exit 0
else
    echo "❌ Audit Failed. PII or secrets detected in diff!"
    echo "Details: $RESPONSE"
    exit 1
fi
