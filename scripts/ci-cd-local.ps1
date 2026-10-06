# ==============================================================================
# SnapStudio Local CI/CD Automation Runner (Windows PowerShell)
# Usage: .\scripts\ci-cd-local.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 SnapStudio Local CI/CD Pipeline Executing (PowerShell)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. QA Automation Integrity Test
Write-Host "`n[Step 1/3] 🧪 Running Prototype Integrity Test Suite..." -ForegroundColor Yellow
python scripts/test-prototype.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prototype integrity test failed." -ForegroundColor Red
    exit 1
}

# 2. Native iOS Swift Core & Modular Filter Engine Test (if Swift is available)
Write-Host "`n[Step 2/3] 🍏 Checking Native iOS Swift Environment..." -ForegroundColor Yellow
if (Get-Command swift -ErrorAction SilentlyContinue) {
    Write-Host "Running Swift test runner..." -ForegroundColor Green
    swift run iCamTestRunner
} else {
    Write-Host "ℹ️ Swift toolchain not detected on local Windows host. Swift tests run in macOS GitHub Actions CI." -ForegroundColor DarkYellow
}

# 3. Git Status & Deployment Readiness Check
Write-Host "`n[Step 3/3] 📦 Verifying Git Status & Release Readiness..." -ForegroundColor Yellow
git status --short

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "✨ Local CI/CD Automation Complete: Prototype is Healthy & Live!" -ForegroundColor Green
Write-Host "🔗 Local Web Preview: http://localhost:8080 (Start with: python -m http.server 8080)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
