# kizi システム設計・リポジトリ・保守契約 v2

最終更新: 2026-08-22

この文書は、kiziのサイト、記事リポジトリ、Cloudflare配信層、macOS投稿アプリを同じ仕様で保つための共通契約です。`kizi`、`kizi-kougaku`、`kizi-other`の3リポジトリで同一内容を維持します。AI原稿の形式は`docs/article-format.md`、作業者向けの短い強制ルールは`AGENTS.md`を正とします。

## 1. v2で変わること

読者向けサイトを`https://kizi.pages.dev`へ再統合します。記事の正本を2つのGitHubリポジトリへ分けるルールは維持し、Cloudflare R2を配信専用ストアとして追加します。

| 項目 | v1 | v2 |
| --- | --- | --- |
| 読者向けサイト | 工学版と非工学版の2オリジン | `kizi.pages.dev`の1オリジン |
| 記事の正本 | 2記事リポジトリ | 変更なし |
| 記事HTMLの実配信 | 各Pagesの静的ファイル | R2からkizi Pages Functionsが返す |
| canonical | 各記事版オリジン | `https://kizi.pages.dev/articles/<ID>` |
| ブラウザ内保存 | 2オリジンに分散 | kiziの1オリジンへ統合 |
| 公開完了判定 | 記事版Pagesと記事版URL | GitHub Action、R2 status、kizi記事URL |

Markdown形式、記事ID、Issue採番、ジャンル、翻訳、画像プール、1記事1ファイルの契約は変えません。通常の記事投稿画面にも新しいCloudflare認証入力を追加しません。

## 2. 全体構成

```text
AI / 編集者
    ↓ Markdown
kizi Publisher
    ├─ 2記事リポジトリを同期
    ├─ ID / Issueを横断採番
    ├─ Markdown・HTML・index・RSS・sitemapを生成
    ├─ npm run check
    └─ 対象記事リポジトリのmainへ1 commitでpush
             ↓
GitHub Actions: Publish to kizi
    ├─ npm run check
    ├─ GitHub OIDC tokenを取得
    ├─ 変更されたHTMLだけをkizi同期APIへ送る
    └─ 版カタログを最後に確定
             ↓
Cloudflare R2: kizi-articles
    ├─ articles/<SHA-256>.html
    ├─ catalogs/engineering.json
    ├─ catalogs/other.json
    └─ status/<edition>/<commit>.json
             ↓ R2 binding: ARTICLES
kizi Pages Functions
    ├─ /articles/<ID>
    ├─ /api/catalog
    ├─ /api/publish-status
    ├─ /feed.xml
    └─ /sitemap.xml
             ↓
https://kizi.pages.dev
```

読者リクエスト時にGitHubへ接続しません。通常閲覧はCloudflare Pages、Pages Functions、R2だけで完結します。GitHub障害は新規公開を遅らせますが、R2に確定済みの既存記事は読み続けられます。

## 3. リポジトリと責務

| リポジトリ | edition | 責務 |
| --- | --- | --- |
| `oriyu90/kizi` | `delivery` | 統合UI、Pages Functions、R2読取・同期API、配信テスト、共通文書 |
| `oriyu90/kizi-kougaku` | `engineering` | `categories`に`engineering`を含むMarkdown正本と生成物 |
| `oriyu90/kizi-other` | `other` | `categories`に`engineering`を含まないMarkdown正本と生成物 |
| `oriyu90/kizi-publisher-macos` | 該当なし | 投稿、生成、検証、Git更新、公開完了確認を行うprivateアプリ |

読者向け記事URLは版にかかわらず`https://kizi.pages.dev/articles/<ID>`です。`kizi-kougaku.pages.dev`と`kizi-other.pages.dev`は正規URLではなく、移行後はkiziへの互換転送だけを行います。

雄武町の金銀鉱床の記事`2026.8.19.1`は`engineering`を含み、正本は`kizi-kougaku`だけに置きます。公開URLは`https://kizi.pages.dev/articles/2026.8.19.1`です。

## 4. 正本と生成物

記事本文の唯一の編集元は`content/articles/<ID>.md`です。

```text
content/articles/<ID>.md               編集する正本
website/articles/<ID>.html             Publisher生成物
website/articles/index.json            版カタログの入力
website/index.html                      記事版の検証・互換用生成物
website/feed.xml                        記事版の検証・互換用生成物
website/sitemap.xml                     記事版の検証・互換用生成物
scripts/sync-delivery.mjs               R2差分同期クライアント
.github/workflows/publish-to-kizi.yml  自動同期起点
```

`kizi`リポジトリにはMarkdown正本と記事HTMLを保存しません。R2も編集元ではなく、GitHubの確定コミットから再生成できる配信キャッシュです。

## 5. `site.config.json`契約

v2では`schemaVersion`を`2`にします。Publisherは未知のschemaVersionを黙って処理しません。

### 配信リポジトリ

```json
{
  "schemaVersion": 2,
  "edition": "delivery",
  "name": "kizi",
  "origin": "https://kizi.pages.dev",
  "publishesArticles": true,
  "articleSources": [
    {"edition": "engineering", "repository": "oriyu90/kizi-kougaku"},
    {"edition": "other", "repository": "oriyu90/kizi-other"}
  ],
  "delivery": {
    "store": "cloudflare-r2",
    "bucket": "kizi-articles",
    "binding": "ARTICLES",
    "syncAudience": "https://kizi.pages.dev/api/sync"
  }
}
```

### 記事リポジトリ

```json
{
  "schemaVersion": 2,
  "edition": "engineering",
  "name": "kizi 工学 source",
  "origin": "https://kizi-kougaku.pages.dev",
  "deliveryOrigin": "https://kizi.pages.dev",
  "repository": "oriyu90/kizi-kougaku",
  "articleRouting": {
    "requireCategories": ["engineering"],
    "excludeCategories": []
  }
}
```

非工学版は`edition: other`、`repository: oriyu90/kizi-other`、`excludeCategories: ["engineering"]`です。記事HTMLのcanonical、OGP URL、JSON-LD URLは`origin`ではなく`deliveryOrigin`を使います。

## 6. 記事ID、Issue、ジャンル

- 記事IDは`YYYY.M.D.N`で、Asia/Tokyoの公開日と当日内連番を表します。
- IDとIssueは2記事リポジトリの和集合で一意にします。
- ファイル名、front matter、カタログID、HTMLの`data-article-slug`を一致させます。
- `categories`のどこかに`engineering`があれば工学版、それ以外は非工学版です。
- `categories[0]`は主ジャンル、`heroPool`は主ジャンルと一致させます。
- 一度公開したIDを別記事へ再利用しません。

## 7. R2オブジェクト契約

バケット名は`kizi-articles`、Pages Functions binding名は`ARTICLES`です。

```text
articles/<artifactHash>.html
catalogs/engineering.json
catalogs/other.json
status/<edition>/<40桁commit>.json
staging/<edition>/<commit>/session.json
staging/<edition>/<commit>/receipts/<batch>.json
```

`artifactHash`は記事HTMLのUTF-8バイト列に対する小文字64桁のSHA-256です。記事オブジェクトはcontent-addressedで不変とし、同じ内容を再アップロードしません。

確定版カタログは`schemaVersion: 2`で、少なくとも次を持ちます。

```json
{
  "schemaVersion": 2,
  "edition": "engineering",
  "source": {
    "repository": "oriyu90/kizi-kougaku",
    "commit": "40桁SHA"
  },
  "publishedAt": "ISO 8601",
  "categories": [],
  "imagePools": {},
  "articles": [
    {
      "id": "2026.8.19.1",
      "edition": "engineering",
      "url": "/articles/2026.8.19.1",
      "artifactHash": "64桁SHA-256",
      "storageKey": "articles/<artifactHash>.html"
    }
  ]
}
```

記事追加・更新時は新しい記事オブジェクトを先に保存し、全バッチ成功後に`catalogs/<edition>.json`を最後に置き換えます。途中失敗時は旧カタログが残るため、未完成版は読者から参照されません。削除時はカタログから先に外し、到達不能オブジェクトは後日のGCまで残します。

## 8. GitHub ActionsとOIDC同期

記事リポジトリのworkflow名は`Publish to kizi`、job名は`delivery`に固定します。

必要な権限は次だけです。

```yaml
permissions:
  contents: read
  id-token: write
```

Cloudflare API token、R2 access key、共有HMAC secretをGitHubへ保存しません。Actionはaudience `https://kizi.pages.dev/api/sync` のGitHub OIDC tokenを取得します。kizi側は署名、issuer、audience、有効期限、`repository_owner`、`repository`、`ref == refs/heads/main`、`sha`を検証します。

同期は次の3段階です。

1. `POST /api/sync/begin`: 版、commit、全カタログ、各HTMLのSHA-256を送る。現在の確定カタログと比較し、変更・追加されたIDだけを返す。
2. `POST /api/sync/articles`: 指定されたIDのHTMLを最大12件ずつ送る。サーバーがSHA-256を再計算し、一致したオブジェクトだけ保存する。
3. `POST /api/sync/finalize`: 全receipt、他版とのID非重複を確認し、版カタログとstatusを確定する。

再試行は冪等です。同じcommitと同じbatchを再送しても同じcontent-addressed keyとreceiptへ上書きされます。`begin`後に失敗した場合、読者向けカタログは変わりません。

Actionは同期前に`git ls-remote origin refs/heads/main`を実行し、`GITHUB_SHA`が現在のmainでなければ停止します。kizi側も確定カタログのGitHub `runId`より古いworkflow runを拒否し、古いActionの再実行で新しいカタログを巻き戻さないようにします。

## 9. Pages Functions公開API

| API | 用途 | キャッシュ |
| --- | --- | --- |
| `GET /articles/<ID>` | 2カタログからIDを解決しR2記事HTMLを返す | 短いbrowser cacheとstale許容 |
| `GET /api/catalog` | 2版を重複確認して日付・order降順に統合 | 60秒 |
| `GET /api/publish-status?edition=&commit=` | Publisherの公開完了確認 | `no-store` |
| `GET /api/health` | R2 bindingと各カタログのcommit確認 | `no-store` |
| `GET /api/r2-usage` | 当月のR2無料枠使用量と課金目安 | 300秒 |
| `GET /feed.xml` | 統合RSS | 300秒 |
| `GET /sitemap.xml` | 統合sitemap | 300秒 |

存在しない記事は404、カタログにはあるがR2本文が欠ける異常は503で返します。`.html`付き旧URLは拡張子なしURLへ301転送します。記事応答にはcontent type、ETag、nosniff、CSPを付けます。

`/api/r2-usage`はCloudflare Analytics GraphQLの`r2OperationsAdaptiveGroups`と`r2StorageAdaptiveGroups`を使い、UTC月初から現在までのaccount全bucketを集計します。無料枠がaccount全体に適用されるため、`kizi-articles`だけに絞って残量を過大表示しません。R2 Standardの無料枠はストレージ10 GB-month、Class A 100万件、Class B 1,000万件として表示します。ストレージはbucketごとの日別peak byteを30日で按分し、操作はCloudflareのaction typeをClass A/B/無料操作へ分類します。未知の操作種別があれば料金推定を出しません。

この値はStandard storageの推定であり、Analyticsの集計遅延、Infrequent Accessのretrieval・最低保存期間、Data Catalog等の追加料金、請求単位の丸めを完全には再現しません。請求書の確定値ではなく、正確な課金判断はCloudflare dashboardを正とします。APIが利用する`CLOUDFLARE_ACCOUNT_ID`とread-onlyの`CLOUDFLARE_ANALYTICS_TOKEN`はkizi Pages Secretだけに置き、Publisher、GitHub、browserへ渡しません。未設定時は503と公式無料枠を返し、Publisherは「実測値なし」と表示します。

## 10. Publisher v0.2.1の実装契約

v0.2.0のR2統合配信、safeStorage、journal、detached worktreeを維持し、v0.2.1では投稿入力を変えず、横断競合、削除確認、クラッシュ復旧を強化しました。

1. 起動時と公開前に`kizi`、`kizi-kougaku`、`kizi-other`の`site.config.json`を読み、schemaVersion 2とリポジトリ組を確認する。
2. 2記事版の最新`main`を横断してIDとIssueを採番し、preview時とcommit直前にdirectoryを含む3リポジトリのremote SHA snapshotが一致することを確認する。
3. 記事HTMLのcanonical、OGP、JSON-LD、保存URLを`deliveryOrigin`で生成する。
4. 対象記事リポジトリで`npm run check`を通し、commit作成直後とpush直後にjournalへSHAを保存してから、1commitで`main`へpushする。
5. GitHub Check Run `Publish to kizi / delivery`が対象commitで成功するまで待つ。
6. `GET https://kizi.pages.dev/api/publish-status?edition=<edition>&commit=<sha>`が200かつ同じcommitを返すことを確認する。
7. `GET https://kizi.pages.dev/articles/<ID>`が200、canonicalがkizi、記事IDが一致することを確認する。
8. ここまで成功した時だけ、新規追加はjournalを`published`、完全削除は`completed`にする。
9. 起動同期と「配信・R2」画面で`/api/health`と`/api/r2-usage`を取得し、配信commitと無料枠の残量を表示する。

Publisher自身はR2へアップロードせず、Cloudflare資格情報を保存しません。GitHub Actionが遅延・失敗した場合は`push済み・配信同期待ち`として記録し、同じcommitのCheck Runとstatusを再確認します。新しい記事commitを重ねて回避しません。

Publisher履歴へ次を追加します。

```json
{
  "delivery": {
    "workflow": "Publish to kizi",
    "edition": "engineering",
    "sourceCommit": "40桁SHA",
    "syncState": "pending | succeeded | failed",
    "statusUrl": "https://kizi.pages.dev/api/publish-status?...",
    "publicUrl": "https://kizi.pages.dev/articles/<ID>",
    "verifiedAt": "ISO 8601またはnull"
  }
}
```

完全削除では対象記事リポジトリから正本と生成物を1commitで削除し、Action成功後にkizi URLが404であることを確認します。collectionは記事IDの部分一致では判定せず、catalogの`id`/`url`、RSSの`link`/`guid`、sitemapの`loc`から完全一致参照が消えたことを検証します。既存記事編集、公開終了、版移転、revert専用UIはv0.2.1では未実装であり、実装前提にしません。

commit作成後にpushできなかった場合はjournalのcommit SHAと`refs/kizi-publisher/recovery/<sha12>`を残します。再確認時に対象SHAがremote `main`と一致しなければR2確認へ進まず、recovery refを案内します。journalはfield、ISO日時、SHA、HTTPS URLを検証し、3 MiB/件・24 MiB/一覧を上限として壊れたrecordを隔離します。

## 11. 公開状態と完了条件

```text
draft
  → validated
  → previewed
  → source_pushed
  → delivery_syncing
  → delivery_catalog_committed
  → public_verified
  → published
```

`git push`成功、Action開始、R2への記事putのいずれも単独では公開完了ではありません。対象commitのstatusと本番HTTP確認が必要です。

## 12. 整合性、競合、再試行

- push直前に2記事版のremote SHAを再確認し、変化していれば採番・生成をやり直します。
- force pushは禁止です。
- 同じIDを両版へ含むカタログは`finalize`で拒否します。
- Action再実行は同じcommitを使います。
- R2 catalogは版ごとの原子的な切替単位です。2版を同時更新する操作では一時的に片方だけ新しくなるため、版移転は旧版削除の確定後に新版追加を行います。
- statusのcommitがpushしたcommitと異なる場合は成功扱いにしません。

## 13. SEO、SNS、旧URL

- canonical、`og:url`、NewsArticle JSON-LD、BreadcrumbList、共有URLはkiziオリジンへ統一します。
- OGP画像は`https://kizi.pages.dev/assets/images/...`を使います。
- 統合RSSとsitemapはR2の確定カタログから生成します。
- 記事版Pagesの`/articles/*`は対応するkizi URLへ301転送します。
- 記事版トップはkiziの`/?edition=engineering#latest`または`/?edition=other#latest`へ転送できます。
- 旧記事版で登録済みのService Workerを残さないため、`/service-worker.js`だけは同一オリジンのretire scriptへrewriteし、旧cache削除とunregisterを行います。
- 転送開始前にkizi側の対象記事が200であることを確認します。

## 14. ブラウザ内データとPWA

閲覧設定、お気に入り、あとで読むはkiziオリジンのIndexedDB `kizi-reader`で管理します。DB version 2、settings schema 2、store名とkeyPathはv1から変えません。これにより新規保存は1オリジンへ統合されます。

旧2オリジンのIndexedDBは同一生成元ポリシーによりkiziから直接読めません。自動移行は行わず、必要になった場合は旧サイト上の明示的なexportとkizi側importを別仕様で追加します。

Service WorkerはUI shellだけを事前キャッシュします。記事一覧と記事本文はネットワーク優先で、成功応答を実行時キャッシュできます。特定記事を`CORE_ASSETS`へ固定しません。R2やFunctions障害時に、既読記事のブラウザキャッシュがあれば利用できます。

## 15. 対応ブラウザとアクセシビリティ

- 標準HTML、CSS、JavaScript、IndexedDBを優先します。
- IndexedDB失敗時はlocalStorage、ResizeObserver不在時はscroll/resizeへフォールバックします。
- JavaScript無効時でもトップに埋め込まれた最新記事と記事HTML本文を読める構造を保ちます。
- Safari、Chrome、Edge、Firefoxの現行メジャー、320 CSS pxから8K、LTR/RTL、200%ズームを回帰対象にします。
- キーボード、focus ring、44 CSS px以上の操作領域、prefers-reduced-motionを維持します。

## 16. Cloudflare初期構築

初回だけ次を行います。

1. R2 bucket `kizi-articles`を作成する。
2. kizi Pages projectへR2 binding `ARTICLES`を設定する。
3. `wrangler.jsonc`をPages設定の正本としてデプロイする。
4. kizi Pages Functionsを本番反映する。
5. 工学版の既存記事をActionで同期する。
6. `/api/health`、`/api/catalog`、既存記事、RSS、sitemapを確認する。
7. 最後に旧記事版URLの転送を有効化する。

日常の記事公開ではWranglerやCloudflareログインを要求しません。必要なのはPublisherが使うGitHub認証だけです。

## 17. 検証

### kizi配信リポジトリ

```sh
npm run check
wrangler pages dev website
```

確認対象:

- Functionsとbrowser JavaScriptの構文
- catalog正規化、版ルーティング、SHA-256、統合順序
- R2未設定、空カタログ、存在しない記事、欠落オブジェクトのHTTP状態
- RSS、sitemap、CSP、ETag、HEAD、`.html`転送
- ライト／ダーク、6言語、PWA、IndexedDB、Safariを含む代表ブラウザ

### 記事リポジトリ

```sh
npm run check
node --check scripts/sync-delivery.mjs
```

検証器はMarkdownとHTMLの1対1、記事ID、版ルール、翻訳、5ジャンル×4画像に加え、canonicalが`deliveryOrigin`であることを確認します。

## 18. 障害対応

### Action失敗

1. 対象commitの`npm run check`結果を確認する。
2. OIDC permission、audience、repository、ref、shaを確認する。
3. begin、articles、finalizeのどこで失敗したかAction logで特定する。
4. 原因修正後、同じcommitのworkflowを再実行する。記事commitを作り直さない。

### R2同期途中の失敗

確定カタログは旧版のままなので、読者影響は原則ありません。stagingと未参照content-addressed objectは後で削除できます。先に手動でcatalogだけ切り替えてはいけません。

### 誤公開

Git履歴を書き換えず`git revert <commit>`を新しいcommitとしてpushします。Actionがrevert後のカタログを確定し、本番URLを確認するまで完了にしません。

### kizi Functions障害

直前の正常な`kizi`commitをrevertしてPagesへ再デプロイします。R2記事とカタログは消さないため、Function復旧後に同じ公開状態へ戻せます。

## 19. R2保守とGC

content-addressed記事は更新・削除後も残るため、定期GCを行います。

1. `catalogs/engineering.json`と`catalogs/other.json`が参照する`storageKey`集合を作る。
2. 直近30日以内のobjectとstagingは保護する。
3. どちらにも該当しない`articles/*`だけを削除候補として一覧化する。
4. dry-runを保存し、別実行で明示的に削除する。

GCは通常のPublisher公開処理へ混ぜません。catalogとstatusを削除対象に含めません。

## 20. 定期保守

### 記事公開ごと

- 2版のIDとIssue重複、routing、`npm run check`を確認する。
- Action、publish-status、kizi本番記事を確認する。
- canonical、共有URL、RSS、sitemapを確認する。

### 月次

- `/api/health`と2カタログのcommitをGitHub mainと照合する。
- R2容量、Class A/B操作数、Functionsエラー率を確認する。
- 外部リンク、画像、manifest、Service Workerを確認する。
- 失敗したstaging sessionを一覧化する。

### 四半期または大変更時

- Safari、Chrome、Edge、Firefox、モバイル、RTL、キーボード、ズームで回帰確認する。
- GitHub OIDC issuer/JWKS仕様とActions権限を確認する。
- R2 GCをdry-runする。
- git revertから本番復旧まで訓練する。
- article、site config、catalog、IndexedDB、journalの各schemaVersionを確認する。

## 21. Publisher引き継ぎ

Publisherの正本はprivate repository `oriyu90/kizi-publisher-macos`の`main`です。現行版はv0.2.1、commit `9f85b895c06582962e24180b202ab731ceb2ed2e`、Releaseは`https://github.com/oriyu90/kizi-publisher-macos/releases/tag/v0.2.1`です。変更前に同repoの`README.md`、`docs/ARCHITECTURE.md`、`docs/QUALITY_REPORT.md`、最新Releaseを確認します。

v0.1.1の既存要件である、専用clone、detached worktree、file lock、atomic journal、remote SHA確認、Git recovery ref、safeStorage、secret非出力、force push禁止を維持します。v2対応では本章10のdelivery状態と確認URLを追加し、既存journalを読み込める後方互換migrationを実装します。

Publisherの契約、Release、journal schemaを変更した場合、`AGENTS.md`のcontinuity節とこの文書を3リポジトリで同じ更新単位に同期します。

## 22. Definition of Done

この仕様変更全体は次をすべて満たした時だけ完了です。

- `kizi`の`main`から統合UIとPages Functionsがデプロイされている。
- R2 bucketと`ARTICLES` bindingが本番で有効である。
- 2記事リポジトリにschemaVersion 2、同期script、workflow、kizi canonicalが入っている。
- 既存記事`2026.8.19.1`が工学カタログにあり、kizi URLで200を返す。
- 旧記事URLがkiziへ転送される。
- `/api/catalog`、RSS、sitemapが2版の和集合を返す。
- `npm run check`が3リポジトリで成功する。
- Publisher次版がAction、status、public URLを確認する仕様を実装または追跡できる。
- 認証情報がGit、生成HTML、ログ、journalへ入っていない。
- 共通文書が3リポジトリで一致している。
