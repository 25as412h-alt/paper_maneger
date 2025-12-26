const { ipcMain } = require('electron');

/**
 * IPCハンドラーを登録する関数
 * main.js から呼び出されます
 */
function register(ipcMain) {
    console.log('Figure handlers registered');

    // ここに図表操作に関するIPC通信の定義を書いていきます
    // 例: 
    // ipcMain.handle('get-figure', async (event, arg) => {
    //     return { success: true };
    // });
}

module.exports = {
    register: register
};