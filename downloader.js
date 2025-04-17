// スプレッドシートのURL
const DOWNLOADER_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1JuBisHd6o5HiOkbDmYRVVHp2aF3kClxkvMLDPhVY6kY/export?format=csv';

// ファイルアイコンのマッピング
const FILE_ICONS = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'txt': 'fa-file-alt',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'gif': 'fa-file-image',
    'mp3': 'fa-file-audio',
    'wav': 'fa-file-audio',
    'mp4': 'fa-file-video',
    'mov': 'fa-file-video',
    'default': 'fa-file'
};

// ファイルを取得する関数
async function getFiles() {
    try {
        const response = await fetch(DOWNLOADER_SPREADSHEET_URL + '&gid=0');
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
        
        // ファイルデータを変換
        const files = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // 空行をスキップ
            
            const row = rows[i].split(',').map(cell => cell.trim());
            files.push({
                name: row[nameIndex],
                link: row[linkIndex]
            });
        }
        return files;
    } catch (error) {
        console.error('ファイル取得エラー:', error);
        return [];
    }
}

// ファイル拡張子からアイコンを取得
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return FILE_ICONS[extension] || FILE_ICONS.default;
}

// ファイルを表示する関数
async function loadFiles() {
    const fileList = document.getElementById('fileList');
    const files = await getFiles();
    
    if (files.length === 0) {
        fileList.innerHTML = '<p>利用可能なファイルはありません</p>';
        return;
    }

    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <i class="fas ${getFileIcon(file.name)}"></i>
            <span class="file-name">${file.name}</span>
            <button class="download-button" onclick="window.open('${file.link}', '_blank')">ダウンロード</button>
        </div>
    `).join('');
}

// 検索機能
const fileSearch = document.getElementById('fileSearch');
fileSearch.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const fileList = document.getElementById('fileList');
    const files = await getFiles();
    
    if (files.length === 0) {
        fileList.innerHTML = '<p>利用可能なファイルはありません</p>';
        return;
    }

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm)
    );

    if (filteredFiles.length === 0) {
        fileList.innerHTML = '<p>検索結果が見つかりません</p>';
        return;
    }

    fileList.innerHTML = filteredFiles.map(file => `
        <div class="file-item">
            <i class="fas ${getFileIcon(file.name)}"></i>
            <span class="file-name">${file.name}</span>
            <button class="download-button" onclick="window.open('${file.link}', '_blank')">ダウンロード</button>
        </div>
    `).join('');
});

// 初期表示
loadFiles(); 