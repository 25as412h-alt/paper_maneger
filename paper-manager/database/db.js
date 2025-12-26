const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/papers.db');
const db = new sqlite3.Database(dbPath);

// データベース初期化
function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema, (err) => {
    if (err) {
      console.error('DB初期化エラー:', err);
    } else {
      console.log('DB初期化完了');
    }
  });
}

// ========== 論文操作 ==========

const papers = {
  // 新規登録
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { title, authors, year, pdf_path, content, tags } = data;
      const sql = `INSERT INTO papers (title, authors, year, pdf_path, content) 
                   VALUES (?, ?, ?, ?, ?)`;
      
      db.run(sql, [title, authors, year, pdf_path, content], function(err) {
        if (err) {
          reject(err);
        } else {
          const paperId = this.lastID;
          
          // FTS5に登録
          const ftsSql = `INSERT INTO papers_fts (paper_id, title, authors, content) 
                          VALUES (?, ?, ?, ?)`;
          db.run(ftsSql, [paperId, title, authors, content]);
          
          // タグ登録
          if (tags && tags.length > 0) {
            const tagSql = 'INSERT INTO tags (paper_id, tag_name) VALUES (?, ?)';
            const stmt = db.prepare(tagSql);
            tags.forEach(tag => {
              stmt.run(paperId, tag.trim());
            });
            stmt.finalize();
          }
          
          resolve({ id: paperId });
        }
      });
    });
  },

  // 全件取得（タグ含む）
  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, 
               GROUP_CONCAT(t.tag_name) as tags
        FROM papers p
        LEFT JOIN tags t ON p.id = t.paper_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // タグを配列に変換
          const papers = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(papers);
        }
      });
    });
  },

  // ID検索
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, 
               GROUP_CONCAT(t.tag_name) as tags
        FROM papers p
        LEFT JOIN tags t ON p.id = t.paper_id
        WHERE p.id = ?
        GROUP BY p.id
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          });
        } else {
          resolve(null);
        }
      });
    });
  },

  // 更新
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      const { title, authors, year, content, tags } = data;
      const sql = `UPDATE papers 
                   SET title=?, authors=?, year=?, content=?, 
                       last_viewed_at=CURRENT_TIMESTAMP 
                   WHERE id=?`;
      
      db.run(sql, [title, authors, year, content, id], function(err) {
        if (err) {
          reject(err);
        } else {
          // FTS5更新
          const ftsSql = `UPDATE papers_fts 
                          SET title=?, authors=?, content=? 
                          WHERE paper_id=?`;
          db.run(ftsSql, [title, authors, content, id]);
          
          // タグ更新（既存削除→再登録）
          db.run('DELETE FROM tags WHERE paper_id = ?', [id], () => {
            if (tags && tags.length > 0) {
              const tagSql = 'INSERT INTO tags (paper_id, tag_name) VALUES (?, ?)';
              const stmt = db.prepare(tagSql);
              tags.forEach(tag => {
                stmt.run(id, tag.trim());
              });
              stmt.finalize();
            }
          });
          
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // 削除
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM papers WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          db.run('DELETE FROM papers_fts WHERE paper_id = ?', [id]);
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // 最近追加された論文（ダッシュボード用）
  findRecent: (limit = 5) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.id, p.title, p.authors, p.year, p.created_at,
               GROUP_CONCAT(t.tag_name) as tags
        FROM papers p
        LEFT JOIN tags t ON p.id = t.paper_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ?
      `;
      
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const papers = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(papers);
        }
      });
    });
  }
};

// ========== メモ操作 ==========

const memos = {
  // 作成
  create: (paperId, content) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO memos (paper_id, content) VALUES (?, ?)';
      
      db.run(sql, [paperId, content], function(err) {
        if (err) {
          reject(err);
        } else {
          const memoId = this.lastID;
          
          // FTS5に登録
          db.run('INSERT INTO memos_fts (memo_id, content) VALUES (?, ?)', 
                 [memoId, content]);
          
          resolve({ id: memoId });
        }
      });
    });
  },

  // 論文IDで取得
  findByPaperId: (paperId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM memos 
                   WHERE paper_id = ? 
                   ORDER BY created_at DESC`;
      
      db.all(sql, [paperId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // 更新
  update: (id, content) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE memos 
                   SET content=?, updated_at=CURRENT_TIMESTAMP 
                   WHERE id=?`;
      
      db.run(sql, [content, id], function(err) {
        if (err) {
          reject(err);
        } else {
          db.run('UPDATE memos_fts SET content=? WHERE memo_id=?', 
                 [content, id]);
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // 削除
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM memos WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          db.run('DELETE FROM memos_fts WHERE memo_id = ?', [id]);
          resolve({ changes: this.changes });
        }
      });
    });
  }
};

// ========== 検索 ==========

const search = {
  // 統合検索
  fullText: (query, scope = 'all') => {
    return new Promise((resolve, reject) => {
      let results = [];
      let completed = 0;
      const searchTypes = [];
      
      // 検索対象を決定
      if (scope === 'all' || scope === 'papers') searchTypes.push('papers');
      if (scope === 'all' || scope === 'memos') searchTypes.push('memos');
      
      if (searchTypes.length === 0) {
        resolve([]);
        return;
      }
      
      const checkComplete = () => {
        completed++;
        if (completed === searchTypes.length) {
          resolve(results);
        }
      };
      
      // 英語検索（FTS5）
      const isEnglish = /[a-zA-Z]/.test(query);
      
      if (searchTypes.includes('papers')) {
        if (isEnglish) {
          // FTS5検索
          const sql = `
            SELECT p.paper_id, pa.title, pa.authors,
                   snippet(p, 2, '<mark>', '</mark>', '...', 30) as snippet
            FROM papers_fts p
            JOIN papers pa ON p.paper_id = pa.id
            WHERE papers_fts MATCH ?
          `;
          
          db.all(sql, [query], (err, rows) => {
            if (!err && rows) {
              results.push(...rows.map(r => ({ type: 'paper', ...r })));
            }
            checkComplete();
          });
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
          
          db.all(sql, [query, `%${query}%`], (err, rows) => {
            if (!err && rows) {
              results.push(...rows.map(r => ({ 
                type: 'paper', 
                ...r,
                snippet: '...' + r.snippet + '...'
              })));
            }
            checkComplete();
          });
        }
      }
      
      if (searchTypes.includes('memos')) {
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
          
          db.all(sql, [query], (err, rows) => {
            if (!err && rows) {
              results.push(...rows.map(r => ({ type: 'memo', ...r })));
            }
            checkComplete();
          });
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
          
          db.all(sql, [query, `%${query}%`], (err, rows) => {
            if (!err && rows) {
              results.push(...rows.map(r => ({ 
                type: 'memo', 
                ...r,
                snippet: '...' + r.snippet + '...'
              })));
            }
            checkComplete();
          });
        }
      }
    });
  },

  // 検索履歴保存
  saveHistory: (query, scope, resultCount) => {
    const sql = `INSERT INTO search_history (query, scope, result_count) 
                 VALUES (?, ?, ?)`;
    db.run(sql, [query, scope, resultCount]);
  },

  // 履歴取得
  getHistory: (limit = 10) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM search_history 
                   ORDER BY searched_at DESC 
                   LIMIT ?`;
      
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

// ========== タグ操作 ==========

const tags = {
  // 全タグ取得（使用数付き）
  findAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT tag_name, COUNT(*) as count
        FROM tags
        GROUP BY tag_name
        ORDER BY count DESC, tag_name ASC
      `;
      
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // タグで論文検索
  findPapersByTag: (tagName) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, GROUP_CONCAT(t2.tag_name) as tags
        FROM papers p
        JOIN tags t ON p.id = t.paper_id
        LEFT JOIN tags t2 ON p.id = t2.paper_id
        WHERE t.tag_name = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      
      db.all(sql, [tagName], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const papers = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(papers);
        }
      });
    });
  }
};

module.exports = { initDB, papers, memos, search, tags };