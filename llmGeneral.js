
async function sendChatRequest(ask, agenda) {
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
        question.innerHTML = marked.parse(ask);
    }

    answer.innerHTML = road;
    var content = await gemini(ask, agenda);
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
        answer.innerHTML = `   <button class="btn custom-button" onclick="readText('ans')">読み上げる</button><br>
<div class="ans">
${marked.parse(content)}<br>
</div>`
    }


    displayMap(content);


    return content;

};


async function gemini(ask, agenda) {
    const apiKey = 'AIzaSyC1d-U0u7nZZ-1zoE6wwTHVJ7xsj2OnVJ';
    // const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key="+apiKey;
    // const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key="+apiKey;
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=" + apiKey +"c"
    // const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8B:generateContent?key="+apiKey;
    var data;
    if (agenda) {
        data = {
            contents: [{ parts: [{ text: ask }] }],
            generationConfig: { response_mime_type: 'application/json' }
        };
    } else {
        data = {
            contents: [{ parts: [{ text: ask }] }]
        };
    }
    console.log(ask)
    var content = "";
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
            throw new Error(errorMessage); // より具体的なエラーメッセージを投げる
        }
        const jsonData = await response.json();

        try {
            content = jsonData.candidates[0].content.parts[0].text;
            console.log(content);
            console.log("成功！");
        } catch (error) {
            console.error("JSON パースエラーまたはデータアクセスエラー:", error);
            // エラーハンドリングを追加: candidates配列がない場合、parts配列がない場合、parts[0]にアクセスできない場合など
            if (!jsonData.candidates || jsonData.candidates.length === 0) {
                console.error("candidates 配列が空です");
                console.log(jsonData);
            } else if (!jsonData.candidates[0].content || !jsonData.candidates[0].content.parts || jsonData.candidates[0].content.parts.length === 0) {
                console.error("content.parts 配列が空です");
                console.log(jsonData.candidates[0]);
            } else {
                console.error("予期せぬエラー:", error);
            }
        }
    } catch (error) {
        console.error("Google API エラー:", error); // エラーの詳細を出力
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
