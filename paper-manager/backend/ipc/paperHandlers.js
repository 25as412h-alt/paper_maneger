const paperRepository = require('../database/repositories/paperRepository');

/**
 * 論文関連のIPCハンドラー登録
 */
function register(ipcMain) {
  // 全論文取得
  ipcMain.handle('papers:getAll', async (event, filters) => {
    try {
      return paperRepository.findAll(filters);
    } catch (error) {
      console.error('papers:getAll error:', error);
      throw error;
    }
  });

  // 論文詳細取得
  ipcMain.handle('papers:getById', async (event, id) => {
    try {
      return paperRepository.findById(id);
    } catch (error) {
      console.error('papers:getById error:', error);
      throw error;
    }
  });

  // 論文作成
  ipcMain.handle('papers:create', async (event, paperData) => {
    try {
      const id = paperRepository.create(paperData);
      return { id, success: true };
    } catch (error) {
      console.error('papers:create error:', error);
      throw error;
    }
  });

  // 論文更新
  ipcMain.handle('papers:update', async (event, id, paperData) => {
    try {
      const changes = paperRepository.update(id, paperData);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('papers:update error:', error);
      throw error;
    }
  });

  // 論文削除
  ipcMain.handle('papers:delete', async (event, id) => {
    try {
      const changes = paperRepository.delete(id);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('papers:delete error:', error);
      throw error;
    }
  });

  // 最近追加した論文
  ipcMain.handle('papers:getRecent', async (event, limit) => {
    try {
      return paperRepository.findRecent(limit || 5);
    } catch (error) {
      console.error('papers:getRecent error:', error);
      throw error;
    }
  });

  // 最近参照した論文
  ipcMain.handle('papers:getRecentlyViewed', async (event, limit) => {
    try {
      return paperRepository.findRecentlyViewed(limit || 5);
    } catch (error) {
      console.error('papers:getRecentlyViewed error:', error);
      throw error;
    }
  });

  // 未整理論文
  ipcMain.handle('papers:getUnorganized', async (event, limit) => {
    try {
      return paperRepository.findUnorganized(limit || 5);
    } catch (error) {
      console.error('papers:getUnorganized error:', error);
      throw error;
    }
  });

  // 参照日時更新
  ipcMain.handle('papers:updateViewedAt', async (event, id) => {
    try {
      const changes = paperRepository.updateViewedAt(id);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('papers:updateViewedAt error:', error);
      throw error;
    }
  });

  // タグ追加
  ipcMain.handle('papers:addTag', async (event, paperId, tagName) => {
    try {
      const success = paperRepository.addTag(paperId, tagName);
      return { success };
    } catch (error) {
      console.error('papers:addTag error:', error);
      throw error;
    }
  });

  // タグ削除
  ipcMain.handle('papers:removeTag', async (event, paperId, tagName) => {
    try {
      const changes = paperRepository.removeTag(paperId, tagName);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('papers:removeTag error:', error);
      throw error;
    }
  });

  // タグ一覧取得
  ipcMain.handle('papers:getTags', async (event, paperId) => {
    try {
      return paperRepository.getTags(paperId);
    } catch (error) {
      console.error('papers:getTags error:', error);
      throw error;
    }
  });
}

module.exports = { register };