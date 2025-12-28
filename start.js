// start.js - アプリケーション起動スクリプト
const { spawn } = require('child_process');
const path = require('path');

console.log('='.repeat(60));
console.log('Paper Manager - 起動スクリプト');
console.log('='.repeat(60));
console.log('');

console.log('[起動] 環境チェック中...');
console.log(`[起動] Node.js: ${process.version}`);
console.log(`[起動] 作業ディレクトリ: ${process.cwd()}`);
console.log('');

// 依存関係のチェック
console.log('[起動] 依存関係をチェック中...');
const fs = require('fs');
const packageJsonPath = path.join(__dirname, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('[エラー] package.jsonが見つかりません');
  process.exit(1);
}

const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('[起動] 依存関係がインストールされていません');
  console.log('[起動] npm install を実行してください');
  process.exit(1);
}

console.log('[起動] 依存関係: OK');
console.log('');

// アプリケーション起動
console.log('[起動] Paper Managerを起動しています...');
console.log('[起動] Webpack Dev ServerとElectronを起動中...');
console.log('');
console.log('='.repeat(60));
console.log('ログ出力:');
console.log('='.repeat(60));
console.log('');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npm, ['start'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('[エラー] 起動に失敗しました:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log('');
  console.log('='.repeat(60));
  console.log(`[終了] アプリケーションが終了しました (コード: ${code})`);
  console.log('='.repeat(60));
  process.exit(code);
});

// Ctrl+Cのハンドリング
process.on('SIGINT', () => {
  console.log('');
  console.log('[終了] 終了シグナルを受信しました');
  child.kill('SIGINT');
});