// キャッシュ名を定義
const CACHE_NAME = 'pwa-sample-caches';

// キャッシュするURLのリストを定義
const urlsToCache = [
    '/flameofcreation/', // アプリのルートURLをキャッシュ
    // 他のキャッシュしたいリソースをここに追加
];

// インストール処理
self.addEventListener('install', (event) => {
    // インストール時にキャッシュを開き、指定したURLをキャッシュに追加
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching URLs');
                return cache.addAll(urlsToCache); // URLをキャッシュに追加
            })
    );
});

// アクティベート処理
self.addEventListener('activate', (event) => {
    // Service Workerがアクティベートされたときの処理
    console.log('Service Worker: Activated');
    // 古いキャッシュを削除する処理をここに追加することが可能
});

// フェッチ処理
self.addEventListener('fetch', (event) => {
    // ネットワークリクエストが発生したときの処理
    event.respondWith(
        // キャッシュにリクエストをマッチさせる
        caches.match(event.request)
            .then((response) => {
                // キャッシュにレスポンスがあればそれを返し、なければネットワークから取得
                return response || fetch(event.request);
            })
    );
});