#!/usr/bin/env pwsh

# Pattern Recognizer - Server Startup Script
# This script starts both the Flask backend and React frontend servers

Write-Host "🚀 Starting Pattern Recognizer Application..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Get the project root directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend setup
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

Write-Host "📊 Starting Flask Backend Server..." -ForegroundColor Yellow
Write-Host "Backend Path: $BackendPath" -ForegroundColor Gray

# Start backend in a new PowerShell window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; python app.py" -WindowStyle Normal

Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "🎨 Starting React Frontend Server..." -ForegroundColor Yellow
Write-Host "Frontend Path: $FrontendPath" -ForegroundColor Gray

# Start frontend in a new PowerShell window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; & 'C:\Program Files\nodejs\npm.cmd' start" -WindowStyle Normal

Write-Host "⏳ Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "  • Frontend (React):     http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend API (Flask):  http://localhost:5000" -ForegroundColor White
Write-Host "  • API Health Check:     http://localhost:5000/health" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📝 Available API Endpoints:" -ForegroundColor Cyan
Write-Host "  • GET /api/patterns/{company}     - Get all patterns for company" -ForegroundColor White
Write-Host "  • GET /api/patterns/{company}/{timeframe} - Get patterns by timeframe" -ForegroundColor White
Write-Host "  • GET /api/ohlcv/{company}        - Get OHLCV data for company" -ForegroundColor White
Write-Host "  • GET /companies                  - Get available companies" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Development Scripts Added:" -ForegroundColor Cyan
Write-Host "  • npm start      - Start development server" -ForegroundColor White
Write-Host "  • npm run dev    - Same as start (alias)" -ForegroundColor White
Write-Host "  • npm run build  - Build for production" -ForegroundColor White
Write-Host "  • npm test       - Run tests" -ForegroundColor White
Write-Host "  • npm run lint   - Run ESLint" -ForegroundColor White
Write-Host "  • npm run serve  - Serve built application" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📋 To stop servers:" -ForegroundColor Red
Write-Host "  • Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor White

Write-Host "" -ForegroundColor White
Write-Host "🎉 Pattern Recognizer is now running!" -ForegroundColor Green
