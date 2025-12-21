// ============================================
// backend/ipc/fileHandlers.js
// ============================================
// データバックアップ
const fileRepository = require('../database/repositories/fileRepository');
function register(ipcMain) {    
  ipcMain.handle('files:createBackup', async (event) => {
    try {
      const { createBackup } = require('../database/db');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}.db`;
      const backupPath = path.join(app.getPath('userData'), 'data', 'backups', backupFileName);

      await createBackup(backupPath);
      return { success: true, path: backupPath };
    } catch (error) {
      console.error('files:createBackup error:', error);
      throw error;
    }
  });

  // バックアップ復元
  ipcMain.handle('files:restoreBackup', async (event, backupPath) => {
    try {
      const dbPath = path.join(app.getPath('userData'), 'data', 'papers.db');
      
      // 現在のDBをバックアップ
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentBackup = path.join(app.getPath('userData'), 'data', 'backups', `before_restore_${timestamp}.db`);
      await fs.copyFile(dbPath, currentBackup);

      // バックアップを復元
      await fs.copyFile(backupPath, dbPath);

      return { success: true, message: 'Backup restored successfully' };
    } catch (error) {
      console.error('files:restoreBackup error:', error);
      throw error;
    }
  });

const path = require('path');
const fs = require('fs').promises;
}

function register(ipcMain) {
  // PDF選択ダイアログ
  ipcMain.handle('files:selectPDF', async (event) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (result.canceled) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      console.error('files:selectPDF error:', error);
      throw error;
    }
  });

  // PDFアップロード（ファイルコピー）
  ipcMain.handle('files:uploadPDF', async (event, sourcePath) => {
    try {
      // ファイル名生成
      const timestamp = Date.now();
      const fileName = `${timestamp}_${path.basename(sourcePath)}`;
      const destPath = path.join(app.getPath('userData'), 'data', 'pdfs', fileName);

      // ファイルコピー
      await fs.copyFile(sourcePath, destPath);

      return destPath;
    } catch (error) {
      console.error('files:uploadPDF error:', error);
      throw error;
    }
  });

  // PDFパス取得
  ipcMain.handle('files:getPDFPath', async (event, paperId) => {
    try {
      const paperRepository = require('../database/repositories/paperRepository');
      const paper = paperRepository.findById(paperId);
      return paper ? paper.pdf_path : null;
    } catch (error) {
      console.error('files:getPDFPath error:', error);
      throw error;
    }
  });

  // PDFをバッファとして読み込み（PDF.js用）
  ipcMain.handle('files:readPDFAsBuffer', async (event, filePath) => {
    try {
      const fileData = await fs.readFile(filePath);
      // ArrayBufferに変換
      return new Uint8Array(fileData);
    } catch (error) {
      console.error('files:readPDFAsBuffer error:', error);
      throw error;
    }
  });
}

module.exports = { register };

// ============================================
// backend/ipc/dashboardHandlers.js
// （main.jsに追記する用）
// ============================================
/*
const dashboardHandlers = require('../backend/ipc/dashboardHandlers');
dashboardHandlers.register(ipcMain);
*/

// ファイル内容:
const paperRepository = require('../database/repositories/paperRepository');

function registerDashboard(ipcMain) {
  ipcMain.handle('dashboard:getData', async (event) => {
    try {
      const data = {
        recentPapers: paperRepository.findRecent(5),
        recentlyViewed: paperRepository.findRecentlyViewed(5),
        unorganized: paperRepository.findUnorganized(5),
        tags: paperRepository.getAllTags().slice(0, 10)
      };

      return data;
    } catch (error) {
      console.error('dashboard:getData error:', error);
      throw error;
    }
  });

  // タグ関連
  ipcMain.handle('tags:getAll', async (event) => {
    try {
      return paperRepository.getAllTags();
    } catch (error) {
      console.error('tags:getAll error:', error);
      throw error;
    }
  });

  ipcMain.handle('tags:searchPapers', async (event, tagName) => {
    try {
      return paperRepository.findByTag(tagName);
    } catch (error) {
      console.error('tags:searchPapers error:', error);
      throw error;
    }
  });
}

module.exports = { register: registerDashboard };