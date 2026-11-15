@echo off
setlocal
REM ==== Khoi dong EShop: Backend (3000), Web (5173), Admin (5174) ====
set "ESHOP=E:\just_write_some_code\Software Testing\Seminar\eshop-sut"

if not exist "%ESHOP%\backend\server.js" (
  echo [LOI] Khong tim thay EShop tai: %ESHOP%
  echo Sua dong "set ESHOP=..." trong file nay cho dung duong dan.
  pause
  exit /b 1
)

start "EShop Backend :3000" cmd /k "cd /d "%ESHOP%\backend" && (if not exist node_modules npm install) && node server.js"
timeout /t 3 /nobreak >nul
start "EShop Web :5173" cmd /k "cd /d "%ESHOP%\frontend-web" && (if not exist node_modules npm install) && npm run dev"
start "EShop Admin :5174" cmd /k "cd /d "%ESHOP%\frontend-admin" && (if not exist node_modules npm install) && npm run dev"

echo.
echo Da mo 3 terminal. Doi vai giay roi mo:
echo   Web   : http://localhost:5173
echo   Admin : http://localhost:5174   (admin@eshop.com / Admin123!)
echo   User  : test@eshop.com / Test1234!
endlocal
