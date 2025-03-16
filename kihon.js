
function kihon(ask) {
    // 一旦ここにいれるが整理のできる部分
    document.getElementsByName('question')[0].innerHTML = "";
    document.getElementsByName('answer')[0].style.display = "none";
    var kihon = document.getElementById('kihon');
    kihon.innerHTML = "作成中…";
    google.script.run
        .withSuccessHandler(async function (response) {
            // サーバーからのレスポンスを表示する
            kihon.innerHTML = marked.parse(response[0] + response[1]);
            kihon.innerHTML = marked.parse(response[0] + await explain(response) + await geminiAnswer(response) + response[1]);
            startCounter(1000);
            displayMap(kihon.innerHTML.replace(/<[^>]*>/g, ''));
            // console.log(kihon.innerHTML.replace(/<[^>]*>/g, ''))
        })
        .withFailureHandler(function (error) {
            console.error("エラーが発生しました:", error.message);
            kihon.innerHTML = "エラーが発生しました: " + error.message;
        })
        .getData(ask);

}


async function geminiAnswer(response) {
    var prom = `
# 以下の問題に答えてください。
${response[0]}
## フォーマット
{{"answer": "あなたの回答", "confidence": "この問題に間違えると人生が終わります。どれくらいの正解の自信があるかを正直に教えて下さい。"}}
`;
    // JSONをオブジェクトに変換
    var jsonObject = JSON.parse(await gemini(prom, true));
    // プロパティにアクセス
    console.log(jsonObject.answer);
    console.log("自信度:", jsonObject.confidence);
    var geminiAns = `
<details><summary>Gemini!!</summary>
<br>
<button class="btn custom-button" onclick="readText('gemini')">読み上げる</button><br>
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
    var geminiAns = `
<details><summary>用語</summary>
<br>
<button class="btn custom-button" onclick="readText('yougo')">読み上げる</button><br>
<div class="yougo">
${marked.parse(await gemini(prom, false))}<br>
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
        document.getElementById("counter").textContent = counter;
    }, interval);
}

