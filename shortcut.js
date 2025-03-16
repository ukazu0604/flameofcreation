
// ページが読み込まれたときに特定のテキストボックスにフォーカスを当てる
window.onload = function () {
    document.getElementById('message').focus();
};

// 改行ボタンの機能
document.getElementById("newline-btn").addEventListener("click", addNewline);
// ページ全体でショートカット (Ctrl + Shift ) を設定
document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.shiftKey) {
        addNewline();
        event.preventDefault(); // デフォルトの動作を無効化
    }
});
// 改行挿入の関数化
function addNewline() {
    const textArea = document.getElementById("message");
    // 入力チェック
    if (textArea.value.trim() !== "") { // 文字が入力されている場合
        // 入力メッセージと回答の削除
        ask = document.getElementById('message').value;
        document.getElementById('message').value = '';
        document.getElementById('result-div').innerHTML = '';
        RAG(ask);
        return;
    }
    const cursorPosition = textArea.selectionStart;
    const textBefore = textArea.value.substring(0, cursorPosition);
    const textAfter = textArea.value.substring(cursorPosition);
    // 改行をカーソル位置に挿入
    textArea.value = textBefore + "\n\n" + textAfter;
    // カーソル位置を改行後に移動
    textArea.selectionStart = textArea.selectionEnd = cursorPosition + 2;
    textArea.focus();
    // 取得し直してそこにスクロール
    var answer = document.getElementsByName('answer')[0]
    const rect = answer.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    window.scrollTo({
        top: rect.top + scrollTop,
        // 	behavior: 'smooth' // スムーススクロール
        behavior: 'auto'
    });
}

var selectBox = document.getElementById('model-select');
const optionsLength = selectBox.options.length;

document.addEventListener("keydown", function (event) {
    const currentIndex = selectBox.selectedIndex;
    if (event.key === 'ArrowUp') {
        // 上矢印で前の選択肢に移動
        if (currentIndex > 0) {
            selectBox.selectedIndex = currentIndex - 1;
        } else {
            selectBox.selectedIndex = optionsLength - 1; // Wrap to the last option
        }
        event.preventDefault();
    } else if (event.key === 'ArrowDown') {
        // 下矢印で次の選択肢に移動
        if (currentIndex < optionsLength - 1) {
            selectBox.selectedIndex = currentIndex + 1;
        } else {
            selectBox.selectedIndex = 0; // Wrap to the first option
        }
        event.preventDefault();
    }
});



var ask = "";
// Enterキーで送信する
document.getElementById('message').addEventListener('keydown', function (event) {
    // Shift+Enterで改行、Enterだけで送信
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        cleanAndRequest();
    }
});

async function cleanAndRequest() {
    // 入力メッセージと回答の削除
    ask = document.getElementById('message').value;
    document.getElementById('message').value = '';
    document.getElementById('result-div').innerHTML = '';

    //二回目以降は改行を入れて会話が続くようにする　ここ、改善ポイント
    finalTranscript = '\n';
    var model = document.getElementById('model-select').value;
    var num = 0;
    var preAnswer = num != 0 ? document.getElementsByName('answer')[num - 1] : document.getElementsByName('answer')[num]
    // ２回改行はRAG
    if (ask.match(/^\n{2}/) || model == "rag") {
        RAG(ask);
    }
    else if (model == "agenda") {
        ask =
            `##### agenda
##### あなたは、スケジュール管理をする人です。
##### ユーザーの入力
${ask}
##### フォーマット
{"schedule": [{"time": "", "activity": ""}, {"time": "", "activity": ""}]}
##### これまでのJSON（あれば）
${preAnswer.innerText}`
        sendChatRequest(ask, true);
    } else if (ask.match(/^[\r\n]/)) {
        ask =
            `##### assistantの回答
<br>
${document.getElementById('kihon').innerText}
${preAnswer.innerText}
##### userの質問
<br>
${ask}`;
        sendChatRequest(ask, false);
    } else if (!isNaN(parseFloat(ask)) || ask == "") {

        // 未入力は最新のものを
        ask = ask === "" ? -1 : ask;
        kihon(ask);
    }
    else if (model == "story") {
        ask =
            `### ${ask}
  #### フォーマット
  Q＆A形式
  `
        // 登場人物は、かな（初心者、いろんな疑問を持つ）
        // 先生

        sendChatRequest(ask, false);
    }
    else {
        sendChatRequest(ask + "（箇条書きで）", false);
    }
}

