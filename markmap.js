
//   let markdown = `
// - こんにちは
//   - 何でもお答えします`;
let markdown = "";
const { markmap } = window;
const { Markmap, loadCSS, loadJS, Transformer } = markmap;

const transformer = new Transformer();
// 1. transform Markdown
var { root, features } = transformer.transform(markdown);
// 2. get assets
// either get assets required by used features
const { styles, scripts } = transformer.getUsedAssets(features);

// or get all possible assets that could be used later
//const { styles, scripts } = transformer.getAssets(features);

// 1. load assets
if (styles) loadCSS(styles);
if (scripts) loadJS(scripts, { getMarkmap: () => markmap });

// 2. create markmap
// `options` is optional, i.e. `undefined` can be passed here
const option = {
    autoFit: true,
    // duration: 1,
    embedGlobalCSS: false,
    maxWidth: 600, // ノードの内容の最大幅を600ピクセルに設定
};
const mindMap = Markmap.create("#mindmap", option, root);



var displayMap = (text) => {
    var transform = transformer.transform(text);
    mindMap.setData(transform.root);
    mindMap.fit("#mindmap", option);
    return transform.root;
}
