
function kihon(ask) {
    // 一旦ここにいれるが整理のできる部分
    document.getElementsByName('question')[0].innerHTML = "";
    document.getElementsByName('answer')[0].style.display = "none";
    var kihon = document.getElementById('kihon');
    kihon.innerHTML = "作成中…";

    const gasWebAppUrl = "https://script.google.com/macros/s/AKfycbwf-On9SlCQlk91oMpatTv5gWMVv7Jd5CMmGNfJvEPHDAwW2It9Sq72DMW9fKY49e5t/exec";

    fetch(`${gasWebAppUrl}?ask=${encodeURIComponent(ask)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async response => {
            // サーバーからのレスポンスを表示する
            kihon.innerHTML = marked.parse(response[0] + response[1]);
            kihon.innerHTML = marked.parse(response[0] + await explain(response) + await geminiAnswer(response) + response[1]);
            startCounter(1000);
            displayMap(kihon.innerHTML.replace(/<[^>]*>/g, ''));
        })
        .catch(error => {
            console.error("基本情報の取得中にエラーが発生しました:", error.message);
            kihon.innerHTML = "<p style=\"color: red;\">基本情報の取得に失敗しました。<br>詳細: " + error.message + "</p>";
        });
}


async function geminiAnswer(response) {
    var prom = `
# 以下の問題に答えてください。
${response[0]}
## フォーマット
{{"answer": "あなたの回答", "confidence": "この問題に間違えると人生が終わります。どれくらいの正解の自信があるかを正直に教えて下さい。"}}
`;
    let jsonObject;
    try {
        // JSONをオブジェクトに変換
        jsonObject = JSON.parse(await gemini(prom, true));
    } catch (error) {
        console.error("Geminiからの応答がJSON形式ではありませんでした:", error);
        return `<details><summary>Gemini!!</summary>
<br>
<div class="gemini" style="color: red;">
Geminiからの応答が有効なJSON形式ではありませんでした。
</div>
</details><br>
`;
    }

    // プロパティにアクセス
    console.log(jsonObject.answer);
    console.log("自信度:", jsonObject.confidence);
    var geminiAns = `
<details><summary>Gemini!!</summary>
<br>
<button class="btn custom-button" onclick="readText('gemini')">${speakerIcon}</button><br>
<div class="gemini">
${jsonObject.answer}<br>
${jsonObject.confidence}<br>
</div>
</details><br>
  `;
    return geminiAns;
}

async function explain(response) {
    var prom = `
# あなたは家庭教師です。以下の問題の難しい単語の意味を簡潔に解説してあげてください。相手は大学生です。
# 問題
${response[0]}
# 注意点
* 生徒は日本語は完璧です。専門用語を教えてあげてください。
* 躓きやすい、難しい単語から順に説明してください。
* 答えを言わないでください。
* 箇条書きのみで答えてください。

## フォーマット
* **用語**：説明

`;
    let geminiResponse;
    try {
        geminiResponse = await gemini(prom, false);
    } catch (error) {
        console.error("Geminiからの応答が期待する形式ではありませんでした (explain):");
        return `<details><summary>用語</summary>
<br>
<div class="yougo" style="color: red;">
用語の解説を取得できませんでした。
</div>
</details><br>
`;
    }

    var geminiAns = `
<details><summary>用語</summary>
<br>
<button class="btn custom-button" onclick="readText('yougo')">${speakerIcon}</button><br>
<div class="yougo">
${marked.parse(geminiResponse)}<br>
</div>
</details><br>
  `;
    return geminiAns;
}

let intervalId;
let counter = 0;

function startCounter(interval) {
    if (counter != 0) {
        counter = 0;
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        counter++;
        const counterElement = document.getElementById("counter");
        if (counterElement) {
            counterElement.textContent = counter;
        }
    }, interval);
}

