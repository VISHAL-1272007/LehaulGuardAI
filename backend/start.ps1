# Legal Metrology AI Backend - Quick Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Legal Metrology AI - FastAPI Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "../.venv")) {
    Write-Host "⚠️  Virtual environment not found" -ForegroundColor Yellow
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv ../.venv
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Green
& "../.venv/Scripts/Activate.ps1"

# Install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Green
pip install -q -r requirements.txt

Write-Host ""
Write-Host "✅ Environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 API will be available at:" -ForegroundColor Yellow
Write-Host "   - Main API: http://localhost:8000" -ForegroundColor White
Write-Host "   - Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   - ReDoc: http://localhost:8000/redoc" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
