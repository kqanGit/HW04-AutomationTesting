@echo off
setlocal
REM ==== HW04 one-time setup: install Playwright, create the git repo, first commit, push ====
cd /d "%~dp0.."
set "REPO=kqanGit/HW04-AutomationTesting"
set "REMOTE=git@main_acc:%REPO%.git"
set "NEWURL=https://github.com/new?name=HW04-AutomationTesting&visibility=public&description=HW04+-+Automation+Testing+on+EShop"

echo.
echo [1/5] npm install
call npm install
if errorlevel 1 goto :err

echo.
echo [2/5] Installing Chromium, Firefox, WebKit
call npx playwright install chromium firefox webkit
if errorlevel 1 goto :err

echo.
echo [3/5] Checking the installation
call npx playwright --version
if errorlevel 1 goto :err

echo.
echo [4/5] git init + first commit
if not exist ".git" git init -b main
git config user.name "kqanGit"
git config user.email "bmquan.gd@gmail.com"
git add -A
git commit -m "Scaffold HW04 automation project: Playwright config, 9-run runner, helpers, report templates"
git remote get-url origin >nul 2>&1
if errorlevel 1 git remote add origin %REMOTE%

echo.
echo [5/5] GitHub repository + push
git ls-remote origin >nul 2>&1
if not errorlevel 1 goto :push

where gh >nul 2>&1
if errorlevel 1 goto :browser
call gh repo create %REPO% --public --description "HW04 - Automation Testing on EShop (Software Testing, HCMUS)"
git ls-remote origin >nul 2>&1
if not errorlevel 1 goto :push

:browser
echo The repository %REPO% does not exist yet.
echo Opening GitHub in your browser: click "Create repository" (leave README / .gitignore unchecked).
start "" "%NEWURL%"
echo When the repository is created, come back here and
pause

:push
git push -u origin main
if errorlevel 1 goto :err

echo.
echo ===== DONE =====
echo Repository: https://github.com/%REPO%
pause
exit /b 0

:err
echo.
echo ===== FAILED at the step above. Copy the error text and send it to Claude. =====
pause
exit /b 1
