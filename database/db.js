// database/db.js - SQLiteデータベース管理クラス
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor(dbPath) {
    console.log(`[DB] データベース接続: ${dbPath}`);
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB] 接続エラー:', err);
        throw err;
      }
      console.log('[DB] 接続成功');
    });

    this.initialize();
  }

  // データベース初期化
  initialize() {
    console.log('[DB] スキーマ初期化開始');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    this.db.exec(schema, (err) => {
      if (err) {
        console.error('[DB] スキーマ初期化エラー:', err);
        throw err;
      }
      console.log('[DB] スキーマ初期化完了');
    });
  }

  // プロミス化されたクエリ実行
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('[DB] 実行エラー:', sql, err);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('[DB] 取得エラー:', sql, err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('[DB] 一覧取得エラー:', sql, err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 論文追加
  async addPaper(paper) {
    console.log(`[DB] 論文追加: ${paper.title}`);
    
    const sql = `
      INSERT INTO papers (title, authors, year, pdf_path, content)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await this.run(sql, [
      paper.title,
      paper.authors,
      paper.year,
      paper.pdf_path,
      paper.content
    ]);
    
    const paperId = result.lastID;
    
    // FTS5インデックスに追加
    await this.run(`
      INSERT INTO papers_fts (paper_id, title, authors, content)
      VALUES (?, ?, ?, ?)
    `, [paperId, paper.title, paper.authors, paper.content]);
    
    console.log(`[DB] 論文追加完了: ID=${paperId}`);
    return paperId;
  }

  // タグ追加
  async addTags(paperId, tags) {
    console.log(`[DB] タグ追加: Paper ID=${paperId}, タグ=${tags.join(',')}`);
    
    const sql = `INSERT OR IGNORE INTO tags (paper_id, tag_name) VALUES (?, ?)`;
    
    for (const tag of tags) {
      const trimmedTag = tag.trim();
      if (trimmedTag) {
        await this.run(sql, [paperId, trimmedTag]);
      }
    }
    
    console.log('[DB] タグ追加完了');
  }

  // 論文一覧取得
  async getPapers(filters = {}) {
    console.log('[DB] 論文一覧取得:', filters);
    
    let sql = `
      SELECT DISTINCT p.*, 
        GROUP_CONCAT(t.tag_name, ', ') as tags
      FROM papers p
      LEFT JOIN tags t ON p.id = t.paper_id
    `;
    
    const conditions = [];
    const params = [];
    
    // タグでフィルタ
    if (filters.tag) {
      conditions.push(`p.id IN (SELECT paper_id FROM tags WHERE tag_name = ?)`);
      params.push(filters.tag);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY p.id ORDER BY p.created_at DESC';
    
    const papers = await this.all(sql, params);
    console.log(`[DB] 論文取得完了: ${papers.length}件`);
    
    return papers;
  }

  // 論文詳細取得
  async getPaperById(paperId) {
    console.log(`[DB] 論文詳細取得: ID=${paperId}`);
    
    const paper = await this.get(`
      SELECT p.*, GROUP_CONCAT(t.tag_name, ', ') as tags
      FROM papers p
      LEFT JOIN tags t ON p.id = t.paper_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [paperId]);
    
    if (!paper) {
      console.warn(`[DB] 論文が見つかりません: ID=${paperId}`);
      return null;
    }
    
    // 最終閲覧日時を更新
    await this.run(`
      UPDATE papers SET last_viewed_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [paperId]);
    
    console.log('[DB] 論文詳細取得完了');
    return paper;
  }

  // 最近追加した論文取得
  async getRecentPapers(limit = 5) {
    console.log(`[DB] 最近の論文取得: limit=${limit}`);
    
    const papers = await this.all(`
      SELECT p.*, GROUP_CONCAT(t.tag_name, ', ') as tags
      FROM papers p
      LEFT JOIN tags t ON p.id = t.paper_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [limit]);
    
    console.log(`[DB] 最近の論文取得完了: ${papers.length}件`);
    return papers;
  }

  // 論文更新
  async updatePaper(paperId, updates) {
    console.log(`[DB] 論文更新: ID=${paperId}`);
    
    const fields = [];
    const params = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      params.push(updates.title);
    }
    if (updates.authors !== undefined) {
      fields.push('authors = ?');
      params.push(updates.authors);
    }
    if (updates.year !== undefined) {
      fields.push('year = ?');
      params.push(updates.year);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      params.push(updates.content);
    }
    
    if (fields.length === 0) {
      console.log('[DB] 更新項目なし');
      return;
    }
    
    params.push(paperId);
    
    await this.run(`
      UPDATE papers SET ${fields.join(', ')} WHERE id = ?
    `, params);
    
    // FTS5インデックス更新
    if (updates.title || updates.authors || updates.content) {
      await this.run(`DELETE FROM papers_fts WHERE paper_id = ?`, [paperId]);
      
      const paper = await this.get(`SELECT * FROM papers WHERE id = ?`, [paperId]);
      await this.run(`
        INSERT INTO papers_fts (paper_id, title, authors, content)
        VALUES (?, ?, ?, ?)
      `, [paperId, paper.title, paper.authors, paper.content]);
    }
    
    // タグ更新
    if (updates.tags !== undefined) {
      await this.run(`DELETE FROM tags WHERE paper_id = ?`, [paperId]);
      if (updates.tags.length > 0) {
        await this.addTags(paperId, updates.tags);
      }
    }
    
    console.log('[DB] 論文更新完了');
  }

  // 論文削除
  async deletePaper(paperId) {
    console.log(`[DB] 論文削除: ID=${paperId}`);
    
    // FTS5インデックスから削除
    await this.run(`DELETE FROM papers_fts WHERE paper_id = ?`, [paperId]);
    
    // タグとメモはCASCADE削除される
    await this.run(`DELETE FROM papers WHERE id = ?`, [paperId]);
    
    console.log('[DB] 論文削除完了');
  }

  // 検索
  async search(query, scope = 'all') {
    console.log(`[DB] 検索: "${query}", scope=${scope}`);
    
    const results = [];
    
    // 英語検索（FTS5）
    if (/[a-zA-Z]/.test(query)) {
      console.log('[DB] 英語検索（FTS5）');
      
      if (scope === 'all' || scope === 'papers') {
        const paperResults = await this.all(`
          SELECT 
            p.id,
            p.title,
            p.authors,
            snippet(papers_fts, 3, '<mark>', '</mark>', '...', 30) as snippet,
            'paper' as type
          FROM papers_fts
          JOIN papers p ON papers_fts.paper_id = p.id
          WHERE papers_fts MATCH ?
          ORDER BY rank
        `, [query]);
        
        results.push(...paperResults);
      }
      
      if (scope === 'all' || scope === 'memos') {
        const memoResults = await this.all(`
          SELECT 
            m.id,
            m.paper_id,
            p.title as paper_title,
            snippet(memos_fts, 1, '<mark>', '</mark>', '...', 30) as snippet,
            'memo' as type
          FROM memos_fts
          JOIN memos m ON memos_fts.memo_id = m.id
          JOIN papers p ON m.paper_id = p.id
          WHERE memos_fts MATCH ?
          ORDER BY rank
        `, [query]);
        
        results.push(...memoResults);
      }
    } 
    // 日本語検索（LIKE）
    else {
      console.log('[DB] 日本語検索（LIKE）');
      const likeQuery = `%${query}%`;
      
      if (scope === 'all' || scope === 'papers') {
        const paperResults = await this.all(`
          SELECT 
            id,
            title,
            authors,
            substr(content, 
              MAX(1, instr(lower(content), lower(?)) - 30), 
              60
            ) as snippet,
            'paper' as type
          FROM papers
          WHERE content LIKE ?
        `, [query, likeQuery]);
        
        results.push(...paperResults);
      }
      
      if (scope === 'all' || scope === 'memos') {
        const memoResults = await this.all(`
          SELECT 
            m.id,
            m.paper_id,
            p.title as paper_title,
            substr(m.content, 
              MAX(1, instr(lower(m.content), lower(?)) - 30), 
              60
            ) as snippet,
            'memo' as type
          FROM memos m
          JOIN papers p ON m.paper_id = p.id
          WHERE m.content LIKE ?
        `, [query, likeQuery]);
        
        results.push(...memoResults);
      }
    }
    
    console.log(`[DB] 検索完了: ${results.length}件`);
    return results;
  }

  // メモ追加
  async addMemo(paperId, content) {
    console.log(`[DB] メモ追加: Paper ID=${paperId}`);
    
    const result = await this.run(`
      INSERT INTO memos (paper_id, content) VALUES (?, ?)
    `, [paperId, content]);
    
    const memoId = result.lastID;
    
    // FTS5インデックスに追加
    await this.run(`
      INSERT INTO memos_fts (memo_id, content) VALUES (?, ?)
    `, [memoId, content]);
    
    console.log(`[DB] メモ追加完了: ID=${memoId}`);
    return memoId;
  }

  // メモ一覧取得
  async getMemos(paperId) {
    console.log(`[DB] メモ一覧取得: Paper ID=${paperId}`);
    
    const memos = await this.all(`
      SELECT * FROM memos
      WHERE paper_id = ?
      ORDER BY created_at DESC
    `, [paperId]);
    
    console.log(`[DB] メモ取得完了: ${memos.length}件`);
    return memos;
  }

  // メモ更新
  async updateMemo(memoId, content) {
    console.log(`[DB] メモ更新: ID=${memoId}`);
    
    await this.run(`
      UPDATE memos 
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [content, memoId]);
    
    // FTS5インデックス更新
    await this.run(`DELETE FROM memos_fts WHERE memo_id = ?`, [memoId]);
    await this.run(`
      INSERT INTO memos_fts (memo_id, content) VALUES (?, ?)
    `, [memoId, content]);
    
    console.log('[DB] メモ更新完了');
  }

  // メモ削除
  async deleteMemo(memoId) {
    console.log(`[DB] メモ削除: ID=${memoId}`);
    
    await this.run(`DELETE FROM memos_fts WHERE memo_id = ?`, [memoId]);
    await this.run(`DELETE FROM memos WHERE id = ?`, [memoId]);
    
    console.log('[DB] メモ削除完了');
  }

  // 全タグ取得（使用頻度付き）
  async getAllTags() {
    console.log('[DB] 全タグ取得');
    
    const tags = await this.all(`
      SELECT tag_name, COUNT(*) as count
      FROM tags
      GROUP BY tag_name
      ORDER BY count DESC, tag_name ASC
    `);
    
    console.log(`[DB] タグ取得完了: ${tags.length}件`);
    return tags;
  }

  // データベースクローズ
  close() {
    console.log('[DB] データベースクローズ');
    this.db.close();
  }
}

module.exports = Database;