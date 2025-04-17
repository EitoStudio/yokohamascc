// スプレッドシートのURL
const NEWS_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1TG6Y_PqKFBkqRPCn0n6Fjskwfd87wBC1yftLPjLi4qA/export?format=csv';

// ニュースを取得する関数
async function getNews() {
    try {
        // Sheet1のデータを取得
        const response = await fetch(NEWS_SPREADSHEET_URL + '&gid=0');
        if (!response.ok) {
            throw new Error('スプレッドシートの取得に失敗しました');
        }
        const csvData = await response.text();
        
        // CSVデータを解析
        const rows = csvData.split(/\r?\n/);
        const headers = rows[0].split(',').map(header => header.trim());
        
        // 必要な列を特定
        const titleIndex = headers.indexOf('title');
        const contentIndex = headers.indexOf('content');
        const dateIndex = headers.indexOf('date');
        
        // ニュースデータを変換
        const news = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // 空行をスキップ
            
            const row = rows[i].split(',').map(cell => cell.trim());
            news.push({
                title: row[titleIndex],
                content: row[contentIndex],
                date: row[dateIndex]
            });
        }
        return news;
    } catch (error) {
        console.error('ニュース取得エラー:', error);
        return [];
    }
}

// ニュースを読み込む関数
async function loadNews() {
    const newsContainer = document.getElementById('newsContainer');
    const news = await getNews();

    if (news.length === 0) {
        newsContainer.innerHTML = '<p>ニュースはありません</p>';
        return;
    }

    newsContainer.innerHTML = news.map(item => `
        <div class="news-item">
            <h3>${item.title}</h3>
            <p>${item.content}</p>
            <span class="news-date">${item.date}</span>
        </div>
    `).join('');
} 