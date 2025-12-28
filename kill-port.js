// kill-port.js - ポート3000を使用しているプロセスを終了
const { exec } = require('child_process');
const os = require('os');

const port = 3000;

console.log(`[KILL-PORT] ポート${port}を使用しているプロセスを検索中...`);

function killPort() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Windows
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`[KILL-PORT] ポート${port}は使用されていません`);
        return;
      }
      
      const lines = stdout.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          pids.add(match[1]);
        }
      });
      
      if (pids.size === 0) {
        console.log(`[KILL-PORT] ポート${port}は使用されていません`);
        return;
      }
      
      console.log(`[KILL-PORT] 検出されたプロセス: ${Array.from(pids).join(', ')}`);
      
      pids.forEach(pid => {
        exec(`taskkill /F /PID ${pid}`, (killError) => {
          if (killError) {
            console.error(`[KILL-PORT] PID ${pid}の終了に失敗:`, killError.message);
          } else {
            console.log(`[KILL-PORT] PID ${pid}を終了しました`);
          }
        });
      });
    });
  } else {
    // macOS / Linux
    exec(`lsof -ti:${port}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`[KILL-PORT] ポート${port}は使用されていません`);
        return;
      }
      
      const pids = stdout.trim().split('\n');
      
      if (pids.length === 0 || pids[0] === '') {
        console.log(`[KILL-PORT] ポート${port}は使用されていません`);
        return;
      }
      
      console.log(`[KILL-PORT] 検出されたプロセス: ${pids.join(', ')}`);
      
      pids.forEach(pid => {
        exec(`kill -9 ${pid}`, (killError) => {
          if (killError) {
            console.error(`[KILL-PORT] PID ${pid}の終了に失敗:`, killError.message);
          } else {
            console.log(`[KILL-PORT] PID ${pid}を終了しました`);
          }
        });
      });
    });
  }
}

killPort();

// 1秒後に完了メッセージ
setTimeout(() => {
  console.log('[KILL-PORT] 完了');
  console.log('[KILL-PORT] 再度 node start.js を実行してください');
}, 1000);