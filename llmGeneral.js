const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
</svg>`
const speakerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
  <path d="M11.536 14.01a.5.5 0 0 1-.638-.057L7.825 11H5.5A1.5 1.5 0 0 1 4 9.5v-3A1.5 1.5 0 0 1 5.5 5h2.325l3.073-2.953a.5.5 0 0 1 .838.37v11.166a.5.5 0 0 1-.2.4zM8 3.707 5.707 6H5.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h.207L8 12.293V3.707z"/>
  <path d="M11.5 8a3.5 3.5 0 0 1 0 7 .5.5 0 0 1 0-1 2.5 2.5 0 0 0 0-5 .5.5 0 0 1 0-1z"/>
</svg>`;


async function sendChatRequest(ask, agenda = false, system = "", history = "") {
    var num = 0;
    // 整理できる部分 
    var allQuestion = document.getElementsByName('question')[num].innerHTML = "";
    var allAmswer = document.getElementsByName('answer')[num].style.display = "none";
    var answer = document.getElementsByName('answer')[num]
    var preAnswer = num != 0 ? document.getElementsByName('answer')[num - 1] : document.getElementsByName('answer')[num]
    var question = document.getElementsByName('question')[num]
    var veryLongText = '';

    // 待ちのメッセージ
    const length = ask.length;
    const time = length / 5
    let road =
        `合計${ask.length}文字 <br>
  予想時間:約${time}秒<br>
  `
    // 質問と回答の場所
    if (agenda) {
        answer.style.display = "none";
    } else {
        answer.style.display = "";
        var displayAsk = ask;
        if (history) {
            displayAsk += "<br>[返信モード]";
        }

        question.innerHTML = marked.parse(displayAsk);
    }

    answer.innerHTML = road;
    var content = await gemini(ask, agenda, system, history);
    // var content = await llama(ask);

    if (agenda) {
        try {
            createTable(content);
            answer.innerHTML = marked.parse(content);
            var allQuestion = document.getElementsByName('question')[num].innerHTML = "";
        } catch {
            answer.innerHTML = marked.parse(content);
        }
    } else {
        // Copy button
        let copyButton = document.createElement('button');
        copyButton.className = 'btn btn-secondary copy-button';
        copyButton.innerHTML = clipboardIcon;
        copyButton.onclick = () => {
            navigator.clipboard.writeText(content).then(() => {
                console.log('Text copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy text:', err);
            });
        };

        const contentDiv = document.createElement('div');
        contentDiv.className = 'ans';
        contentDiv.innerHTML = marked.parse(content);

        const readButton = document.createElement('button');
        readButton.className = 'btn btn-secondary copy-button';
        readButton.innerHTML = speakerIcon;
        readButton.onclick = () => speak(content);

        answer.innerHTML = '';
        answer.appendChild(contentDiv);
        answer.appendChild(copyButton);
        answer.appendChild(readButton);
    }


    displayMap(content);


    return content;

};

async function gemini(ask, agenda, system = "", history = "") {
    const apiKey = 'AIzaSyC1d-U0u7nZZ-1zoE6wwTHVJ7xsj2OnVJ';
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect.value;
    const baseUrl = AIModels[selectedModel];
    const url = `${baseUrl}?key=${apiKey}c`;
    // const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8B:generateContent?key="+apiKey;

    const contents = [];
    // 実際に履歴の管理をするときはこれで追加していく。
    if (history) {
        contents.push({
            role: "model",
            parts: [{ text: history }]
        });
    }
    contents.push({ role: "user", parts: [{ text: ask }] });

    var data = {};
    if (system) {
        data.system_instruction = {
            parts: [{ text: system }]   // ← ここがシステムプロンプト
        };
    }
    data.contents = contents;

    if (agenda) {
        data.generationConfig = {
            response_mime_type: 'application/json'
        };
    }
    console.log(data);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json(); // エラーレスポンスを解析
            const errorMessage = errorData.error ? errorData.error.message : `HTTP error! status: ${response.status}`;

            // 割り当て制限のエラーをチェック
            if (response.status === 429 || (errorData.error && (errorData.error.message.includes("quota") || errorData.error.message.includes("rate limit")))) {
                alert(`APIの利用上限に達しました。しばらく時間をおいてから再度お試しください.\n詳細: ${errorMessage}`);
            } else {
                // その他のAPIエラー
                alert(`APIエラーが発生しました。\n詳細: ${errorMessage}`);
            }
            throw new Error(errorMessage); // より具体的なエラーメッセージを投げる
        }
        const jsonData = await response.json();

        try {
            var content = jsonData.candidates[0].content.parts[0].text;
            console.log(content);
            console.log("成功！");
        } catch (error) {
            console.error("JSON パースエラーまたはデータアクセスエラー:", error);
            let alertMessage = "API応答の解析中にエラーが発生しました。";
            if (!jsonData.candidates || jsonData.candidates.length === 0) {
                alertMessage += "\n候補が見つかりませんでした。";
            } else if (!jsonData.candidates[0].content || !jsonData.candidates[0].content.parts || jsonData.candidates[0].content.parts.length === 0) {
                alertMessage += "\n応答内容が空です。";
            } else {
                alertMessage += `\n詳細: ${error.message}`;
            }
            alert(alertMessage);
            throw error; // エラーを再スローして、呼び出し元で処理できるようにする
        }
    } catch (error) {
        console.error("Google API エラー:", error); // エラーの詳細を出力
        // ネットワークエラーなど、fetch自体が失敗した場合
        alert(`APIリクエスト中にエラーが発生しました。\nネットワーク接続を確認してください。\n詳細: ${error.message}`);
    }
    return content;
}

async function llama(ask, veryLongText) {
    var model = "elyza:jp8b";
    const input = {
        model: "elyza:jp8b",
        messages: [
            {
                role: "user",
                content: ask
            }
        ],
        //"stream": false

        "temperature": 0
    }
    const url = "http://localhost:11434/api/chat";
    // const url = "https://llama.com/11434/api/chat";
    const params = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; utf-8",
            "Accept": "application/json"
        },
        body: JSON.stringify(input)
    };
    console.log(params);

    const div = document.getElementById("foo");
    const response = await fetch(url, params);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log("finish!")
            break;
        }

        const text = decoder.decode(value);
        //div.textContent = div.textContent + text;
        const obj = JSON.parse(text);
        const content = obj.message.content
        // veryLongText += content
        console.log(content)


        isRunning = false;
        stopCounting();

        let markdownText = veryLongText.replace("\n", "<br>").replace("良かった点", "<br>良かった点").replace("悪かった点", "<br>悪かった点").replace("総評", "<br>総評<br><br>").replace("】", "**").replace("【", "**");
        //let markdownText = veryLongText;

        marked.use({
            break: true,
        });
        document.getElementById('preview').innerHTML = marked.parse(markdownText);

    }
    isSpeaking = false;
    console.log("終了！")

};
