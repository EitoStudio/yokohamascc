// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyBW65RySdqP0CR5hr3rRGS7F78ryF5YUSA",
    authDomain: "scc-task.firebaseapp.com",
    projectId: "scc-task",
    storageBucket: "scc-task.firebasestorage.app",
    messagingSenderId: "133871536008",
    appId: "1:133871536008:web:a86204656ffcec71ca5c3d",
    measurementId: "G-YYQTHNQGMZ"
};

// Firebaseの初期化
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// タスクを取得する関数
async function getTasks() {
    try {
        const snapshot = await db.collection('tasks').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('タスク取得エラー:', error);
        return [];
    }
}

// タスクを表示する関数
async function loadTasks() {
    const taskList = document.getElementById('taskList');
    const tasks = await getTasks();
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p>タスクがありません</p>';
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-info">
                <div class="task-name">${task.task}</div>
                <div class="task-dates">
                    作成日: ${task.make}<br>
                    完了予定: ${task.finish} ${task.time || ''}
                </div>
            </div>
            <div class="task-status">
                <select class="status-select" onchange="changeTaskStatus('${task.task}', this.value)">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>未着手</option>
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>進行中</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>完了</option>
                </select>
            </div>
            <div class="task-actions">
                <button class="delete-button" onclick="deleteTask('${task.task}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// タスクの状態を変更する関数
async function changeTaskStatus(taskName, newStatus) {
    try {
        // タスク名でドキュメントを検索
        const querySnapshot = await db.collection('tasks')
            .where('task', '==', taskName)
            .get();

        if (querySnapshot.empty) {
            console.error('タスクが見つかりません:', taskName);
            return;
        }

        // 最初のドキュメントを更新
        const doc = querySnapshot.docs[0];
        await doc.ref.update({
            status: newStatus
        });

        // タスクリストを更新
        loadTasks();
    } catch (error) {
        console.error('タスク状態変更エラー:', error);
        alert('タスクの状態変更に失敗しました');
    }
}

// 次の状態を取得する関数
function getNextStatus(currentStatus) {
    switch (currentStatus) {
        case 'pending':
            return 'in-progress';
        case 'in-progress':
            return 'completed';
        case 'completed':
            return 'pending';
        default:
            return 'in-progress';
    }
}

// 状態の表示テキストを取得する関数
function getStatusText(status) {
    switch (status) {
        case 'pending':
            return '未着手';
        case 'in-progress':
            return '進行中';
        case 'completed':
            return '完了';
        default:
            return '未着手';
    }
}

// タスクを追加する関数
async function addTask() {
    const taskName = document.getElementById('taskName').value;
    const finishDate = document.getElementById('finishDate').value;
    const finishTime = document.getElementById('finishTime').value;
    
    if (!taskName || !finishDate) {
        alert('タスク名と完了日を入力してください');
        return;
    }
    
    const now = new Date();
    const makeDate = now.toISOString().split('T')[0];
    
    try {
        await db.collection('tasks').add({
            task: taskName,
            make: makeDate,
            finish: finishDate,
            time: finishTime,
            status: 'pending'  // デフォルトで未着手
        });
        
        // 入力フィールドをクリア
        document.getElementById('taskName').value = '';
        document.getElementById('finishDate').value = '';
        document.getElementById('finishTime').value = '';
        
        // タスクリストを更新
        loadTasks();
        
        alert('タスクが正常に追加されました');
    } catch (error) {
        console.error('タスク追加エラー:', error);
        alert('タスクの追加に失敗しました');
    }
}

// タスクを削除する関数
async function deleteTask(taskName) {
    if (!confirm('このタスクを削除しますか？')) {
        return;
    }

    try {
        // タスク名でドキュメントを検索
        const querySnapshot = await db.collection('tasks')
            .where('task', '==', taskName)
            .get();

        if (querySnapshot.empty) {
            console.error('タスクが見つかりません:', taskName);
            return;
        }

        // 最初のドキュメントを削除
        const doc = querySnapshot.docs[0];
        await doc.ref.delete();

        // タスクリストを更新
        loadTasks();
    } catch (error) {
        console.error('タスク削除エラー:', error);
        alert('タスクの削除に失敗しました');
    }
}

// リアルタイム更新の設定
db.collection('tasks').onSnapshot(() => {
    loadTasks();
});

// 初期表示
loadTasks(); 