@echo off
echo ========================================================
echo       Starting Rich Cake Shop Full-Stack System
echo ========================================================
echo.

:: Free port 5000 if already occupied by a previous node session
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo Freeing existing process on port 5000 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: Free port 5173 if already occupied
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Freeing existing process on port 5173 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting Backend API Server on Port 5000...
start "Rich Cake Shop - Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Web Client on Port 5173...
start "Rich Cake Shop - Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo   Both services are launching in separate windows!
echo   Frontend:    http://localhost:5173/
echo   Backend API: http://localhost:5000/api/v1
echo   Admin Login: admin@richcakeshop.com / RichCake@Admin2026
echo ========================================================
