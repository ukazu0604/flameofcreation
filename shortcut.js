window.onload = function () {
    document.getElementById('message').focus();
};

document.getElementById("newline-btn").addEventListener("click", addNewline);
document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.shiftKey) {
        addNewline();
        event.preventDefault(); // デフォルトの動作を無効化
    }
});

function addNewline() {
    const textArea = document.getElementById("message");
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

var selectBox = document.getElementById('function-select');
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
        scrollToTop();
        cleanAndRequest();
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // スムーズにスクロールするオプション
    });
}

system = "日本語で回答してください";// システムメッセージの初期値 返信用
async function cleanAndRequest() {
    // 入力メッセージと回答の削除
    ask = document.getElementById('message').value;
    document.getElementById('message').value = '';
    document.getElementById('result-div').innerHTML = '';

    //二回目以降は改行を入れて会話が続くようにする　ここ、改善ポイント
    finalTranscript = '\n';
    var model = document.getElementById('function-select').value;
    var num = 0;
    var preAnswer = num != 0 ? document.getElementsByName('answer')[num - 1] : document.getElementsByName('answer')[num]
    // ２回改行はRAG
    if (ask.match(/^\n{2}/) || model == "rag") {
        RAG(ask);
    }
    else if (ask.match(/^[\r\n]/)) {
        var history = `${document.getElementById('kihon').innerText}
        ${preAnswer.innerText}
        `;
        sendChatRequest(ask, false, system, history);
    }
    else if (model == "agent") {
        agent(ask);
    }
    else if (model == "agenda") {
        agenda(ask);
    } else if (!isNaN(parseFloat(ask)) || ask == "") {
        // 未入力は最新のものを
        ask = ask === "" ? -1 : ask;
        kihon(ask);
    }
    else if (model == "qa") {
        qa(ask);
    }
    else if (model == "story") {
        story(ask);
    }
    else if (model == "deep") {
        deepthink(ask);
    }
    else {
        normal(ask);
    }
}

function qa(ask) {
    system = `よくある質問に回答するモード。最低五個質問を考えてそれに答えてください。
質問は「Q:」で始まり、回答は「A:」で始まります。生成はQ:　で始めてください。見やすいように問題だけ太文字を使ってください。`
    sendChatRequest(ask, false, system);
}
function story(ask) {
    system = `対話物語モード。登場人物に会話させて本質が何かを考えさせる。`
    sendChatRequest(ask, false, system);
}
async function deepthink(ask) {
    system = `超深層思考モード。より高度な厳密性、細部への注意、そして多角的な検証を実行します。まずタスクの概要をまとめ、問題をサブタスクに分解することから始めてください。各サブタスクについて、最初は無関係またはありそうにないと思われるものも含め、複数の視点を探求してください。あらゆる段階で、自身の仮定を意図的に反証または挑戦することを試みてください。全てを三重に検証してください。各ステップを批判的にレビューし、あなたの論理、仮定、結論を精査し、不確実性や代替的な視点を明確に指摘してください。代替的な方法論やツールを用いてあなたの推論を独立して検証し、全ての事実、推論、結論を外部データ、計算、または権威ある情報源と照合してください。通常使用する検証ツールや方法の少なくとも2倍の数を意図的に探し出し、使用してください。あなたの主張を相互検証するために、数学的な検証、ウェブ検索 (のシミュレーション)、論理評価フレームワーク、および追加リソースを明確かつ積極的に使用してください。あなたの解決策に完全に自信がある場合でも、弱点、論理的なギャップ、隠れた仮定、または見落としを体系的に探すために、追加の時間と労力を明確に割いてください。これらの潜在的な落とし穴と、それらにどのように対処したかを明確に文書化してください。あなたの分析が堅牢で完全であると完全に確信したら、意図的に一時停止し、思考の連鎖全体を最初からもう一度再考するように強制してください。この最後の内省的なステップを明確に詳述してください。`
    var q = await sendChatRequest(ask, false, system);
    sendChatRequest(ask, false, q);
}
function normal(ask) {
    system = "できるだけ箇条書き";
    sendChatRequest(ask, false, system);
}
function agenda(ask) {
    system = `##### agenda
##### あなたは、スケジュール管理をする人です。
##### フォーマット
{"schedule": [{"time": "", "activity": ""}, {"time": "", "activity": ""}]}
##### 履歴
${preAnswer.innerText}`
    sendChatRequest(ask, true, system);
}