#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================');
console.log('  Paper Manager 起動中...');
console.log('====================================\n');

// node_modulesの存在確認
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('[エラー] node_modules が見つかりません');
  console.error('以下のコマンドを実行してください:');
  console.error('  npm install\n');
  process.exit(1);
}

// dataディレクトリの確認
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('[初期化] dataディレクトリを作成中...');
  fs.mkdirSync(dataDir);
  fs.mkdirSync(path.join(dataDir, 'pdfs'));
  fs.mkdirSync(path.join(dataDir, 'backups'));
  console.log('✅ ディレクトリを作成しました\n');
}

console.log('[起動] Electron を起動しています...\n');

// ビルドファイルの確認
const buildDir = path.join(__dirname, 'build');
const buildIndex = path.join(buildDir, 'index.html');

if (!fs.existsSync(buildIndex)) {
  console.log('[警告] Reactアプリがビルドされていません');
  console.log('[自動] ビルドを実行しています...\n');
  
  // 自動的にビルド実行
  const build = spawn('npm', ['run', 'build:app'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ ビルドが完了しました');
      console.log('[起動] Electronを起動します...\n');
      startElectron();
    } else {
      console.error('\n❌ ビルドに失敗しました');
      process.exit(1);
    }
  });
} else {
  startElectron();
}

function startElectron() {
  // Electronを起動
  const electron = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  electron.on('error', (error) => {
    console.error('[エラー]', error.message);
    process.exit(1);
  });

  electron.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n[エラー] プロセスが終了しました (コード: ${code})`);
    }
    process.exit(code);
  });

  // Ctrl+Cでの終了処理
  process.on('SIGINT', () => {
    console.log('\n\n[終了] アプリケーションを終了しています...');
    electron.kill('SIGINT');
    process.exit(0);
  });
}