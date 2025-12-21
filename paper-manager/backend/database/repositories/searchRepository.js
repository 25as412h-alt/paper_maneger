const { getDatabase } = require('../db');

/**
 * 検索リポジトリ - データアクセス層
 */
class SearchRepository {
  /**
   * 全体検索
   */
  searchAll(query) {
    const db = getDatabase();
    const results = {
      papers: [],
      memos: [],
      chapters: [],
      figures: [],
      total: 0
    };

    // 論文検索
    results.papers = db.prepare(`
      SELECT p.id, p.title, p.authors, p.year,
             snippet(papers_fts, 1, '<mark>', '</mark>', '...', 30) as snippet
      FROM papers_fts
      INNER JOIN papers p ON papers_fts.paper_id = p.id
      WHERE papers_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `).all(query);

    // メモ検索
    results.memos = db.prepare(`
      SELECT m.id, m.paper_id, p.title as paper_title,
             snippet(memos_fts, 1, '<mark>', '</mark>', '...', 50) as snippet,
             m.page_number
      FROM memos_fts
      INNER JOIN memos m ON memos_fts.memo_id = m.id
      INNER JOIN papers p ON m.paper_id = p.id
      WHERE memos_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `).all(query);

    // 章検索
    results.chapters = db.prepare(`
      SELECT c.id, c.paper_id, c.title, p.title as paper_title,
             snippet(chapters_fts, 3, '<mark>', '</mark>', '...', 50) as snippet,
             c.page_start
      FROM chapters_fts
      INNER JOIN chapters c ON chapters_fts.chapter_id = c.id
      INNER JOIN papers p ON c.paper_id = p.id
      WHERE chapters_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `).all(query);

    // 図表検索
    results.figures = db.prepare(`
      SELECT f.id, f.paper_id, f.figure_number, p.title as paper_title,
             snippet(figures_fts, 2, '<mark>', '</mark>', '...', 50) as snippet,
             f.page_number
      FROM figures_fts
      INNER JOIN figures f ON figures_fts.figure_id = f.id
      INNER JOIN papers p ON f.paper_id = p.id
      WHERE figures_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `).all(query);

    results.total = results.papers.length + results.memos.length + 
                    results.chapters.length + results.figures.length;

    return results;
  }

  /**
   * スコープ指定検索
   */
  searchByScope(query, scope) {
    const db = getDatabase();
    let results = [];

    switch (scope) {
      case 'title_author':
        results = db.prepare(`
          SELECT p.id, p.title, p.authors, p.year,
                 snippet(papers_fts, 1, '<mark>', '</mark>', '...', 30) as title_snippet,
                 snippet(papers_fts, 2, '<mark>', '</mark>', '...', 30) as author_snippet
          FROM papers_fts
          INNER JOIN papers p ON papers_fts.paper_id = p.id
          WHERE papers_fts MATCH ?
          ORDER BY rank
          LIMIT 100
        `).all(query);
        break;

      case 'memo':
        results = db.prepare(`
          SELECT m.id, m.paper_id, m.content, m.page_number,
                 p.title as paper_title, p.authors,
                 snippet(memos_fts, 1, '<mark>', '</mark>', '...', 100) as snippet
          FROM memos_fts
          INNER JOIN memos m ON memos_fts.memo_id = m.id
          INNER JOIN papers p ON m.paper_id = p.id
          WHERE memos_fts MATCH ?
          ORDER BY rank
          LIMIT 100
        `).all(query);
        break;

      case 'content':
        results = db.prepare(`
          SELECT p.id, p.title, p.authors,
                 snippet(papers_fts, 3, '<mark>', '</mark>', '...', 100) as snippet
          FROM papers_fts
          INNER JOIN papers p ON papers_fts.paper_id = p.id
          WHERE papers_fts MATCH ?
          ORDER BY rank
          LIMIT 100
        `).all(query);
        break;

      case 'figure':
        results = db.prepare(`
          SELECT f.id, f.paper_id, f.figure_number, f.caption,
                 f.page_number, p.title as paper_title,
                 snippet(figures_fts, 2, '<mark>', '</mark>', '...', 100) as snippet
          FROM figures_fts
          INNER JOIN figures f ON figures_fts.figure_id = f.id
          INNER JOIN papers p ON f.paper_id = p.id
          WHERE figures_fts MATCH ?
          ORDER BY rank
          LIMIT 100
        `).all(query);
        break;

      case 'all':
      default:
        return this.searchAll(query);
    }

    return {
      scope,
      results,
      total: results.length
    };
  }

  /**
   * ファセット情報の取得
   */
  getFacets(query) {
    const db = getDatabase();

    const facets = {
      papers: 0,
      memos: 0,
      chapters: 0,
      figures: 0
    };

    // 各種別の件数を取得
    facets.papers = db.prepare(`
      SELECT COUNT(*) as count
      FROM papers_fts
      WHERE papers_fts MATCH ?
    `).get(query)?.count || 0;

    facets.memos = db.prepare(`
      SELECT COUNT(*) as count
      FROM memos_fts
      WHERE memos_fts MATCH ?
    `).get(query)?.count || 0;

    facets.chapters = db.prepare(`
      SELECT COUNT(*) as count
      FROM chapters_fts
      WHERE chapters_fts MATCH ?
    `).get(query)?.count || 0;

    facets.figures = db.prepare(`
      SELECT COUNT(*) as count
      FROM figures_fts
      WHERE figures_fts MATCH ?
    `).get(query)?.count || 0;

    facets.total = facets.papers + facets.memos + facets.chapters + facets.figures;

    return facets;
  }

  /**
   * 検索履歴の保存
   */
  saveHistory(query, scope, resultCount) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO search_history (query, scope, result_count)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(query, scope, resultCount);
    return result.lastInsertRowid;
  }

  /**
   * 検索履歴の取得
   */
  getHistory(limit = 10) {
    const db = getDatabase();
    return db.prepare(`
      SELECT query, scope, result_count, searched_at
      FROM search_history
      ORDER BY searched_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * 検索履歴のクリア
   */
  clearHistory() {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM search_history').run();
    return result.changes;
  }
}

module.exports = new SearchRepository();