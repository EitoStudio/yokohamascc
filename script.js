// ログインフォームの処理
document.addEventListener('DOMContentLoaded', function() {
    // 現在のページのパス名を取得
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('index.html') || currentPath === '/';
    const isHomePage = currentPath.includes('home.html');

    if (isLoginPage) {
        // ログインページの処理
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginButton = document.querySelector('.login-button');
        
        // 音声再生の処理
        const typeSound = document.getElementById('typeSound');
        const errorSound = document.getElementById('errorSound');
        
        if (usernameInput && typeSound) {
            usernameInput.addEventListener('focus', function() {
                typeSound.currentTime = 0; // 音声を最初から再生
                typeSound.play().catch(error => {
                    console.error('音声の再生に失敗しました:', error);
                });
            });
        }
        
        if (loginForm) {
            // ログインフォームのイベントリスナー
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const username = usernameInput.value;
                const password = passwordInput.value;

                if (!username || !password) {
                    if (errorSound) {
                        errorSound.currentTime = 0;
                        errorSound.play().catch(error => {
                            console.error('音声の再生に失敗しました:', error);
                        });
                    }
                    return;
                }

                try {
                    const user = await handleLogin(username, password);
                    if (user) {
                        // 音声再生が完了するまで待機
                        if (user.voice) {
                            const voiceSound = new Audio(user.voice);
                            voiceSound.addEventListener('ended', () => {
                                window.location.href = 'home.html';
                            });
                            await voiceSound.play();
                        } else {
                            window.location.href = 'home.html';
                        }
                    }
                } catch (error) {
                    if (errorSound) {
                        errorSound.currentTime = 0;
                        errorSound.play().catch(error => {
                            console.error('音声の再生に失敗しました:', error);
                        });
                    }
                }
            });
        }

        // パスワード表示/非表示の切り替え
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }
    }

    if (isHomePage) {
        // ホームページの処理
        const storedUserName = localStorage.getItem('userName');
        if (!storedUserName) {
            window.location.href = 'index.html';
            return;
        }

        // PC版のユーザー名を表示
        const pcUsernameElement = document.getElementById('username');
        if (pcUsernameElement) {
            pcUsernameElement.textContent = storedUserName;
        }

        // スマホ版のユーザー名を表示
        const mobileUsernameElement = document.getElementById('sideMenuUsername');
        if (mobileUsernameElement) {
            mobileUsernameElement.textContent = storedUserName;
        }

        // PC版のログアウトボタンの処理
        const pcLogoutBtn = document.getElementById('logoutBtn');
        if (pcLogoutBtn) {
            pcLogoutBtn.addEventListener('click', function() {
                localStorage.removeItem('username');
                localStorage.removeItem('userName');
                window.location.href = 'index.html';
            });
        }

        // スマホ版のログアウトボタンの処理
        const mobileLogoutBtn = document.getElementById('sideMenuLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function() {
                localStorage.removeItem('username');
                localStorage.removeItem('userName');
                window.location.href = 'index.html';
            });
        }

        // メニューボタンの処理
        const menuButton = document.getElementById('menuButton');
        const sideMenu = document.getElementById('sideMenu');
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        if (menuButton && sideMenu) {
            menuButton.addEventListener('click', function() {
                sideMenu.classList.toggle('active');
                menuButton.classList.toggle('active');
            });
        }

        // 初期表示時のタブを設定
        const defaultTab = 'news';
        document.querySelector(`[data-tab="${defaultTab}"]`).classList.add('active');
        document.getElementById(defaultTab).classList.add('active');

        // タブ切り替えの処理
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // アクティブなタブを更新
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // タブコンテンツを更新
                const tabId = this.getAttribute('data-tab');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');

                // スマホの場合、メニューを閉じる
                if (window.innerWidth <= 768) {
                    sideMenu.classList.remove('active');
                    menuButton.classList.remove('active');
                }

                // タブに応じたコンテンツを読み込む
                switch(tabId) {
                    case 'news':
                        loadNews();
                        break;
                    case 'downloader':
                        loadFiles();
                        break;
                    case 'webcenter':
                        loadLinks();
                        break;
                    case 'task':
                        loadTasks();
                        break;
                }
            });
        });

        // ウィンドウサイズが変更された時の処理
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                sideMenu.classList.remove('active');
                menuButton.classList.remove('active');
            }
        });

        // 初期表示時にニュースを読み込む
        loadNews();
    }

    // ダウンロードボタンの処理
    const downloadButtons = document.querySelectorAll('.download-button');
    if (downloadButtons.length > 0) {
        downloadButtons.forEach(button => {
            button.addEventListener('click', function() {
                const fileName = this.parentElement.querySelector('.file-name').textContent;
                alert(`${fileName}をダウンロードします`);
                // ここに実際のダウンロード処理を追加
            });
        });
    }

    // 訪問ボタンの処理
    const visitButtons = document.querySelectorAll('.visit-button');
    if (visitButtons.length > 0) {
        visitButtons.forEach(button => {
            button.addEventListener('click', function() {
                const linkName = this.parentElement.querySelector('.link-name').textContent;
                alert(`${linkName}に移動します`);
                // ここに実際のリンク処理を追加
            });
        });
    }

    // タスクフォームの処理
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTask();
        });
    }
});

// タスクを追加する関数
function addTask(text) {
    const taskList = document.getElementById('taskList');
    const taskId = Date.now();
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
        <input type="checkbox" id="task${taskId}">
        <label for="task${taskId}">${text}</label>
        <span class="task-date">${new Date().toLocaleDateString()}</span>
        <button class="delete-button">削除</button>
    `;
    
    taskList.appendChild(taskItem);
    
    // 削除ボタンの処理
    const deleteButton = taskItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', function() {
        taskItem.remove();
    });
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
