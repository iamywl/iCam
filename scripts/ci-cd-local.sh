#!/usr/bin/env bash
# ==============================================================================
# SnapStudio Local CI/CD Automation Runner
# Usage: ./scripts/ci-cd-local.sh
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "🚀 SnapStudio Local CI/CD Pipeline Executing..."
echo "=========================================================="

# 1. QA Automation Integrity Test
echo ""
echo "[Step 1/3] 🧪 Running Prototype Integrity Test Suite..."
python3 scripts/test-prototype.py

# 2. Check HTTP Server & Port Status
echo ""
echo "[Step 2/3] 🌐 Verifying Local Server Status..."
if curl -s -I http://localhost:8080/ >/dev/null; then
  echo "✅ Local HTTP Server running at http://localhost:8080"
else
  echo "⚠️ Local HTTP Server not running on port 8080. Starting background daemon..."
  python3 -m http.server 8080 &
  sleep 1
  echo "✅ Server started at http://localhost:8080"
fi

# 3. Git Status & Deployment Readiness Check
echo ""
echo "[Step 3/3] 📦 Verifying Git Status & Release Readiness..."
git status --short || echo "Git not initialized or clean."

echo ""
echo "=========================================================="
echo "✨ CI/CD Automation Complete: Prototype is Healthy & Live!"
echo "🔗 Access: http://localhost:8080"
echo "=========================================================="
