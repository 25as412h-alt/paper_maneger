const { processFile } = require('../services/fileProcessor');
const paperRepository = require('../database/repositories/paperRepository');

/**
 * PDF/TXT処理関連のIPCハンドラー登録
 */
function register(ipcMain) {
  // ファイル解析の実行（PDF/TXT対応）
  ipcMain.handle('pdf:process', async (event, paperId) => {
    try {
      console.log(`Starting file processing for paper ${paperId}`);
      
      // 論文情報を取得
      const paper = paperRepository.findById(paperId);
      if (!paper) {
        throw new Error(`Paper ${paperId} not found`);
      }

      // ファイル解析を非同期で実行（結果を待たない）
      processFile(paperId, paper.file_path)
        .then(() => {
          console.log(`File processing completed for paper ${paperId}`);
        })
        .catch(err => {
          console.error(`File processing failed for paper ${paperId}:`, err);
        });

      return { success: true, message: 'File processing started' };
    } catch (error) {
      console.error('pdf:process error:', error);
      throw error;
    }
  });

  // 処理状態の取得
  ipcMain.handle('pdf:getStatus', async (event, paperId) => {
    try {
      const paper = paperRepository.findById(paperId);
      if (!paper) {
        throw new Error(`Paper ${paperId} not found`);
      }

      return {
        status: paper.processing_status,
        isProcessed: paper.is_processed === 1,
        pageCount: paper.page_count
      };
    } catch (error) {
      console.error('pdf:getStatus error:', error);
      throw error;
    }
  });
}

module.exports = { register };