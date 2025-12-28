const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('  Paper Manager 診断ツール');
console.log('====================================\n');

let hasError = false;

// 1. 必須ファイルの確認
console.log('📁 ファイル確認:');
const requiredFiles = [
  { path: 'main.js', name: 'Electronメインプロセス' },
  { path: 'preload.js', name: 'IPCブリッジ' },
  { path: 'database/db.js', name: 'データベース' },
  { path: 'database/schema.sql', name: 'スキーマ' },
  { path: 'build/index.html', name: 'ビルド済みHTML' },
  { path: 'build/bundle.js', name: 'ビルド済みJS' },
  { path: 'data/papers.db', name: 'データベースファイル' }
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file.path));
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file.name} (${file.path})`);
  if (!exists) hasError = true;
});

// 2. node_modulesの確認
console.log('\n📦 依存関係:');
const dependencies = [
  'electron',
  'react',
  'react-dom',
  'react-router-dom',
  'better-sqlite3',
  'react-hot-toast'
];

dependencies.forEach(dep => {
  const exists = fs.existsSync(path.join(__dirname, '..', 'node_modules', dep));
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${dep}`);
  if (!exists) hasError = true;
});

// 3. データディレクトリの確認
console.log('\n📂 データディレクトリ:');
const dataDirs = [
  'data',
  'data/pdfs',
  'data/backups'
];

dataDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, '..', dir));
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${dir}/`);
  if (!exists) hasError = true;
});

// 4. ビルドファイルのサイズチェック
console.log('\n📊 ビルドファイル:');
const buildFiles = [
  'build/index.html',
  'build/bundle.js'
];

buildFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ✅ ${file}: ${sizeKB} KB`);
    
    if (stats.size === 0) {
      console.log(`  ⚠️  ${file} のサイズが0バイトです`);
      hasError = true;
    }
  } else {
    console.log(`  ❌ ${file}: 見つかりません`);
    hasError = true;
  }
});

// 5. データベーステスト
console.log('\n🗄️  データベース接続テスト:');
try {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '..', 'data', 'papers.db');
  
  if (fs.existsSync(dbPath)) {
    const db = new Database(dbPath);
    
    // テーブルの存在確認
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('  ✅ データベース接続成功');
    console.log(`  ✅ テーブル数: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('  テーブル一覧:');
      tables.forEach(t => console.log(`    - ${t.name}`));
    } else {
      console.log('  ⚠️  テーブルが作成されていません');
      console.log('  解決方法: npm run init-db');
      hasError = true;
    }
    
    db.close();
  } else {
    console.log('  ⚠️  データベースファイルが見つかりません');
    console.log('  解決方法: アプリを一度起動するとデータベースが作成されます');
  }
} catch (error) {
  console.log('  ❌ データベース接続エラー:', error.message);
  hasError = true;
}

// 6. 診断結果
console.log('\n====================================');
if (hasError) {
  console.log('❌ 問題が検出されました');
  console.log('====================================\n');
  console.log('解決方法:');
  console.log('1. npm install          # 依存関係の再インストール');
  console.log('2. npm run setup        # セットアップ実行');
  console.log('3. npm run build:app    # アプリのビルド');
  console.log('4. npm run launch       # アプリ起動\n');
} else {
  console.log('✅ すべて正常です');
  console.log('====================================\n');
  console.log('アプリを起動できます:');
  console.log('  npm run launch\n');
}

process.exit(hasError ? 1 : 0);