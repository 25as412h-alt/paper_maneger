const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

// ====================================
// 1. バッチファイル相当の事前チェック
// ====================================

console.log('====================================');
console.log('   Paper Manager 起動中...');
console.log('====================================\n');

// 実行ディレクトリの取得 (cd /d %~dp0 相当)
const baseDir = __dirname;

// node_modules の存在確認
const nodeModulesPath = path.join(baseDir, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    // ターミナルへの警告
    console.error('[警告] node_modules が見つかりません');
    console.error('npm install を実行してください');

    // ユーザーに GUI で通知 (オプション)
    app.whenReady().then(() => {
        dialog.showErrorBox(
            '依存関係エラー',
            'node_modules が見つかりません。npm install を実行してください。'
        );
        app.quit();
    });
} else {
    // 通常の Electron 起動処理へ
    console.log('[起動] Electron を起動しています...');
    createWindow();
}

// ====================================
// 2. 通常の Electron 処理
// ====================================

function createWindow() {
    // ウィンドウ作成のコード（既存のもの）
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

// node_modules がある場合のみ実行されるイベント
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});