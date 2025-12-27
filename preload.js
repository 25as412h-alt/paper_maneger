const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIブリッジ
contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作
  selectPDF: () => ipcRenderer.invoke('file:select-pdf'),
  openPDF: (path) => ipcRenderer.invoke('pdf:open', path),
  
  // 論文操作
  papers: {
    create: (data) => ipcRenderer.invoke('papers:create', data),
    findAll: () => ipcRenderer.invoke('papers:findAll'),
    findById: (id) => ipcRenderer.invoke('papers:findById', id),
    findRecent: (limit) => ipcRenderer.invoke('papers:findRecent', limit),
    update: (id, data) => ipcRenderer.invoke('papers:update', id, data),
    delete: (id) => ipcRenderer.invoke('papers:delete', id)
  },
  
  // メモ操作
  memos: {
    create: (paperId, content) => ipcRenderer.invoke('memos:create', paperId, content),
    findByPaperId: (paperId) => ipcRenderer.invoke('memos:findByPaperId', paperId),
    update: (id, content) => ipcRenderer.invoke('memos:update', id, content),
    delete: (id) => ipcRenderer.invoke('memos:delete', id)
  },
  
  // 検索
  search: {
    fullText: (query, scope) => ipcRenderer.invoke('search:fullText', query, scope),
    getHistory: () => ipcRenderer.invoke('search:getHistory')
  },
  
  // タグ
  tags: {
    findAll: () => ipcRenderer.invoke('tags:findAll'),
    findPapersByTag: (tagName) => ipcRenderer.invoke('tags:findPapersByTag', tagName)
  },
  
  // バックアップ
  backup: {
    export: () => ipcRenderer.invoke('backup:export')
  }
});