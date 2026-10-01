Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Starting Rich Cake Shop Full-Stack System" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot

# Automatically free ports if previous sessions were left running
foreach ($port in @(5000, 5173)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            Write-Host "Freeing existing process on port $port (PID: $p)..." -ForegroundColor DarkYellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

Start-Sleep -Seconds 1

Write-Host "Starting Backend API Server on Port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\server'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Web Client on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\client'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Both services launched in separate windows!" -ForegroundColor Green
Write-Host "  Frontend:    http://localhost:5173/" -ForegroundColor Yellow
Write-Host "  Backend API: http://localhost:5000/api/v1" -ForegroundColor Yellow
Write-Host "  Admin Login: admin@richcakeshop.com / RichCake@Admin2026" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
