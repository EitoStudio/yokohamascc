// スプレッドシートのURL
const WEBCENTER_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1WnhIq6S9GxA8nV0w54lB_gc0Aa9Az4mCHJB7qQkvRfo/export?format=csv';

// リンクを取得する関数
async function getLinks() {
    try {
        const response = await fetch(WEBCENTER_SPREADSHEET_URL + '&gid=0');
        if (!response.ok) {
            throw new Error('スプレッドシートの取得に失敗しました');
        }
        const csvData = await response.text();
        
        // CSVデータを解析
        const rows = csvData.split(/\r?\n/);
        const headers = rows[0].split(',').map(header => header.trim());
        
        // 必要な列を特定
        const nameIndex = headers.indexOf('name');
        const linkIndex = headers.indexOf('link');
        
        // リンクデータを変換
        const links = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // 空行をスキップ
            
            const row = rows[i].split(',').map(cell => cell.trim());
            links.push({
                name: row[nameIndex],
                link: row[linkIndex]
            });
        }
        return links;
    } catch (error) {
        console.error('リンク取得エラー:', error);
        return [];
    }
}

// リンクを表示する関数
async function loadLinks() {
    const webLinks = document.getElementById('webLinks');
    const links = await getLinks();
    
    if (links.length === 0) {
        webLinks.innerHTML = '<p>利用可能なリンクはありません</p>';
        return;
    }

    webLinks.innerHTML = links.map(link => `
        <div class="link-item">
            <i class="fas fa-link"></i>
            <span class="link-name">${link.name}</span>
            <button class="visit-button" onclick="window.open('${link.link}', '_blank')">訪問</button>
        </div>
    `).join('');
}

// 検索機能
const linkSearch = document.getElementById('linkSearch');
linkSearch.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const webLinks = document.getElementById('webLinks');
    const links = await getLinks();
    
    if (links.length === 0) {
        webLinks.innerHTML = '<p>利用可能なリンクはありません</p>';
        return;
    }

    const filteredLinks = links.filter(link => 
        link.name.toLowerCase().includes(searchTerm)
    );

    if (filteredLinks.length === 0) {
        webLinks.innerHTML = '<p>検索結果が見つかりません</p>';
        return;
    }

    webLinks.innerHTML = filteredLinks.map(link => `
        <div class="link-item">
            <i class="fas fa-link"></i>
            <span class="link-name">${link.name}</span>
            <button class="visit-button" onclick="window.open('${link.link}', '_blank')">訪問</button>
        </div>
    `).join('');
});

// 初期表示
loadLinks(); 