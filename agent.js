async function agent(ask) {

    var system = `あなたは、ユーザーの発言に応じて、次のいずれかを返答するエージェントです。
    1. qa: ユーザーの発言に対して、質問である場合。
    2. search: ユーザーの発言に関連する情報をWeb検索し、結果を返す。調べる必要がある場合に使われる。
    3. deepthink: ユーザーの発言に対して深く考察し、詳細な回答を提供する。思考が必要な場合に使われる。
    4. story: ユーザーの発言に基づいて物語を生成する。物語形式がわかりやすいトピックの場合はこれを使う。説明が難しい場合は、物語形式で説明する。
    5. chat: ユーザーの発言に対して、一般的な会話を行う。ユーザーの発言が質問や特定のアクションを必要としない場合に使われる。
    あなたは、ユーザーの発言に対して、適切なアクションを選択し、その結果を返答します。
    ユーザーの発言は、あなたの判断に基づいて適切なアクションを選択するための情報源です。
    ユーザーの発言に対して、適切なアクションを選択し、その結果を返答してください。
    優先順位は数字の小さい順に高いです。
    `;
    var q = `ユーザーの発言に応じて、次のいずれかを返答してください：qa / search / deepthink / story / chat 
    発言: "${ask}"`
    const actionType = await sendChatRequest(q, false, system);

    let result;
    console.log("アクションタイプ:", actionType); // アクションタイプをコンソールに出力


    // 後で共通化する！！
    switch (true) {
        case actionType.includes("search"):
            RAG(ask);
            break;
        case actionType.includes("deepthink"):
            deepthink(ask);
            break;
        case actionType.includes("qa"):
            qa(ask);
            break;
        case actionType.includes("story"):
            story(ask);
            break;
        default:
            normal(ask);
            break;
    }
}