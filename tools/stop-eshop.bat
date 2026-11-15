@echo off
REM ==== Tat Backend, Web, Admin theo cong ====
for %%c in (3000 5173 5174) do (
  for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%%c" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
)
echo Da tat EShop (cong 3000, 5173, 5174).
