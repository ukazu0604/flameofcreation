// ここから音声入力
const startBtn = document.querySelector('#start-btn');
const stopBtn = document.querySelector('#stop-btn');
const resultDiv = document.querySelector('#result-div');

SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
let recognition = new SpeechRecognition();

recognition.lang = 'ja-JP';
recognition.interimResults = true;
recognition.continuous = true;

let finalTranscript = ''; // 確定した(黒の)認識結果
var listening = false;
let timer; // タイマー
var id = 0;

recognition.onresult = (event) => {
    if (listening) return;
    // alert("start")
    listening = true;
    var num = id + 1;
    id++;
    let interimTranscript = ""; // 暫定(灰色)の認識結果
    var transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript = event.results[i][0].transcript.replace(transcript, "").trim();
        // if (event.results[i].isFinal & !finalTranscript.includes(transcript) & !transcript.includes(finalTranscript)) {
        // 	// ここにきっと一回も入っていない
        // 	finalTranscript += transcript;
        // } else {
        // 	interimTranscript = transcript;
        // }
        // 一旦ここで保留

        if (event.results[i].isFinal) {
            // `transcript` から `finalTranscript` を除外
            let newText = transcript.replace(finalTranscript, "").trim();
            if (newText) {
                // if (newText.replace(" ", "").trim().includes(finalTranscript) || newText.includes(finalTranscript)||newText.includes()) {
                if (newText.replace(" ", "").trim().includes(finalTranscript) || newText.includes(finalTranscript) || finalTranscript.includes(newText)) {
                    finalTranscript = newText;
                    // alert("=newText")
                }
                else {
                    finalTranscript += newText;
                }
            }
        } else {
            // 暫定結果を保持（必要に応じて `finalTranscript` を削除）
            interimTranscript = transcript.replace(finalTranscript, "").trim();
        }
    }
    resultDiv.innerHTML = finalTranscript + interimTranscript;
    // 確定結果と暫定結果を表示
    document.getElementById('message').value = finalTranscript;
    listening = false;

    timer = setTimeout(() => {
        if (num == id & listening === false & finalTranscript != "" & document.getElementById('message').value != "") {
            var ask = finalTranscript;
            finalTranscript = "";
            document.getElementById('message').value = "";
            document.getElementById('result-div').innerHTML = '';
            sendChatRequest(ask, true);
            // alert(ask);

        }
    }, 1000); // 待つ
    // alert(finalTranscript)
    // document.getElementById('resultDiv').innerHTML =
    // 	finalTranscript + '<i style="color:#ddd;">' + interimTranscript + '</i>';
}

startBtn.onclick = () => {
    recognition.start();
}
stopBtn.onclick = () => {
    window.speechSynthesis.cancel();
    recognition.stop();
}


// ここからjsonで受け取ったときのテーブル追加処理
function createTable(content) {
    content = JSON.parse(content);

    // 最初のキーを取得
    const firstKey = Object.keys(content)[0];
    console.log(firstKey);
    const json = content[firstKey]; // 最初のキーに対応するデータ


    // すべてのテーブル要素を取得
    const tables = document.querySelectorAll('table');

    // すでにあるテーブルを削除
    tables.forEach(table => {
        table.remove();
    });

    // table要素を生成
    var table = document.createElement('table');
    var tr = document.createElement('tr');
    for (key in json[0]) {
        var th = document.createElement('th');
        th.textContent = key;
        tr.appendChild(th);
    }
    table.appendChild(tr);

    // テーブル本体を作成（おそらく修正ポイント）
    for (var i = 0; i < json.length; i++) {
        var tr = document.createElement('tr');
        for (key in json[0]) {
            var td = document.createElement('td');
            td.textContent = json[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    // 生成したtable要素を追加する
    document.getElementById('maintable').appendChild(table);
}


function isMobile() {
    // UserAgentでスマホ判定
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// 任意のテキストを読み上げる関数
function speak(text) {
    // SpeechSynthesisのインスタンスを作成
    var utterance = new SpeechSynthesisUtterance(text);

    // 音声の設定（オプション）
    utterance.lang = 'ja-JP'; // 日本語に設定
    utterance.volume = 1; // 音量（0.0 から 1.0）
    utterance.rate = isMobile() ? 1.5 : 3; // 話す速度（0.1 から 10）
    utterance.pitch = isMobile() ? 1.0 : 1.3; // 声の高さ（0 から 2）

    // 音声を合成して再生
    window.speechSynthesis.speak(utterance);
}

// 既存のreadText関数を、新しいspeak関数を利用するように修正
function readText(className) {
    // すべてのテキストを取得
    var texts = document.querySelectorAll(`.${className}`);
    var combinedText = '';

    // 各要素のテキストを結合（<details>内も含む）
    texts.forEach(function (element) {
        combinedText += element.textContent + ' '; // textContentで隠れたテキストも取得
    });

    speak(combinedText);
}

function readAllText() {
    readText('mondai');
    readText('mondai');
    readText('yougo');
    readText('gemini');
    readText('kotae');
}
