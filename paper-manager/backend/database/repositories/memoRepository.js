const { getDatabase } = require('../db');

/**
 * メモリポジトリ - データアクセス層
 */
class MemoRepository {
  /**
   * 論文のメモ一覧取得
   */
  findByPaper(paperId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT m.*, p.title as paper_title
      FROM memos m
      INNER JOIN papers p ON m.paper_id = p.id
      WHERE m.paper_id = ?
      ORDER BY m.created_at DESC
    `).all(paperId);
  }

  /**
   * メモIDで取得
   */
  findById(id) {
    const db = getDatabase();
    const memo = db.prepare(`
      SELECT m.*, p.title as paper_title, p.authors
      FROM memos m
      INNER JOIN papers p ON m.paper_id = p.id
      WHERE m.id = ?
    `).get(id);

    if (memo) {
      // タグを取得
      memo.tags = this.getTags(id);
    }

    return memo;
  }

  /**
   * メモ作成
   */
  create(memoData) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO memos (paper_id, content, page_number, page_range)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      memoData.paper_id,
      memoData.content,
      memoData.page_number,
      memoData.page_range
    );

    return result.lastInsertRowid;
  }

  /**
   * メモ更新
   */
  update(id, memoData) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    if (memoData.content !== undefined) {
      fields.push('content = ?');
      params.push(memoData.content);
    }
    if (memoData.page_number !== undefined) {
      fields.push('page_number = ?');
      params.push(memoData.page_number);
    }
    if (memoData.page_range !== undefined) {
      fields.push('page_range = ?');
      params.push(memoData.page_range);
    }

    if (fields.length === 0) return 0;

    params.push(id);
    const query = `UPDATE memos SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    return result.changes;
  }

  /**
   * メモ削除
   */
  delete(id) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM memos WHERE id = ?').run(id);
    return result.changes;
  }

  /**
   * 関連メモの取得
   */
  getRelated(memoId, limit = 10) {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        m.id,
        m.paper_id,
        m.content,
        m.created_at,
        p.title as paper_title,
        mr.common_terms,
        mr.score
      FROM memo_relations mr
      INNER JOIN memos m ON mr.related_memo_id = m.id
      INNER JOIN papers p ON m.paper_id = p.id
      WHERE mr.memo_id = ?
      ORDER BY mr.score DESC, mr.created_at DESC
      LIMIT ?
    `).all(memoId, limit);
  }

  /**
   * メモ関連の保存
   */
  saveRelation(memoId, relatedMemoId, commonTerms, score) {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO memo_relations (memo_id, related_memo_id, common_terms, score)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(memo_id, related_memo_id) 
        DO UPDATE SET common_terms = ?, score = ?
      `);
      stmt.run(memoId, relatedMemoId, commonTerms, score, commonTerms, score);
      return true;
    } catch (error) {
      console.error('Failed to save memo relation:', error);
      return false;
    }
  }

  /**
   * メモ関連の削除
   */
  deleteRelations(memoId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM memo_relations
      WHERE memo_id = ? OR related_memo_id = ?
    `);
    const result = stmt.run(memoId, memoId);
    return result.changes;
  }

  /**
   * 全メモ取得（関連計算用）
   */
  findAllForRelations() {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, content
      FROM memos
      WHERE LENGTH(content) > 0
    `).all();
  }

  /**
   * タグ追加
   */
  addTag(memoId, tagName) {
    const db = getDatabase();
    try {
      const stmt = db.prepare(`
        INSERT INTO memo_tags (memo_id, tag_name)
        VALUES (?, ?)
      `);
      stmt.run(memoId, tagName);
      return true;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * タグ削除
   */
  removeTag(memoId, tagName) {
    const db = getDatabase();
    const result = db.prepare(`
      DELETE FROM memo_tags
      WHERE memo_id = ? AND tag_name = ?
    `).run(memoId, tagName);
    return result.changes;
  }

  /**
   * メモのタグ一覧
   */
  getTags(memoId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT tag_name, created_at
      FROM memo_tags
      WHERE memo_id = ?
      ORDER BY created_at DESC
    `).all(memoId);
  }

  /**
   * 最近のメモ取得
   */
  findRecent(limit = 10) {
    const db = getDatabase();
    return db.prepare(`
      SELECT m.*, p.title as paper_title
      FROM memos m
      INNER JOIN papers p ON m.paper_id = p.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(limit);
  }
}

module.exports = new MemoRepository();