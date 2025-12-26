const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/papers.db');

// データベース統計を表示
function showStats() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ データベースが見つかりません');
    console.log('アプリを一度起動してデータベースを作成してください。\n');
    return;
  }

  const db = new sqlite3.Database(dbPath);
  
  console.log('====================================');
  console.log('  データベース統計');
  console.log('====================================\n');
  
  // 論文数
  db.get('SELECT COUNT(*) as count FROM papers', (err, row) => {
    if (!err) {
      console.log(`📄 論文数: ${row.count}件`);
    }
  });
  
  // メモ数
  db.get('SELECT COUNT(*) as count FROM memos', (err, row) => {
    if (!err) {
      console.log(`📝 メモ数: ${row.count}件`);
    }
  });
  
  // タグ数
  db.get('SELECT COUNT(DISTINCT tag_name) as count FROM tags', (err, row) => {
    if (!err) {
      console.log(`🏷️  タグ数: ${row.count}種類`);
    }
  });
  
  // 検索履歴
  db.get('SELECT COUNT(*) as count FROM search_history', (err, row) => {
    if (!err) {
      console.log(`🔍 検索履歴: ${row.count}件`);
    }
  });
  
  // データベースサイズ
  const stats = fs.statSync(dbPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`💾 DB サイズ: ${sizeMB} MB`);
  
  // 最新の論文
  console.log('\n📚 最近登録された論文:');
  db.all('SELECT title, created_at FROM papers ORDER BY created_at DESC LIMIT 5', (err, rows) => {
    if (!err && rows.length > 0) {
      rows.forEach((row, idx) => {
        const date = new Date(row.created_at).toLocaleDateString('ja-JP');
        console.log(`  ${idx + 1}. ${row.title} (${date})`);
      });
    } else {
      console.log('  (論文がありません)');
    }
    
    console.log('\n====================================\n');
    db.close();
  });
}

// データベースをリセット
function resetDatabase() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ データベースが見つかりません\n');
    return;
  }
  
  console.log('⚠️  データベースをリセットします');
  console.log('すべてのデータが削除されます。\n');
  
  // 確認なしで削除（スクリプトなので）
  fs.unlinkSync(dbPath);
  console.log('✅ データベースを削除しました');
  console.log('アプリを起動すると新しいデータベースが作成されます。\n');
}

// バックアップ一覧
function listBackups() {
  const backupsDir = path.join(__dirname, '../data/backups');
  
  if (!fs.existsSync(backupsDir)) {
    console.log('❌ backupsディレクトリが見つかりません\n');
    return;
  }
  
  const files = fs.readdirSync(backupsDir)
    .filter(f => f.endsWith('.db'))
    .map(f => {
      const filePath = path.join(backupsDir, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        size: (stats.size / 1024 / 1024).toFixed(2),
        date: stats.mtime
      };
    })
    .sort((a, b) => b.date - a.date);
  
  console.log('====================================');
  console.log('  バックアップ一覧');
  console.log('====================================\n');
  
  if (files.length === 0) {
    console.log('バックアップファイルがありません\n');
    return;
  }
  
  console.log(`合計: ${files.length}件\n`);
  files.forEach((file, idx) => {
    const dateStr = file.date.toLocaleString('ja-JP');
    console.log(`${idx + 1}. ${file.name}`);
    console.log(`   サイズ: ${file.size} MB`);
    console.log(`   作成日: ${dateStr}\n`);
  });
}

// コマンドライン引数で機能を切り替え
const command = process.argv[2];

switch (command) {
  case 'stats':
    showStats();
    break;
  case 'reset':
    resetDatabase();
    break;
  case 'backups':
    listBackups();
    break;
  default:
    console.log('使い方:');
    console.log('  node scripts/db-utils.js stats    - データベース統計を表示');
    console.log('  node scripts/db-utils.js reset    - データベースをリセット');
    console.log('  node scripts/db-utils.js backups  - バックアップ一覧を表示');
    console.log('');
}