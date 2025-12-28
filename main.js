// main.js - Electronメインプロセス
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database/db');

let mainWindow;
let db;

// データディレクトリの初期化
function initializeDataDirectories() {
  console.log('[MAIN] データディレクトリを初期化中...');
  
  const dataDir = path.join(__dirname, 'data');
  const pdfsDir = path.join(dataDir, 'pdfs');
  const backupsDir = path.join(dataDir, 'backups');
  
  [dataDir, pdfsDir, backupsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[MAIN] ディレクトリ作成: ${dir}`);
    }
  });
  
  console.log('[MAIN] データディレクトリ初期化完了');
}

// メインウィンドウの作成
function createWindow() {
  console.log('[MAIN] メインウィンドウを作成中...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a1a',
    show: false
  });

  // 開発環境ではローカルサーバー、本番ではビルドされたファイル
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.once('ready-to-show', () => {
    console.log('[MAIN] ウィンドウ表示準備完了');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('[MAIN] メインウィンドウ作成完了');
}

// メニューの設定
function createMenu() {
  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: 'データをエクスポート',
          click: async () => {
            try {
              const result = await exportDatabase();
              if (result.success) {
                shell.showItemInFolder(result.path);
              }
            } catch (error) {
              console.error('[MAIN] エクスポートエラー:', error);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit', label: '終了' }
      ]
    },
    {
      label: '編集',
      submenu: [
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload', label: '再読み込み' },
        { role: 'toggleDevTools', label: '開発者ツール' },
        { type: 'separator' },
        { role: 'resetZoom', label: '実際のサイズ' },
        { role: 'zoomIn', label: '拡大' },
        { role: 'zoomOut', label: '縮小' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  console.log('[MAIN] メニュー設定完了');
}

// データベースのエクスポート
async function exportDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(__dirname, 'data', 'backups', `papers_${timestamp}.db`);
    const sourcePath = path.join(__dirname, 'data', 'papers.db');
    
    console.log(`[MAIN] データベースをエクスポート中: ${backupPath}`);
    
    fs.copyFileSync(sourcePath, backupPath);
    
    console.log('[MAIN] エクスポート完了');
    return { success: true, path: backupPath };
  } catch (error) {
    console.error('[MAIN] エクスポートエラー:', error);
    throw error;
  }
}

// IPC通信ハンドラー

// 論文登録
ipcMain.handle('paper:add', async (event, paperData) => {
  console.log('[IPC] 論文登録リクエスト:', paperData.title);
  
  try {
    // PDFファイルのコピー
    const pdfFileName = `${Date.now()}_${path.basename(paperData.pdfPath)}`;
    const destPath = path.join(__dirname, 'data', 'pdfs', pdfFileName);
    
    console.log(`[IPC] PDFコピー: ${paperData.pdfPath} -> ${destPath}`);
    fs.copyFileSync(paperData.pdfPath, destPath);
    
    // データベースに登録
    const paper = {
      title: paperData.title,
      authors: paperData.authors || '',
      year: paperData.year || null,
      pdf_path: destPath,
      content: paperData.content
    };
    
    const paperId = await db.addPaper(paper);
    console.log(`[IPC] 論文登録完了: ID=${paperId}`);
    
    // タグの登録
    if (paperData.tags && paperData.tags.length > 0) {
      console.log(`[IPC] タグ登録: ${paperData.tags.join(', ')}`);
      await db.addTags(paperId, paperData.tags);
    }
    
    return { success: true, paperId };
  } catch (error) {
    console.error('[IPC] 論文登録エラー:', error);
    return { success: false, error: error.message };
  }
});

// 論文一覧取得
ipcMain.handle('paper:list', async (event, filters) => {
  console.log('[IPC] 論文一覧取得:', filters);
  
  try {
    const papers = await db.getPapers(filters);
    console.log(`[IPC] 取得完了: ${papers.length}件`);
    return { success: true, papers };
  } catch (error) {
    console.error('[IPC] 論文一覧取得エラー:', error);
    return { success: false, error: error.message };
  }
});

// 論文詳細取得
ipcMain.handle('paper:get', async (event, paperId) => {
  console.log(`[IPC] 論文詳細取得: ID=${paperId}`);
  
  try {
    const paper = await db.getPaperById(paperId);
    console.log('[IPC] 取得完了');
    return { success: true, paper };
  } catch (error) {
    console.error('[IPC] 論文詳細取得エラー:', error);
    return { success: false, error: error.message };
  }
});

// 論文更新
ipcMain.handle('paper:update', async (event, paperId, updates) => {
  console.log(`[IPC] 論文更新: ID=${paperId}`);
  
  try {
    await db.updatePaper(paperId, updates);
    console.log('[IPC] 更新完了');
    return { success: true };
  } catch (error) {
    console.error('[IPC] 論文更新エラー:', error);
    return { success: false, error: error.message };
  }
});

// 論文削除
ipcMain.handle('paper:delete', async (event, paperId) => {
  console.log(`[IPC] 論文削除: ID=${paperId}`);
  
  try {
    const paper = await db.getPaperById(paperId);
    
    // PDFファイルの削除
    if (paper && fs.existsSync(paper.pdf_path)) {
      fs.unlinkSync(paper.pdf_path);
      console.log(`[IPC] PDFファイル削除: ${paper.pdf_path}`);
    }
    
    await db.deletePaper(paperId);
    console.log('[IPC] 削除完了');
    return { success: true };
  } catch (error) {
    console.error('[IPC] 論文削除エラー:', error);
    return { success: false, error: error.message };
  }
});

// PDF表示
ipcMain.handle('pdf:open', async (event, pdfPath) => {
  console.log(`[IPC] PDF表示: ${pdfPath}`);
  
  try {
    await shell.openPath(pdfPath);
    console.log('[IPC] PDF表示完了');
    return { success: true };
  } catch (error) {
    console.error('[IPC] PDF表示エラー:', error);
    return { success: false, error: error.message };
  }
});

// 検索
ipcMain.handle('search:query', async (event, query, scope) => {
  console.log(`[IPC] 検索: "${query}" (scope: ${scope})`);
  
  try {
    const results = await db.search(query, scope);
    console.log(`[IPC] 検索完了: ${results.length}件`);
    return { success: true, results };
  } catch (error) {
    console.error('[IPC] 検索エラー:', error);
    return { success: false, error: error.message };
  }
});

// メモ追加
ipcMain.handle('memo:add', async (event, paperId, content) => {
  console.log(`[IPC] メモ追加: Paper ID=${paperId}`);
  
  try {
    const memoId = await db.addMemo(paperId, content);
    console.log(`[IPC] メモ追加完了: ID=${memoId}`);
    return { success: true, memoId };
  } catch (error) {
    console.error('[IPC] メモ追加エラー:', error);
    return { success: false, error: error.message };
  }
});

// メモ一覧取得
ipcMain.handle('memo:list', async (event, paperId) => {
  console.log(`[IPC] メモ一覧取得: Paper ID=${paperId}`);
  
  try {
    const memos = await db.getMemos(paperId);
    console.log(`[IPC] 取得完了: ${memos.length}件`);
    return { success: true, memos };
  } catch (error) {
    console.error('[IPC] メモ一覧取得エラー:', error);
    return { success: false, error: error.message };
  }
});

// メモ更新
ipcMain.handle('memo:update', async (event, memoId, content) => {
  console.log(`[IPC] メモ更新: ID=${memoId}`);
  
  try {
    await db.updateMemo(memoId, content);
    console.log('[IPC] 更新完了');
    return { success: true };
  } catch (error) {
    console.error('[IPC] メモ更新エラー:', error);
    return { success: false, error: error.message };
  }
});

// メモ削除
ipcMain.handle('memo:delete', async (event, memoId) => {
  console.log(`[IPC] メモ削除: ID=${memoId}`);
  
  try {
    await db.deleteMemo(memoId);
    console.log('[IPC] 削除完了');
    return { success: true };
  } catch (error) {
    console.error('[IPC] メモ削除エラー:', error);
    return { success: false, error: error.message };
  }
});

// タグ一覧取得
ipcMain.handle('tag:list', async () => {
  console.log('[IPC] タグ一覧取得');
  
  try {
    const tags = await db.getAllTags();
    console.log(`[IPC] 取得完了: ${tags.length}件`);
    return { success: true, tags };
  } catch (error) {
    console.error('[IPC] タグ一覧取得エラー:', error);
    return { success: false, error: error.message };
  }
});

// ダッシュボードデータ取得
ipcMain.handle('dashboard:data', async () => {
  console.log('[IPC] ダッシュボードデータ取得');
  
  try {
    const recentPapers = await db.getRecentPapers(5);
    const tags = await db.getAllTags();
    
    console.log('[IPC] ダッシュボードデータ取得完了');
    return { 
      success: true, 
      data: { 
        recentPapers, 
        tags 
      } 
    };
  } catch (error) {
    console.error('[IPC] ダッシュボードデータ取得エラー:', error);
    return { success: false, error: error.message };
  }
});

// アプリケーション起動
app.whenReady().then(() => {
  console.log('[MAIN] アプリケーション起動開始');
  console.log(`[MAIN] 環境: ${process.env.NODE_ENV || 'production'}`);
  console.log(`[MAIN] アプリパス: ${__dirname}`);
  
  initializeDataDirectories();
  
  // データベース初期化
  const dbPath = path.join(__dirname, 'data', 'papers.db');
  console.log(`[MAIN] データベース初期化: ${dbPath}`);
  db = new Database(dbPath);
  
  createWindow();
  createMenu();
  
  console.log('[MAIN] アプリケーション起動完了');
});

app.on('window-all-closed', () => {
  console.log('[MAIN] 全ウィンドウクローズ');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('[MAIN] アクティベート');
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('[MAIN] アプリケーション終了処理開始');
  if (db) {
    db.close();
    console.log('[MAIN] データベースクローズ完了');
  }
});