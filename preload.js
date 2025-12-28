// preload.js - レンダラープロセスとメインプロセス間のブリッジ
const { contextBridge, ipcRenderer } = require('electron');

console.log('[PRELOAD] プリロードスクリプト実行開始');

// セキュアなAPIをウィンドウに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // 論文関連
  paper: {
    add: (paperData) => {
      console.log('[PRELOAD] paper.add:', paperData.title);
      return ipcRenderer.invoke('paper:add', paperData);
    },
    list: (filters) => {
      console.log('[PRELOAD] paper.list:', filters);
      return ipcRenderer.invoke('paper:list', filters);
    },
    get: (paperId) => {
      console.log('[PRELOAD] paper.get:', paperId);
      return ipcRenderer.invoke('paper:get', paperId);
    },
    update: (paperId, updates) => {
      console.log('[PRELOAD] paper.update:', paperId);
      return ipcRenderer.invoke('paper:update', paperId, updates);
    },
    delete: (paperId) => {
      console.log('[PRELOAD] paper.delete:', paperId);
      return ipcRenderer.invoke('paper:delete', paperId);
    }
  },

  // PDF関連
  pdf: {
    open: (pdfPath) => {
      console.log('[PRELOAD] pdf.open:', pdfPath);
      return ipcRenderer.invoke('pdf:open', pdfPath);
    },
    selectFile: () => {
      console.log('[PRELOAD] pdf.selectFile');
      return ipcRenderer.invoke('pdf:selectFile');
    }
  },

  // 検索関連
  search: {
    query: (query, scope) => {
      console.log('[PRELOAD] search.query:', query, scope);
      return ipcRenderer.invoke('search:query', query, scope);
    }
  },

  // メモ関連
  memo: {
    add: (paperId, content) => {
      console.log('[PRELOAD] memo.add:', paperId);
      return ipcRenderer.invoke('memo:add', paperId, content);
    },
    list: (paperId) => {
      console.log('[PRELOAD] memo.list:', paperId);
      return ipcRenderer.invoke('memo:list', paperId);
    },
    update: (memoId, content) => {
      console.log('[PRELOAD] memo.update:', memoId);
      return ipcRenderer.invoke('memo:update', memoId, content);
    },
    delete: (memoId) => {
      console.log('[PRELOAD] memo.delete:', memoId);
      return ipcRenderer.invoke('memo:delete', memoId);
    }
  },

  // タグ関連
  tag: {
    list: () => {
      console.log('[PRELOAD] tag.list');
      return ipcRenderer.invoke('tag:list');
    }
  },

  // ダッシュボード関連
  dashboard: {
    getData: () => {
      console.log('[PRELOAD] dashboard.getData');
      return ipcRenderer.invoke('dashboard:data');
    }
  }
});

console.log('[PRELOAD] プリロードスクリプト実行完了');