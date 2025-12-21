@echo off
REM Paper Manager - Startup Script for Windows
REM Version 3.0

echo ================================================
echo  Paper Manager - Research Paper Database
echo  Version 3.0
echo ================================================
echo.

REM カレントディレクトリをスクリプトの場所に設定
cd /d "%~dp0"

REM Node.jsのインストール確認
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js が見つかりません
    echo Node.js をインストールしてください: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 依存関係のインストール確認
if not exist "node_modules" (
    echo [INFO] 初回起動: 依存関係をインストールしています...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] 依存関係のインストールに失敗しました
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] 依存関係のインストールが完了しました
    echo.
)

REM Pythonのインストール確認（PDF処理用）
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Python が見つかりません
    echo PDF処理機能を使用するには Python 3.8+ が必要です
    echo.
)

REM Python依存関係のインストール確認
if exist "python\requirements.txt" (
    if not exist "python\venv" (
        echo [INFO] Python仮想環境をセットアップしています...
        python -m venv python\venv
        call python\venv\Scripts\activate.bat
        pip install -r python\requirements.txt
        echo [SUCCESS] Python環境のセットアップが完了しました
        echo.
    )
)

REM データディレクトリの作成
if not exist "data" mkdir data
if not exist "data\pdfs" mkdir data\pdfs
if not exist "data\figures" mkdir data\figures
if not exist "data\backups" mkdir data\backups

REM ログディレクトリの作成
if not exist "logs" mkdir logs

echo [INFO] Paper Manager を起動しています...
echo.

REM 開発モードで起動
set NODE_ENV=development
call npm start

REM エラーチェック
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] アプリケーションの起動に失敗しました
    echo ログを確認してください: logs\error.log
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Paper Manager を終了しました
pause