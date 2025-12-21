const { getDatabase } = require('../db');

/**
 * 論文リポジトリ - データアクセス層
 */
class PaperRepository {
  /**
   * 全論文取得（フィルタ・ソート対応）
   */
  findAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM papers WHERE 1=1';
    const params = [];

    // タグフィルタ
    if (filters.tag) {
      query += ' AND id IN (SELECT paper_id FROM paper_tags WHERE tag_name = ?)';
      params.push(filters.tag);
    }

    // 年フィルタ
    if (filters.year) {
      query += ' AND year = ?';
      params.push(filters.year);
    }

    // ソート
    const sortMap = {
      'newest': 'created_at DESC',
      'oldest': 'created_at ASC',
      'title': 'title ASC',
      'viewed': 'last_viewed_at DESC NULLS LAST'
    };
    const sortBy = sortMap[filters.sortBy] || 'created_at DESC';
    query += ` ORDER BY ${sortBy}`;

    // リミット
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return db.prepare(query).all(...params);
  }

  /**
   * 論文IDで取得
   */
  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM papers WHERE id = ?').get(id);
  }

  /**
   * 論文作成
   */
  create(paperData) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO papers (title, authors, year, doi, file_path, file_type, pdf_hash, page_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      paperData.title,
      paperData.authors,
      paperData.year,
      paperData.doi,
      paperData.file_path,
      paperData.file_type || 'pdf',
      paperData.pdf_hash,
      paperData.page_count || 0
    );

    return result.lastInsertRowid;
  }

  /**
   * 論文更新
   */
  update(id, paperData) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    if (paperData.title !== undefined) {
      fields.push('title = ?');
      params.push(paperData.title);
    }
    if (paperData.authors !== undefined) {
      fields.push('authors = ?');
      params.push(paperData.authors);
    }
    if (paperData.year !== undefined) {
      fields.push('year = ?');
      params.push(paperData.year);
    }
    if (paperData.doi !== undefined) {
      fields.push('doi = ?');
      params.push(paperData.doi);
    }

    if (fields.length === 0) return 0;

    params.push(id);
    const query = `UPDATE papers SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    return result.changes;
  }

  /**
   * 論文削除
   */
  delete(id) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM papers WHERE id = ?').run(id);
    return result.changes;
  }

  /**
   * 最近追加した論文
   */
  findRecent(limit = 5) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM papers
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * 最近参照した論文
   */
  findRecentlyViewed(limit = 5) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM papers
      WHERE last_viewed_at IS NOT NULL
      ORDER BY last_viewed_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * 未整理論文（メモ0件）
   */
  findUnorganized(limit = 5) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM papers
      WHERE memo_count = 0
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * 参照日時の更新
   */
  updateViewedAt(id) {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE papers
      SET last_viewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
    return result.changes;
  }

  /**
   * 処理状態の更新
   */
  updateProcessingStatus(id, status) {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE papers
      SET processing_status = ?,
          is_processed = ?
      WHERE id = ?
    `).run(status, status === 'completed' ? 1 : 0, id);
    return result.changes;
  }

  /**
   * タグ追加
   */
  addTag(paperId, tagName) {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO paper_tags (paper_id, tag_name)
        VALUES (?, ?)
      `);
      stmt.run(paperId, tagName);
      return true;
    } catch (error) {
      // UNIQUE制約違反の場合は無視
      if (error.code === 'SQLITE_CONSTRAINT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * タグ削除
   */
  removeTag(paperId, tagName) {
    const db = getDatabase();
    const result = db.prepare(`
      DELETE FROM paper_tags
      WHERE paper_id = ? AND tag_name = ?
    `).run(paperId, tagName);
    return result.changes;
  }

  /**
   * 論文のタグ一覧
   */
  getTags(paperId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT tag_name, created_at
      FROM paper_tags
      WHERE paper_id = ?
      ORDER BY created_at DESC
    `).all(paperId);
  }

  /**
   * タグで論文検索
   */
  findByTag(tagName) {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*
      FROM papers p
      INNER JOIN paper_tags pt ON p.id = pt.paper_id
      WHERE pt.tag_name = ?
      ORDER BY p.created_at DESC
    `).all(tagName);
  }

  /**
   * 全タグ取得（論文数付き）
   */
  getAllTags() {
    const db = getDatabase();
    return db.prepare(`
      SELECT tag_name, COUNT(*) as paper_count
      FROM paper_tags
      GROUP BY tag_name
      ORDER BY paper_count DESC, tag_name ASC
    `).all();
  }
}

module.exports = new PaperRepository();