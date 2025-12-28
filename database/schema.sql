-- database/schema.sql - データベーススキーマ定義

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

-- 論文用全文検索インデックス（FTS5）
CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts USING fts5(
  paper_id UNINDEXED,
  title,
  authors,
  content,
  tokenize='porter unicode61'
);

-- メモ用全文検索インデックス（FTS5）
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
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_last_viewed_at ON papers(last_viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_paper_id ON memos(paper_id);
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_paper_id ON tags(paper_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag_name ON tags(tag_name);