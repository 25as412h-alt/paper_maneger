-- FTS5 Full-Text Search Setup for Paper Manager
-- SQLite 3.x FTS5 Extension Required

-- ============================================
-- 論文全文検索テーブル
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts USING fts5(
    paper_id UNINDEXED,
    title,
    authors,
    content,
    tokenize = 'porter unicode61'
);

-- ============================================
-- メモ全文検索テーブル
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS memos_fts USING fts5(
    memo_id UNINDEXED,
    content,
    tokenize = 'porter unicode61'
);

-- ============================================
-- 章全文検索テーブル
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS chapters_fts USING fts5(
    chapter_id UNINDEXED,
    paper_id UNINDEXED,
    title,
    content,
    tokenize = 'porter unicode61'
);

-- ============================================
-- 図表全文検索テーブル
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS figures_fts USING fts5(
    figure_id UNINDEXED,
    paper_id UNINDEXED,
    caption,
    tokenize = 'porter unicode61'
);

-- ============================================
-- トリガー: 論文FTS同期（INSERT）
-- ============================================
CREATE TRIGGER IF NOT EXISTS papers_fts_insert
AFTER INSERT ON papers
BEGIN
    INSERT INTO papers_fts(paper_id, title, authors, content)
    VALUES (NEW.id, NEW.title, NEW.authors, '');
END;

-- ============================================
-- トリガー: 論文FTS同期（UPDATE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS papers_fts_update
AFTER UPDATE ON papers
BEGIN
    UPDATE papers_fts 
    SET title = NEW.title, authors = NEW.authors
    WHERE paper_id = NEW.id;
END;

-- ============================================
-- トリガー: 論文FTS同期（DELETE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS papers_fts_delete
AFTER DELETE ON papers
BEGIN
    DELETE FROM papers_fts WHERE paper_id = OLD.id;
END;

-- ============================================
-- トリガー: メモFTS同期（INSERT）
-- ============================================
CREATE TRIGGER IF NOT EXISTS memos_fts_insert
AFTER INSERT ON memos
BEGIN
    INSERT INTO memos_fts(memo_id, content)
    VALUES (NEW.id, NEW.content);
END;

-- ============================================
-- トリガー: メモFTS同期（UPDATE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS memos_fts_update
AFTER UPDATE ON memos
BEGIN
    UPDATE memos_fts 
    SET content = NEW.content
    WHERE memo_id = NEW.id;
END;

-- ============================================
-- トリガー: メモFTS同期（DELETE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS memos_fts_delete
AFTER DELETE ON memos
BEGIN
    DELETE FROM memos_fts WHERE memo_id = OLD.id;
END;

-- ============================================
-- トリガー: 章FTS同期（INSERT）
-- ============================================
CREATE TRIGGER IF NOT EXISTS chapters_fts_insert
AFTER INSERT ON chapters
BEGIN
    INSERT INTO chapters_fts(chapter_id, paper_id, title, content)
    VALUES (NEW.id, NEW.paper_id, NEW.title, NEW.content);
END;

-- ============================================
-- トリガー: 章FTS同期（UPDATE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS chapters_fts_update
AFTER UPDATE ON chapters
BEGIN
    UPDATE chapters_fts 
    SET title = NEW.title, content = NEW.content
    WHERE chapter_id = NEW.id;
END;

-- ============================================
-- トリガー: 章FTS同期（DELETE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS chapters_fts_delete
AFTER DELETE ON chapters
BEGIN
    DELETE FROM chapters_fts WHERE chapter_id = OLD.id;
END;

-- ============================================
-- トリガー: 図表FTS同期（INSERT）
-- ============================================
CREATE TRIGGER IF NOT EXISTS figures_fts_insert
AFTER INSERT ON figures
BEGIN
    INSERT INTO figures_fts(figure_id, paper_id, caption)
    VALUES (NEW.id, NEW.paper_id, NEW.caption);
END;

-- ============================================
-- トリガー: 図表FTS同期（UPDATE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS figures_fts_update
AFTER UPDATE ON figures
BEGIN
    UPDATE figures_fts 
    SET caption = NEW.caption
    WHERE figure_id = NEW.id;
END;

-- ============================================
-- トリガー: 図表FTS同期（DELETE）
-- ============================================
CREATE TRIGGER IF NOT EXISTS figures_fts_delete
AFTER DELETE ON figures
BEGIN
    DELETE FROM figures_fts WHERE figure_id = OLD.id;
END;

-- ============================================
-- トリガー: ページテキスト追加時に論文FTS更新
-- ============================================
CREATE TRIGGER IF NOT EXISTS page_texts_update_papers_fts
AFTER INSERT ON page_texts
BEGIN
    UPDATE papers_fts
    SET content = (
        SELECT GROUP_CONCAT(content, ' ')
        FROM page_texts
        WHERE paper_id = NEW.paper_id
        ORDER BY page_number
    )
    WHERE paper_id = NEW.paper_id;
END;