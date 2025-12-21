const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// データベース初期化
const { initializeDatabase } = require('../backend/database/db');

// IPCハンドラー読み込み
const paperHandlers = require('../backend/ipc/paperHandlers');
const memoHandlers = require('../backend/ipc/memoHandlers');
const searchHandlers = require('../backend/ipc/searchHandlers');
const fileHandlers = require('../backend/ipc/fileHandlers');
const chapterHandlers = require('../backend/ipc/chapterHandlers');
const figureHandlers = require('../backend/ipc/figureHandlers');
const dashboardHandlers = require('../backend/ipc/dashboardHandlers');
const pdfHandlers = require('../backend/ipc/pdfHandlers');

let mainWindow;

// データディレクトリの確保
function ensureDataDirectory() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  const dirs = [
    dataDir,
    path.join(dataDir, 'pdfs'),
    path.join(dataDir, 'figures'),
    path.join(dataDir, 'backups')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return dataDir;
}

// メインウィンドウの作成
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  // 開発環境ではlocalhost、本番環境ではビルドファイル
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // 開発環境ではDevToolsを開く
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// アプリケーション初期化
app.whenReady().then(async () => {
  try {
    // データディレクトリ作成
    const dataDir = ensureDataDirectory();
    console.log('Data directory:', dataDir);

    // データベース初期化
    await initializeDatabase(dataDir);
    console.log('Database initialized');

    // IPCハンドラー登録
    paperHandlers.register(ipcMain);
    memoHandlers.register(ipcMain);
    searchHandlers.register(ipcMain);
    fileHandlers.register(ipcMain);
    chapterHandlers.register(ipcMain);
    figureHandlers.register(ipcMain);
    dashboardHandlers.register(ipcMain);
    pdfHandlers.register(ipcMain);
    console.log('IPC handlers registered');

    // ウィンドウ作成
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});

// すべてのウィンドウが閉じられたとき
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリケーション終了前の処理
app.on('before-quit', async () => {
  console.log('Application shutting down...');
  // データベース接続のクローズなど
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});