@echo off
title Pattern Recognizer - Server Startup

echo.
echo ================================================================
echo   🚀 Pattern Recognizer - Starting Application Servers
echo ================================================================
echo.

echo 📊 Starting Flask Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "python app.py"

echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 Starting React Frontend Server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Both servers are starting up!
echo.
echo 🌐 Application URLs:
echo   • Frontend (React):     http://localhost:3000
echo   • Backend API (Flask):  http://localhost:5000
echo   • API Health Check:     http://localhost:5000/health
echo.
echo 📝 Available API Endpoints:
echo   • GET /api/patterns/{company}                 - Get all patterns
echo   • GET /api/patterns/{company}/{timeframe}     - Get patterns by timeframe
echo   • GET /api/ohlcv/{company}                    - Get OHLCV data
echo   • GET /companies                              - Get available companies
echo.
echo 🔧 Additional Scripts:
echo   • npm run dev    - Development server
echo   • npm run build  - Production build
echo   • npm test       - Run tests
echo   • npm run lint   - Code linting
echo.
echo 📋 To stop servers: Close the command windows or press Ctrl+C
echo.
echo 🎉 Pattern Recognizer is now running!
echo.
pause
