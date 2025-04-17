// スプレッドシートのURL
const AUTH_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1zkouv2DuGGvut3XhRnUaKrPGazyL-ZN1FSKtQFmY76Q/export?format=csv';

// ユーザー情報を取得する関数
async function getUsers() {
    try {
        const response = await fetch(AUTH_SPREADSHEET_URL + '&gid=0');
        if (!response.ok) {
            throw new Error('スプレッドシートの取得に失敗しました');
        }
        const csvData = await response.text();
        
        // CSVデータを解析
        const rows = csvData.split(/\r?\n/);
        const headers = rows[0].split(',').map(header => header.trim());
        
        // 必要な列を特定
        const usernameIndex = headers.indexOf('username');
        const passwordIndex = headers.indexOf('password');
        const nameIndex = headers.indexOf('name');
        const voiceIndex = headers.indexOf('voice');
        
        // ユーザー情報を配列に格納
        const users = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // 空行をスキップ
            
            const row = rows[i].split(',').map(cell => cell.trim());
            users.push({
                username: row[usernameIndex],
                password: row[passwordIndex],
                name: row[nameIndex],
                voice: row[voiceIndex]
            });
        }
        
        return users;
    } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        return [];
    }
}

// ユーザー認証関数
async function authenticate(username, password) {
    try {
        const response = await fetch(AUTH_SPREADSHEET_URL + '&gid=0');
        if (!response.ok) {
            throw new Error('スプレッドシートの取得に失敗しました');
        }
        const csvData = await response.text();
        
        // CSVデータを解析
        const rows = csvData.split(/\r?\n/);
        const headers = rows[0].split(',').map(header => header.trim());
        
        // 必要な列を特定
        const usernameIndex = headers.indexOf('username');
        const passwordIndex = headers.indexOf('password');
        const nameIndex = headers.indexOf('name');
        
        // ユーザー情報を検索
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // 空行をスキップ
            
            const row = rows[i].split(',').map(cell => cell.trim());
            if (row[usernameIndex] === username && row[passwordIndex] === password) {
                return {
                    success: true,
                    name: row[nameIndex]
                };
            }
        }
        return { success: false };
    } catch (error) {
        console.error('認証エラー:', error);
        return { success: false };
    }
}

// ログイン処理
async function handleLogin(username, password) {
    try {
        console.log('ログイン試行:', username);
        const users = await getUsers();
        console.log('取得したユーザー:', users);
        
        const user = users.find(u => u.username === username && u.password === password);
        console.log('マッチしたユーザー:', user);
        
        if (user) {
            localStorage.setItem('username', user.username);
            localStorage.setItem('userName', user.name);
            return user;
        }
        throw new Error();
    } catch (error) {
        console.error('ログインエラー:', error);
        throw new Error();
    }
} 