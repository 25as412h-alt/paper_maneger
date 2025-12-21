// ============================================
// chapterHandlers.js
// ============================================
const chapterRepository = require('../database/repositories/chapterRepository');

function register(ipcMain) {
  ipcMain.handle('chapters:getByPaper', async (event, paperId) => {
    try {
      return chapterRepository.findByPaper(paperId);
    } catch (error) {
      console.error('chapters:getByPaper error:', error);
      throw error;
    }
  });

  ipcMain.handle('chapters:create', async (event, chapterData) => {
    try {
      const id = chapterRepository.create(chapterData);
      return { id, success: true };
    } catch (error) {
      console.error('chapters:create error:', error);
      throw error;
    }
  });

  ipcMain.handle('chapters:update', async (event, id, chapterData) => {
    try {
      const changes = chapterRepository.update(id, chapterData);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('chapters:update error:', error);
      throw error;
    }
  });

  ipcMain.handle('chapters:delete', async (event, id) => {
    try {
      const changes = chapterRepository.delete(id);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('chapters:delete error:', error);
      throw error;
    }
  });
}

module.exports = { register };

// ============================================
// figureHandlers.js
// ============================================
const figureRepository = require('../database/repositories/figureRepository');

function registerFigure(ipcMain) {
  ipcMain.handle('figures:getByPaper', async (event, paperId) => {
    try {
      return figureRepository.findByPaper(paperId);
    } catch (error) {
      console.error('figures:getByPaper error:', error);
      throw error;
    }
  });

  ipcMain.handle('figures:create', async (event, figureData) => {
    try {
      const id = figureRepository.create(figureData);
      return { id, success: true };
    } catch (error) {
      console.error('figures:create error:', error);
      throw error;
    }
  });

  ipcMain.handle('figures:update', async (event, id, figureData) => {
    try {
      const changes = figureRepository.update(id, figureData);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('figures:update error:', error);
      throw error;
    }
  });

  ipcMain.handle('figures:delete', async (event, id) => {
    try {
      const changes = figureRepository.delete(id);
      return { changes, success: changes > 0 };
    } catch (error) {
      console.error('figures:delete error:', error);
      throw error;
    }
  });
}

module.exports = { register: registerFigure };