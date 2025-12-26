@echo off
chcp 65001 > nul
echo ====================================
echo   Paper Manager 起動中...
echo ====================================
echo.

cd /d %~dp0

if not exist node_modules (
    echo [警告] node_modules が見つかりません
    echo npm install を実行してください
    pause
    exit
)

echo [起動] Electron を起動しています...
npm start

pause