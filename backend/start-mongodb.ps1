Write-Host "Starting MongoDB manually..." -ForegroundColor Green
Write-Host ""
Write-Host "Data Directory: C:\data\db" -ForegroundColor Yellow
Write-Host "Port: 27017" -ForegroundColor Yellow
Write-Host "Bind IP: 127.0.0.1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop MongoDB" -ForegroundColor Red
Write-Host ""

& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --port 27017 --bind_ip 127.0.0.1
