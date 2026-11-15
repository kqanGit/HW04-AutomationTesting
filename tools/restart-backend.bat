@echo off
REM ==== Khoi dong lai Backend de reset du lieu ve seed data ====
set "ESHOP=E:\just_write_some_code\Software Testing\Seminar\eshop-sut"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
timeout /t 1 /nobreak >nul
start "EShop Backend :3000" cmd /k "cd /d "%ESHOP%\backend" && node server.js"
echo Backend dang khoi dong lai - du lieu da ve trang thai ban dau.
