const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをレンダラープロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // ============================================
  // 論文操作API
  // ============================================
  papers: {
    // 論文一覧取得
    getAll: (filters) => ipcRenderer.invoke('papers:getAll', filters),
    
    // 論文詳細取得
    getById: (id) => ipcRenderer.invoke('papers:getById', id),
    
    // 論文登録
    create: (paperData) => ipcRenderer.invoke('papers:create', paperData),
    
    // 論文更新
    update: (id, paperData) => ipcRenderer.invoke('papers:update', id, paperData),
    
    // 論文削除
    delete: (id) => ipcRenderer.invoke('papers:delete', id),
    
    // 最近追加した論文
    getRecent: (limit) => ipcRenderer.invoke('papers:getRecent', limit),
    
    // 最近参照した論文
    getRecentlyViewed: (limit) => ipcRenderer.invoke('papers:getRecentlyViewed', limit),
    
    // 未整理論文（メモ0件）
    getUnorganized: (limit) => ipcRenderer.invoke('papers:getUnorganized', limit),
    
    // 参照日時更新
    updateViewedAt: (id) => ipcRenderer.invoke('papers:updateViewedAt', id),
    
    // タグ追加
    addTag: (paperId, tagName) => ipcRenderer.invoke('papers:addTag', paperId, tagName),
    
    // タグ削除
    removeTag: (paperId, tagName) => ipcRenderer.invoke('papers:removeTag', paperId, tagName),
    
    // 論文のタグ一覧
    getTags: (paperId) => ipcRenderer.invoke('papers:getTags', paperId)
  },

  // ============================================
  // メモ操作API
  // ============================================
  memos: {
    // メモ一覧取得（論文別）
    getByPaper: (paperId) => ipcRenderer.invoke('memos:getByPaper', paperId),
    
    // メモ詳細取得
    getById: (id) => ipcRenderer.invoke('memos:getById', id),
    
    // メモ作成
    create: (memoData) => ipcRenderer.invoke('memos:create', memoData),
    
    // メモ更新
    update: (id, memoData) => ipcRenderer.invoke('memos:update', id, memoData),
    
    // メモ削除
    delete: (id) => ipcRenderer.invoke('memos:delete', id),
    
    // 関連メモ取得
    getRelated: (memoId, limit) => ipcRenderer.invoke('memos:getRelated', memoId, limit),
    
    // メモ関連の再計算
    rebuildRelations: (memoId) => ipcRenderer.invoke('memos:rebuildRelations', memoId),
    
    // タグ追加
    addTag: (memoId, tagName) => ipcRenderer.invoke('memos:addTag', memoId, tagName),
    
    // タグ削除
    removeTag: (memoId, tagName) => ipcRenderer.invoke('memos:removeTag', memoId, tagName)
  },

  // ============================================
  // 検索API
  // ============================================
  search: {
    // 全体検索
    searchAll: (query) => ipcRenderer.invoke('search:all', query),
    
    // スコープ指定検索
    searchByScope: (query, scope) => ipcRenderer.invoke('search:byScope', query, scope),
    
    // ファセット検索（種別ごとの件数取得）
    getFacets: (query) => ipcRenderer.invoke('search:facets', query),
    
    // 検索履歴取得
    getHistory: (limit) => ipcRenderer.invoke('search:getHistory', limit),
    
    // 検索履歴保存
    saveHistory: (query, scope, resultCount) => 
      ipcRenderer.invoke('search:saveHistory', query, scope, resultCount),
    
    // 検索履歴削除
    clearHistory: () => ipcRenderer.invoke('search:clearHistory')
  },

  // ============================================
  // ファイル操作API
  // ============================================
  files: {
    // ファイル選択ダイアログ（PDF/TXT対応）
    selectFile: () => ipcRenderer.invoke('files:selectFile'),
    
    // PDFアップロード（後方互換性）
    uploadPDF: (filePath) => ipcRenderer.invoke('files:uploadFile', filePath),
    
    // ファイルアップロード
    uploadFile: (filePath) => ipcRenderer.invoke('files:uploadFile', filePath),
    
    // PDF選択ダイアログ（後方互換性）
    selectPDF: () => ipcRenderer.invoke('files:selectPDF'),
    
    // ファイルパス取得
    getFilePath: (paperId) => ipcRenderer.invoke('files:getFilePath', paperId),
    
    // PDFパス取得（後方互換性）
    getPDFPath: (paperId) => ipcRenderer.invoke('files:getPDFPath', paperId),
    
    // PDFをバッファとして読み込み
    readPDFAsBuffer: (filePath) => ipcRenderer.invoke('files:readPDFAsBuffer', filePath),
    
    // テキストファイル読み込み
    readTextFile: (filePath) => ipcRenderer.invoke('files:readTextFile', filePath),
    
    // 図表パス取得
    getFigurePath: (figureId) => ipcRenderer.invoke('files:getFigurePath', figureId),
    
    // データバックアップ
    createBackup: () => ipcRenderer.invoke('files:createBackup'),
    
    // バックアップ復元
    restoreBackup: (backupPath) => ipcRenderer.invoke('files:restoreBackup', backupPath)
  },

  // ============================================
  // 章・図表API
  // ============================================
  chapters: {
    // 章一覧取得
    getByPaper: (paperId) => ipcRenderer.invoke('chapters:getByPaper', paperId),
    
    // 章作成
    create: (chapterData) => ipcRenderer.invoke('chapters:create', chapterData),
    
    // 章更新
    update: (id, chapterData) => ipcRenderer.invoke('chapters:update', id, chapterData),
    
    // 章削除
    delete: (id) => ipcRenderer.invoke('chapters:delete', id)
  },

  figures: {
    // 図表一覧取得
    getByPaper: (paperId) => ipcRenderer.invoke('figures:getByPaper', paperId),
    
    // 図表作成
    create: (figureData) => ipcRenderer.invoke('figures:create', figureData),
    
    // 図表更新
    update: (id, figureData) => ipcRenderer.invoke('figures:update', id, figureData),
    
    // 図表削除
    delete: (id) => ipcRenderer.invoke('figures:delete', id)
  },

  // ============================================
  // タグAPI
  // ============================================
  tags: {
    // 全タグ取得（論文数付き）
    getAll: () => ipcRenderer.invoke('tags:getAll'),
    
    // タグ別論文数
    getCount: (tagName) => ipcRenderer.invoke('tags:getCount', tagName),
    
    // タグで論文検索
    searchPapers: (tagName) => ipcRenderer.invoke('tags:searchPapers', tagName)
  },

  // ============================================
  // PDF処理API
  // ============================================
  pdf: {
    // PDF解析の実行
    processPDF: (paperId) => ipcRenderer.invoke('pdf:process', paperId),
    
    // 処理状態の取得
    getProcessingStatus: (paperId) => ipcRenderer.invoke('pdf:getStatus', paperId)
  },

  // ============================================
  // ダッシュボードAPI
  // ============================================
  dashboard: {
    // ダッシュボードデータ取得
    getData: () => ipcRenderer.invoke('dashboard:getData')
  }
});