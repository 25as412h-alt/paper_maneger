const fs = require('fs');
const path = require('path');

// データディレクトリを作成
function ensureDirectories() {
  const dataDir = path.join(__dirname, '../data');
  const pdfsDir = path.join(dataDir, 'pdfs');
  const backupsDir = path.join(dataDir, 'backups');
  
  console.log('📁 データディレクトリを作成中...');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log('✅ data/ を作成しました');
  } else {
    console.log('✓ data/ は既に存在します');
  }
  
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir);
    console.log('✅ data/pdfs/ を作成しました');
  } else {
    console.log('✓ data/pdfs/ は既に存在します');
  }
  
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
    console.log('✅ data/backups/ を作成しました');
  } else {
    console.log('✓ data/backups/ は既に存在します');
  }
  
  console.log('✨ ディレクトリの準備が完了しました\n');
}

// スクリプトとして実行された場合
if (require.main === module) {
  ensureDirectories();
}

module.exports = { ensureDirectories };