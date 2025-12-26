const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');

let mainWindow;

// データディレクトリ作成
function ensureDataDirectories() {
  const dataDir = path.join(__dirname, 'data');
  const pdfsDir = path.join(dataDir, 'pdfs');
  const backupsDir = path.join(dataDir, 'backups');
  
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir);
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
}

// ウィンドウ作成
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  // 本番環境とdev環境で読み込み先を変更
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile('./public/index.html');
  }

  // 開発ツール
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// アプリ起動
app.whenReady().then(() => {
  ensureDataDirectories();
  db.initDB();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ウィンドウがすべて閉じられたら終了（macOS以外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========== IPC通信ハンドラ ==========

// PDFファイル選択とコピー
ipcMain.handle('file:select-pdf', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  try {
    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    
    // ユニークなファイル名生成（既存ファイルとの衝突回避）
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const destPath = path.join(__dirname, 'data', 'pdfs', uniqueFileName);
    
    // PDFをコピー
    fs.copyFileSync(sourcePath, destPath);
    
    return {
      path: destPath,
      originalName: fileName
    };
  } catch (error) {
    console.error('PDFコピーエラー:', error);
    return null;
  }
});

// PDFを外部アプリで開く
ipcMain.handle('pdf:open', async (event, pdfPath) => {
  try {
    await shell.openPath(pdfPath);
    return { success: true };
  } catch (error) {
    console.error('PDF開くエラー:', error);
    return { success: false, error: error.message };
  }
});

// ========== 論文CRUD ==========

ipcMain.handle('papers:create', async (event, data) => {
  try {
    return await db.papers.create(data);
  } catch (error) {
    console.error('論文作成エラー:', error);
    throw error;
  }
});

ipcMain.handle('papers:findAll', async () => {
  try {
    return await db.papers.findAll();
  } catch (error) {
    console.error('論文取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('papers:findById', async (event, id) => {
  try {
    return await db.papers.findById(id);
  } catch (error) {
    console.error('論文取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('papers:findRecent', async (event, limit) => {
  try {
    return await db.papers.findRecent(limit);
  } catch (error) {
    console.error('最近の論文取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('papers:update', async (event, id, data) => {
  try {
    return await db.papers.update(id, data);
  } catch (error) {
    console.error('論文更新エラー:', error);
    throw error;
  }
});

ipcMain.handle('papers:delete', async (event, id) => {
  try {
    // 論文情報取得
    const paper = await db.papers.findById(id);
    
    // PDFファイル削除
    if (paper && paper.pdf_path && fs.existsSync(paper.pdf_path)) {
      fs.unlinkSync(paper.pdf_path);
    }
    
    // DB削除
    return await db.papers.delete(id);
  } catch (error) {
    console.error('論文削除エラー:', error);
    throw error;
  }
});

// ========== メモCRUD ==========

ipcMain.handle('memos:create', async (event, paperId, content) => {
  try {
    return await db.memos.create(paperId, content);
  } catch (error) {
    console.error('メモ作成エラー:', error);
    throw error;
  }
});

ipcMain.handle('memos:findByPaperId', async (event, paperId) => {
  try {
    return await db.memos.findByPaperId(paperId);
  } catch (error) {
    console.error('メモ取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('memos:update', async (event, id, content) => {
  try {
    return await db.memos.update(id, content);
  } catch (error) {
    console.error('メモ更新エラー:', error);
    throw error;
  }
});

ipcMain.handle('memos:delete', async (event, id) => {
  try {
    return await db.memos.delete(id);
  } catch (error) {
    console.error('メモ削除エラー:', error);
    throw error;
  }
});

// ========== 検索 ==========

ipcMain.handle('search:fullText', async (event, query, scope) => {
  try {
    const results = await db.search.fullText(query, scope);
    
    // 検索履歴保存
    db.search.saveHistory(query, scope, results.length);
    
    return results;
  } catch (error) {
    console.error('検索エラー:', error);
    throw error;
  }
});

ipcMain.handle('search:getHistory', async () => {
  try {
    return await db.search.getHistory();
  } catch (error) {
    console.error('検索履歴取得エラー:', error);
    throw error;
  }
});

// ========== タグ ==========

ipcMain.handle('tags:findAll', async () => {
  try {
    return await db.tags.findAll();
  } catch (error) {
    console.error('タグ取得エラー:', error);
    throw error;
  }
});

ipcMain.handle('tags:findPapersByTag', async (event, tagName) => {
  try {
    return await db.tags.findPapersByTag(tagName);
  } catch (error) {
    console.error('タグで論文検索エラー:', error);
    throw error;
  }
});

// ========== バックアップ ==========

ipcMain.handle('backup:export', async () => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFileName = `papers_${timestamp}.db`;
    const backupPath = path.join(__dirname, 'data', 'backups', backupFileName);
    
    const dbPath = path.join(__dirname, 'data', 'papers.db');
    fs.copyFileSync(dbPath, backupPath);
    
    return { 
      success: true, 
      path: backupPath,
      fileName: backupFileName
    };
  } catch (error) {
    console.error('バックアップエラー:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});