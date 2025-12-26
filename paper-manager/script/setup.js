const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('  Paper Manager セットアップ');
console.log('====================================\n');

// 1. ディレクトリ作成
console.log('📁 ステップ 1: ディレクトリ作成');
const dirs = [
  'data',
  'data/pdfs',
  'data/backups'
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ ${dir}/ を作成しました`);
  } else {
    console.log(`✓ ${dir}/ は既に存在します`);
  }
});

console.log('\n📦 ステップ 2: 依存関係の確認');
try {
  const packageJson = require('../package.json');
  const installedModules = fs.existsSync(path.join(__dirname, '../node_modules'));
  
  if (!installedModules) {
    console.log('⚠️  node_modules が見つかりません');
    console.log('以下のコマンドを実行してください:');
    console.log('  npm install\n');
  } else {
    console.log('✅ node_modules が存在します\n');
  }
} catch (error) {
  console.error('❌ package.json の読み込みに失敗しました');
}

console.log('====================================');
console.log('✨ セットアップ完了!');
console.log('====================================\n');
console.log('次のステップ:');
console.log('1. npm install (まだ実行していない場合)');
console.log('2. npm start (アプリケーション起動)');
console.log('\n');