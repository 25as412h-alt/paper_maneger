-- Paper Manager Database Schema

-- 論文テーブル
CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  pdf_path TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_viewed_at DATETIME
);

-- メモテーブル
CREATE TABLE IF NOT EXISTS memos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- タグテーブル
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id INTEGER NOT NULL,
  tag_name TEXT NOT NULL,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
  UNIQUE(paper_id, tag_name)
);

-- 全文検索インデックス（FTS5）- 論文用
CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts USING fts5(
  paper_id UNINDEXED,
  title,
  authors,
  content,
  tokenize='porter unicode61'
);

-- 全文検索インデックス（FTS5）- メモ用
CREATE VIRTUAL TABLE IF NOT EXISTS memos_fts USING fts5(
  memo_id UNINDEXED,
  content,
  tokenize='porter unicode61'
);

-- 検索履歴テーブル
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  scope TEXT NOT NULL,
  result_count INTEGER,
  searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_papers_created ON papers(created_at);
CREATE INDEX IF NOT EXISTS idx_memos_paper_id ON memos(paper_id);
CREATE INDEX IF NOT EXISTS idx_tags_paper_id ON tags(paper_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(tag_name);