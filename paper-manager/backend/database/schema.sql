-- Paper Manager Database Schema v3.0
-- SQLite 3.x with FTS5 Support

-- ============================================
-- 論文テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT,
    year INTEGER,
    doi TEXT,
    file_path TEXT NOT NULL UNIQUE,
    file_type TEXT DEFAULT 'pdf', -- 'pdf' or 'txt'
    pdf_hash TEXT,
    page_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_viewed_at DATETIME,
    memo_count INTEGER DEFAULT 0,
    is_processed BOOLEAN DEFAULT 0,
    processing_status TEXT DEFAULT 'pending' -- pending, processing, completed, failed
);

CREATE INDEX idx_papers_created ON papers(created_at DESC);
CREATE INDEX idx_papers_viewed ON papers(last_viewed_at DESC);
CREATE INDEX idx_papers_year ON papers(year);
CREATE INDEX idx_papers_file_type ON papers(file_type);

-- ============================================
-- 章テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    page_start INTEGER,
    page_end INTEGER,
    chapter_number INTEGER,
    is_auto_extracted BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE INDEX idx_chapters_paper ON chapters(paper_id);

-- ============================================
-- 図表テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS figures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    figure_number TEXT,
    caption TEXT,
    image_path TEXT,
    page_number INTEGER,
    figure_type TEXT, -- figure, table, equation
    is_auto_extracted BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE INDEX idx_figures_paper ON figures(paper_id);
CREATE INDEX idx_figures_page ON figures(page_number);

-- ============================================
-- メモテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    page_range TEXT, -- e.g., "5-7"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE INDEX idx_memos_paper ON memos(paper_id);
CREATE INDEX idx_memos_created ON memos(created_at DESC);
CREATE INDEX idx_memos_updated ON memos(updated_at DESC);

-- ============================================
-- メモタグテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS memo_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memo_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE,
    UNIQUE(memo_id, tag_name)
);

CREATE INDEX idx_memo_tags_memo ON memo_tags(memo_id);
CREATE INDEX idx_memo_tags_tag ON memo_tags(tag_name);

-- ============================================
-- 論文タグテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS paper_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    UNIQUE(paper_id, tag_name)
);

CREATE INDEX idx_paper_tags_paper ON paper_tags(paper_id);
CREATE INDEX idx_paper_tags_tag ON paper_tags(tag_name);

-- ============================================
-- メモ関連テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS memo_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memo_id INTEGER NOT NULL,
    related_memo_id INTEGER NOT NULL,
    common_terms TEXT, -- "attention, transformer, layer"
    score INTEGER DEFAULT 0, -- 共通語数
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE,
    FOREIGN KEY (related_memo_id) REFERENCES memos(id) ON DELETE CASCADE,
    UNIQUE(memo_id, related_memo_id),
    CHECK(memo_id != related_memo_id)
);

CREATE INDEX idx_memo_relations_memo ON memo_relations(memo_id, score DESC);
CREATE INDEX idx_memo_relations_related ON memo_relations(related_memo_id);

-- ============================================
-- 検索履歴テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    scope TEXT NOT NULL, -- all, title_author, memo, content, figure
    result_count INTEGER DEFAULT 0,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_searched ON search_history(searched_at DESC);

-- ============================================
-- ページテキストテーブル（PDF全文保存）
-- ============================================
CREATE TABLE IF NOT EXISTS page_texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    content TEXT,
    extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    UNIQUE(paper_id, page_number)
);

CREATE INDEX idx_page_texts_paper ON page_texts(paper_id, page_number);

-- ============================================
-- トリガー: メモ数の自動更新
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_memo_count_insert
AFTER INSERT ON memos
BEGIN
    UPDATE papers 
    SET memo_count = memo_count + 1 
    WHERE id = NEW.paper_id;
END;

CREATE TRIGGER IF NOT EXISTS update_memo_count_delete
AFTER DELETE ON memos
BEGIN
    UPDATE papers 
    SET memo_count = memo_count - 1 
    WHERE id = OLD.paper_id;
END;

-- ============================================
-- トリガー: メモ更新日時の自動更新
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_memos_updated_at
AFTER UPDATE ON memos
BEGIN
    UPDATE memos 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- ============================================
-- ビュー: タグ別論文数
-- ============================================
CREATE VIEW IF NOT EXISTS tag_counts AS
SELECT 
    tag_name,
    COUNT(*) as paper_count
FROM paper_tags
GROUP BY tag_name
ORDER BY paper_count DESC;

-- ============================================
-- ビュー: 最近の活動
-- ============================================
CREATE VIEW IF NOT EXISTS recent_activity AS
SELECT 
    'paper' as type,
    p.id,
    p.title as title,
    p.created_at as timestamp
FROM papers p
UNION ALL
SELECT 
    'memo' as type,
    m.id,
    substr(m.content, 1, 50) as title,
    m.created_at as timestamp
FROM memos m
ORDER BY timestamp DESC
LIMIT 100;