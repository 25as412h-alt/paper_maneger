const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

/**
 * データベースの初期化
 * @param {string} dataDir - データディレクトリのパス
 */
function initializeDatabase(dataDir) {
  const dbPath = path.join(dataDir, 'papers.db');
  
  console.log(`Initializing database at: ${dbPath}`);
  
  // データベース接続
  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });

  // WALモード有効化（パフォーマンス向上）
  db.pragma('journal_mode = WAL');
  
  // 外部キー制約を有効化
  db.pragma('foreign_keys = ON');

  // スキーマの実行
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('Database schema initialized');

  // FTS5セットアップの実行
  const ftsPath = path.join(__dirname, 'fts-setup.sql');
  const ftsSetup = fs.readFileSync(ftsPath, 'utf8');
  db.exec(ftsSetup);
  console.log('FTS5 setup completed');

  return db;
}

/**
 * データベース接続の取得
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * トランザクション実行
 * @param {Function} callback - トランザクション内で実行する関数
 */
function transaction(callback) {
  const db = getDatabase();
  const txn = db.transaction(callback);
  return txn();
}

/**
 * データベース接続のクローズ
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * データベースのバックアップ作成
 * @param {string} backupPath - バックアップファイルのパス
 */
function createBackup(backupPath) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    try {
      db.backup(backupPath)
        .then(() => {
          console.log(`Backup created: ${backupPath}`);
          resolve(backupPath);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * データベースの最適化（VACUUM）
 */
function optimizeDatabase() {
  const db = getDatabase();
  db.exec('VACUUM');
  db.exec('ANALYZE');
  console.log('Database optimized');
}

/**
 * 統計情報の取得
 */
function getStats() {
  const db = getDatabase();
  
  const stats = {
    papers: db.prepare('SELECT COUNT(*) as count FROM papers').get().count,
    memos: db.prepare('SELECT COUNT(*) as count FROM memos').get().count,
    chapters: db.prepare('SELECT COUNT(*) as count FROM chapters').get().count,
    figures: db.prepare('SELECT COUNT(*) as count FROM figures').get().count,
    tags: db.prepare('SELECT COUNT(DISTINCT tag_name) as count FROM paper_tags').get().count,
    dbSize: fs.statSync(db.name).size
  };

  return stats;
}

module.exports = {
  initializeDatabase,
  getDatabase,
  transaction,
  closeDatabase,
  createBackup,
  optimizeDatabase,
  getStats
};