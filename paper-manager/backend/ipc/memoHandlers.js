const memoRepository = require('../database/repositories/memoRepository');
const { buildMemoRelations } = require('../services/memoRelationBuilder');

/**
 * メモ関連のIPCハンドラー登録
 */
function register(ipcMain) {
  // 論文のメモ一覧取得
  ipcMain.handle('memos:getByPaper', async (event, paperId) => {
    try {
      return memoRepository.findByPaper(paperId);
    } catch (error) {
      console.error('memos:getByPaper error:', error);
      throw error;
    }
  });

  // メモ詳細取得
  ipcMain.handle('memos:getById', async (event, id) => {
    try {
      return memoRepository.findById(id);
    } catch (error) {
      console.error('memos:getById error:', error);
      throw error;
    }
  });

  // メモ作成
  ipcMain.handle('memos:create', async (event, memoData) => {
    try {
      const id = memoRepository.create(memoData);
      
      // 関連メモの再計算
      await buildMemoRelations(id);
      
      return { id, success: true };
    } catch (error) {
      console.error('memos:create error:', error);
      throw error;
    }
  });

  // メモ更新
  ipcMain.handle('memos:update', async (event, id, memoData) => {
    try {
      const changes = memoRepository.update(id, memoData);
      
      // 内容が変更された場合、関連メモを再計算
      if (memoData.content !== undefined) {
        await buildMemoRelations(id);
      }
      
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('memos:update error:', error);
      throw error;
    }
  });

  // メモ削除
  ipcMain.handle('memos:delete', async (event, id) => {
    try {
      // 関連も削除
      memoRepository.deleteRelations(id);
      const changes = memoRepository.delete(id);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('memos:delete error:', error);
      throw error;
    }
  });

  // 関連メモ取得
  ipcMain.handle('memos:getRelated', async (event, memoId, limit) => {
    try {
      return memoRepository.getRelated(memoId, limit || 10);
    } catch (error) {
      console.error('memos:getRelated error:', error);
      throw error;
    }
  });

  // メモ関連の再計算
  ipcMain.handle('memos:rebuildRelations', async (event, memoId) => {
    try {
      await buildMemoRelations(memoId);
      return { success: true };
    } catch (error) {
      console.error('memos:rebuildRelations error:', error);
      throw error;
    }
  });

  // タグ追加
  ipcMain.handle('memos:addTag', async (event, memoId, tagName) => {
    try {
      const success = memoRepository.addTag(memoId, tagName);
      return { success };
    } catch (error) {
      console.error('memos:addTag error:', error);
      throw error;
    }
  });

  // タグ削除
  ipcMain.handle('memos:removeTag', async (event, memoId, tagName) => {
    try {
      const changes = memoRepository.removeTag(memoId, tagName);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('memos:removeTag error:', error);
      throw error;
    }
  });
}

module.exports = { register };