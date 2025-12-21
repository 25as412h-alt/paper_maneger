const searchRepository = require('../database/repositories/searchRepository');

/**
 * 検索関連のIPCハンドラー登録
 */
function register(ipcMain) {
  // 全体検索
  ipcMain.handle('search:all', async (event, query) => {
    try {
      const startTime = Date.now();
      const results = searchRepository.searchAll(query);
      const duration = Date.now() - startTime;
      
      console.log(`Search completed in ${duration}ms: ${results.total} results`);
      
      return results;
    } catch (error) {
      console.error('search:all error:', error);
      throw error;
    }
  });

  // スコープ指定検索
  ipcMain.handle('search:byScope', async (event, query, scope) => {
    try {
      const startTime = Date.now();
      const results = searchRepository.searchByScope(query, scope);
      const duration = Date.now() - startTime;
      
      console.log(`Scoped search (${scope}) completed in ${duration}ms: ${results.total} results`);
      
      return results;
    } catch (error) {
      console.error('search:byScope error:', error);
      throw error;
    }
  });

  // ファセット情報取得
  ipcMain.handle('search:facets', async (event, query) => {
    try {
      return searchRepository.getFacets(query);
    } catch (error) {
      console.error('search:facets error:', error);
      throw error;
    }
  });

  // 検索履歴取得
  ipcMain.handle('search:getHistory', async (event, limit) => {
    try {
      return searchRepository.getHistory(limit || 10);
    } catch (error) {
      console.error('search:getHistory error:', error);
      throw error;
    }
  });

  // 検索履歴保存
  ipcMain.handle('search:saveHistory', async (event, query, scope, resultCount) => {
    try {
      const id = searchRepository.saveHistory(query, scope, resultCount);
      return { id, success: true };
    } catch (error) {
      console.error('search:saveHistory error:', error);
      throw error;
    }
  });

  // 検索履歴クリア
  ipcMain.handle('search:clearHistory', async (event) => {
    try {
      const changes = searchRepository.clearHistory();
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('search:clearHistory error:', error);
      throw error;
    }
  });
}

module.exports = { register };