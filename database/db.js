const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/papers.db');
const db = new Database(dbPath);

// WALモードを有効化（パフォーマンス向上）
db.pragma('journal_mode = WAL');

// データベース初期化
function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  try {
    db.exec(schema);
    console.log('DB初期化完了');
  } catch (err) {
    console.error('DB初期化エラー:', err);
  }
}

// ========== 論文操作 ==========

const papers = {
  // 新規登録
  create: (data) => {
    const { title, authors, year, pdf_path, content, tags } = data;
    
    const insertPaper = db.prepare(`
      INSERT INTO papers (title, authors, year, pdf_path, content) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insertPaper.run(title, authors, year, pdf_path, content);
    const paperId = result.lastInsertRowid;
    
    // FTS5に登録
    const insertFts = db.prepare(`
      INSERT INTO papers_fts (paper_id, title, authors, content) 
      VALUES (?, ?, ?, ?)
    `);
    insertFts.run(paperId, title, authors, content);
    
    // タグ登録
    if (tags && tags.length > 0) {
      const insertTag = db.prepare('INSERT INTO tags (paper_id, tag_name) VALUES (?, ?)');
      const insertMany = db.transaction((paperId, tags) => {
        for (const tag of tags) {
          insertTag.run(paperId, tag.trim());
        }
      });
      insertMany(paperId, tags);
    }
    
    return { id: paperId };
  },

  // 全件取得（タグ含む）
  findAll: () => {
    const sql = `
      SELECT p.*, 
             GROUP_CONCAT(t.tag_name) as tags
      FROM papers p
      LEFT JOIN tags t ON p.id = t.paper_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const rows = db.prepare(sql).all();
    
    return rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
  },

  // ID検索
  findById: (id) => {
    const sql = `
      SELECT p.*, 
             GROUP_CONCAT(t.tag_name) as tags
      FROM papers p
      LEFT JOIN tags t ON p.id = t.paper_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    
    const row = db.prepare(sql).get(id);
    
    if (row) {
      return {
        ...row,
        tags: row.tags ? row.tags.split(',') : []
      };
    }
    return null;
  },

  // 更新
  update: (id, data) => {
    const { title, authors, year, content, tags } = data;
    
    const updatePaper = db.prepare(`
      UPDATE papers 
      SET title=?, authors=?, year=?, content=?, 
          last_viewed_at=CURRENT_TIMESTAMP 
      WHERE id=?
    `);
    
    const result = updatePaper.run(title, authors, year, content, id);
    
    // FTS5更新
    const updateFts = db.prepare(`
      UPDATE papers_fts 
      SET title=?, authors=?, content=? 
      WHERE paper_id=?
    `);
    updateFts.run(title, authors, content, id);
    
    // タグ更新（既存削除→再登録）
    const deleteTags = db.prepare('DELETE FROM tags WHERE paper_id = ?');
    deleteTags.run(id);
    
    if (tags && tags.length > 0) {
      const insertTag = db.prepare('INSERT INTO tags (paper_id, tag_name) VALUES (?, ?)');
      const insertMany = db.transaction((paperId, tags) => {
        for (const tag of tags) {
          insertTag.run(paperId, tag.trim());
        }
      });
      insertMany(id, tags);
    }
    
    return { changes: result.changes };
  },

  // 削除
  delete: (id) => {
    const deletePaper = db.prepare('DELETE FROM papers WHERE id = ?');
    const result = deletePaper.run(id);
    
    const deleteFts = db.prepare('DELETE FROM papers_fts WHERE paper_id = ?');
    deleteFts.run(id);
    
    return { changes: result.changes };
  },

  // 最近追加された論文
  findRecent: (limit = 5) => {
    const sql = `
      SELECT p.id, p.title, p.authors, p.year, p.created_at,
             GROUP_CONCAT(t.tag_name) as tags
      FROM papers p
      LEFT JOIN tags t ON p.id = t.paper_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const rows = db.prepare(sql).all(limit);
    
    return rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
  }
};

// ========== メモ操作 ==========

const memos = {
  // 作成
  create: (paperId, content) => {
    const insertMemo = db.prepare('INSERT INTO memos (paper_id, content) VALUES (?, ?)');
    const result = insertMemo.run(paperId, content);
    const memoId = result.lastInsertRowid;
    
    // FTS5に登録
    const insertFts = db.prepare('INSERT INTO memos_fts (memo_id, content) VALUES (?, ?)');
    insertFts.run(memoId, content);
    
    return { id: memoId };
  },

  // 論文IDで取得
  findByPaperId: (paperId) => {
    const sql = `SELECT * FROM memos 
                 WHERE paper_id = ? 
                 ORDER BY created_at DESC`;
    
    return db.prepare(sql).all(paperId);
  },

  // 更新
  update: (id, content) => {
    const updateMemo = db.prepare(`
      UPDATE memos 
      SET content=?, updated_at=CURRENT_TIMESTAMP 
      WHERE id=?
    `);
    const result = updateMemo.run(content, id);
    
    const updateFts = db.prepare('UPDATE memos_fts SET content=? WHERE memo_id=?');
    updateFts.run(content, id);
    
    return { changes: result.changes };
  },

  // 削除
  delete: (id) => {
    const deleteMemo = db.prepare('DELETE FROM memos WHERE id = ?');
    const result = deleteMemo.run(id);
    
    const deleteFts = db.prepare('DELETE FROM memos_fts WHERE memo_id = ?');
    deleteFts.run(id);
    
    return { changes: result.changes };
  }
};

// ========== 検索 ==========

const search = {
  // 統合検索
  fullText: (query, scope = 'all') => {
    let results = [];
    
    // 英語検索（FTS5）
    const isEnglish = /[a-zA-Z]/.test(query);
    
    if (scope === 'all' || scope === 'papers') {
      if (isEnglish) {
        // FTS5検索
        const sql = `
          SELECT p.paper_id, pa.title, pa.authors,
                 snippet(p, 2, '<mark>', '</mark>', '...', 30) as snippet
          FROM papers_fts p
          JOIN papers pa ON p.paper_id = pa.id
          WHERE papers_fts MATCH ?
        `;
        
        try {
          const rows = db.prepare(sql).all(query);
          results.push(...rows.map(r => ({ type: 'paper', ...r })));
        } catch (e) {
          console.error('FTS5検索エラー:', e);
        }
      } else {
        // 日本語LIKE検索
        const sql = `
          SELECT id as paper_id, title, authors,
                 substr(content, 
                        max(1, instr(content, ?) - 30), 
                        60) as snippet
          FROM papers 
          WHERE content LIKE ?
        `;
        
        const rows = db.prepare(sql).all(query, `%${query}%`);
        results.push(...rows.map(r => ({ 
          type: 'paper', 
          ...r,
          snippet: '...' + r.snippet + '...'
        })));
      }
    }
    
    if (scope === 'all' || scope === 'memos') {
      if (isEnglish) {
        // FTS5検索
        const sql = `
          SELECT m.memo_id, m.paper_id, p.title as paper_title,
                 snippet(mf, 1, '<mark>', '</mark>', '...', 30) as snippet
          FROM memos_fts mf
          JOIN memos m ON mf.memo_id = m.id
          JOIN papers p ON m.paper_id = p.id
          WHERE memos_fts MATCH ?
        `;
        
        try {
          const rows = db.prepare(sql).all(query);
          results.push(...rows.map(r => ({ type: 'memo', ...r })));
        } catch (e) {
          console.error('FTS5検索エラー:', e);
        }
      } else {
        // 日本語LIKE検索
        const sql = `
          SELECT m.id as memo_id, m.paper_id, p.title as paper_title,
                 substr(m.content, 
                        max(1, instr(m.content, ?) - 30), 
                        60) as snippet
          FROM memos m
          JOIN papers p ON m.paper_id = p.id
          WHERE m.content LIKE ?
        `;
        
        const rows = db.prepare(sql).all(query, `%${query}%`);
        results.push(...rows.map(r => ({ 
          type: 'memo', 
          ...r,
          snippet: '...' + r.snippet + '...'
        })));
      }
    }
    
    return results;
  },

  // 検索履歴保存
  saveHistory: (query, scope, resultCount) => {
    const sql = `INSERT INTO search_history (query, scope, result_count) 
                 VALUES (?, ?, ?)`;
    db.prepare(sql).run(query, scope, resultCount);
  },

  // 履歴取得
  getHistory: (limit = 10) => {
    const sql = `SELECT * FROM search_history 
                 ORDER BY searched_at DESC 
                 LIMIT ?`;
    
    return db.prepare(sql).all(limit);
  }
};

// ========== タグ操作 ==========

const tags = {
  // 全タグ取得（使用数付き）
  findAll: () => {
    const sql = `
      SELECT tag_name, COUNT(*) as count
      FROM tags
      GROUP BY tag_name
      ORDER BY count DESC, tag_name ASC
    `;
    
    return db.prepare(sql).all();
  },

  // タグで論文検索
  findPapersByTag: (tagName) => {
    const sql = `
      SELECT p.*, GROUP_CONCAT(t2.tag_name) as tags
      FROM papers p
      JOIN tags t ON p.id = t.paper_id
      LEFT JOIN tags t2 ON p.id = t2.paper_id
      WHERE t.tag_name = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const rows = db.prepare(sql).all(tagName);
    
    return rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
  }
};

module.exports = { initDB, papers, memos, search, tags };