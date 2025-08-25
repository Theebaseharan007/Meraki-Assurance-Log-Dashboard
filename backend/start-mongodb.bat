@echo off
echo Starting MongoDB manually...
echo.
echo Data Directory: C:\data\db
echo Port: 27017
echo.

"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --port 27017 --bind_ip 127.0.0.1

pause
