
async function RAG(ask) {
    // 改行をスペースに置き換える
    ask = ask.replace(/\n/g, '');
    prompt =
        `###### 以下の質問文をネットで検索します。
適切な検索ワードのみを一行で返答してください。
意味を取り違えないように慎重に答えてください。
中国のサイトが引っかかってしまうので、ひらがなを一文字以上含めてください。
<br>
###### 質問文
「${ask}」`
    var query = await sendChatRequest(prompt, false);
    var question = document.getElementsByName('question')[0];
    question.innerHTML = marked.parse("##### 検索中…");
    if (query == "") {
        query = ask;
    }
    console.log("query:" + query);

    const apiKey = 'AIzaSyD-JV-pDdDU1OT39Z6XkHGwKUq7FWwNkD4'; // 取得したAPIキーをここに入れる
    const searchEngineId = 'd04a76dabf9044953'; // 取得した検索エンジンIDをここに入れる
    var refer = "";
    try {
        refer = await fetchAllResults(apiKey, searchEngineId, query, ask);
    } catch {
        refer = "記事が見つからなかったのであなたが答えてください。"
    }
    let d = new Date();
    console.log(d) // Tue Feb 23 2021 21:56:22 GMT+0900 (日本標準時)
    var q =
        `#### **まとめ**
<br>
<details><summary> 注意事項 </summary>
* ユーザーの質問「${ask}」に記事を参考に答えてください。
* まとめの内容に[1]のような参考文献を示す。
* 最後にまとめに利用したリンクの参考文献リスト（番号とリンク付きで箇条書き）をつける。
* リンクは必ず<a>を用いてtarget="_blank"で示す。
* できれば隠してほしい。
* 現在日時：${d} 必要ならば使ってください。
</details><br>

###### 質問
「${ask}」

###### 参考記事
${refer} `
    sendChatRequest(q, false);
}


async function sendScrapeRequest(targetUrl) {
    const fetchUrl = 'https://script.google.com/macros/s/AKfycbyhk6x8MTBWcd_10otMlfe_dLyJ0DcHZ4L4NTO-GmIRCVOwGiXr2m4j_M7b2h_U/exec?url=' + encodeURIComponent(targetUrl);
    // console.log(fetchUrl)
    var content = "";
    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            // mode: 'no-cors', // CORSポリシーによる制限を回避
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (response.ok) {
            const data = await response.json(); // レスポンスをJSONとして取得
            // console.log('Scraping Result:', data); // 結果をコンソールに出力
            content = data.content;  // data.content を取り出す
            console.log(content);  // contentをコンソールに出力
        } else {
            console.error('Error:', response.statusText); // エラー時の処理
        }
    } catch (error) {
        console.error('Request failed:', error); // ネットワークエラー時の処理
        content = "error"
    }
    return content;
};


async function fetchAllResults(apiKey, searchEngineId, query, ask) {
    const url = "https://www.googleapis.com/customsearch/v1?key=" + apiKey + "&cx=" + searchEngineId + "&q=" + query;
    console.log(url);
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    console.log('Search Results:', data);
    let result = "";

    if (data.items) {
        const promises = data.items.map(async (item) => {
            const title = item.title; // タイトルを取得
            const link = item.link;   // リンクを取得
            // console.log('Title:', title);
            // console.log('Link:', link);
            // askに基づくスクレイピングリクエストの送信
            const scrapedContent = await sendScrapeRequest(link);
            const q = `
# ユーザーの質問の「${ask}」の答えになる部分を記事から抽出してください。
<br>
# 注意事項
* 該当箇所がない場合は「☓」のみを回答。
* <details><summary>見出し</summary>記事の内容(箇条書き<li>)</details> を使ってください。
* 主語と述語が不明瞭な場合は補完してください。
* 現在の日時は${new Date()}です。
<br>
# 記事
<a href="${link}">**${title}**</a>
<br>
${scrapedContent}`;
            const res = await gemini(q, false);
            if (!res.includes("☓")) {
                result += `
---
<a href="${link}" target="_blank">**${title}**</a>
<br>${res}`;
            }
            var question = document.getElementsByName('question')[0];
            question.innerHTML = marked.parse(result);
            return { title, link, res };
        });



        // タイムアウトを設定する関数
        const withTimeout = (promise, timeout) => {
            return Promise.race([
                promise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("タイムアウトしました")), timeout)
                ),
            ]);
        };

        // Promise配列を処理し、全てにタイムアウトを追加
        const promisesWithTimeout = promises.map(promise => withTimeout(promise, 20000)); // 5秒のタイムアウト

        try {
            const results = await Promise.all(promisesWithTimeout);
            // alert("終わった");
        } catch (error) {
            console.error(error.message); // タイムアウトなどのエラーを処理
        }

        // 全ての処理が終わるのを待つ
        // const results = await Promise.all(promises);
        // alert("終わった")
    } else {
        console.log('No results found.');
    }
    return result;
};

