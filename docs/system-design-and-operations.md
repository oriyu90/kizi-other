# kizi システム設計・リポジトリ・保守契約 v1

最終更新: 2026-08-22

この文書は、kiziの記事を作成・検証・振り分け・公開・更新・削除する自動更新アプリを実装するための共通契約です。3つのリポジトリで同じ内容を保ちます。AIへ渡す記事原稿の形式は `docs/article-format.md`、Codexなどの作業者が必ず守る短いルールは `AGENTS.md` を正とします。

## 1. システムの目的と境界

kiziは、静的HTMLをCloudflare Pagesで配信するニュースサイトです。記事本文の正本はMarkdownであり、公開用HTML・トップページ・カタログ・フィード・サイトマップは生成物です。

自動更新アプリの責務は次の通りです。

1. 2つの記事リポジトリの最新状態を取得する。
2. 記事IDとIssue番号を重複なく決める。
3. AIへ `docs/article-format.md` を渡してMarkdown原稿を作成させる。
4. 原稿、出典、メタデータ、翻訳、配信先を検証する。
5. Markdownから公開成果物を決定的に生成する。
6. すべての変更を1コミットにまとめて対象リポジトリの `main` へ反映する。
7. Cloudflare PagesのGit連携による公開完了を確認し、失敗時に安全に戻せるよう記録する。

通常の記事更新でCloudflareへファイルを直接アップロードしてはいけません。GitHubの `main` が公開状態の履歴であり、Cloudflare Pagesはその配信先です。

## 2. 全体構成

```text
AI / 編集者
    ↓ Markdown原稿
自動更新アプリ
    ├─ 形式・出典・ジャンル検証
    ├─ 2版横断のID採番
    ├─ HTML / index.json / RSS / sitemap / トップ生成
    └─ npm run check
          ↓ 1回のGitコミット
GitHub main
    ├─ oriyu90/kizi-kougaku
    └─ oriyu90/kizi-other
          ↓ Git連携
Cloudflare Pages
    ├─ kizi-kougaku.pages.dev
    └─ kizi-other.pages.dev

oriyu90/kizi → kizi.pages.dev（案内ページのみ）
```

ランタイムは静的HTML、CSS、ブラウザ標準JavaScriptです。サーバー側データベースや記事APIは現在ありません。お気に入り、あとで読む、閲覧設定は各ブラウザ内に保存されます。

## 3. リポジトリ一覧と責務

| GitHubリポジトリ | Cloudflare Pages | 公開URL | 責務 |
| --- | --- | --- | --- |
| `oriyu90/kizi` | `kizi` | `https://kizi.pages.dev` | 2版とStudio Riziへの案内。記事を置かない |
| `oriyu90/kizi-kougaku` | `kizi-kougaku` | `https://kizi-kougaku.pages.dev` | `categories` に `engineering` を含む記事 |
| `oriyu90/kizi-other` | `kizi-other` | `https://kizi-other.pages.dev` | `categories` に `engineering` を含まない記事 |

関連リンク:

- GitHub owner: `oriyu90`
- 制作者サイト: `https://studio-rizi.pages.dev/`
- 本番ブランチ: すべて `main`
- Pages公開ディレクトリ: すべて `website/`
- Pagesビルドコマンド: なし。リポジトリ内の静的成果物をそのまま配信する

現在の開発端末では3リポジトリを次に置いています。ただし、自動更新アプリはこの絶対パスをハードコードせず、GitHub URLと設定ファイルから解決してください。

```text
/Users/yuki/適当フォルダ/kizi
/Users/yuki/適当フォルダ/kizi-kougaku
/Users/yuki/適当フォルダ/kizi-other
```

## 4. 設定の正本

各リポジトリの `site.config.json` が版固有設定の正本です。全リポジトリに共通するのは `schemaVersion`、`edition`、`name`、`origin` です。記事版には `articleRouting`、案内版には `publishesArticles: false` を置きます。

```json
{
  "schemaVersion": 1,
  "edition": "engineering | other",
  "name": "表示名",
  "origin": "https://公開オリジン",
  "articleRouting": {
    "requireCategories": [],
    "excludeCategories": []
  }
}
```

案内版は次の形です。

```json
{
  "schemaVersion": 1,
  "edition": "directory",
  "name": "kizi directory",
  "origin": "https://kizi.pages.dev",
  "publishesArticles": false
}
```

自動更新アプリはリポジトリ名や公開URLから配信ルールを推測せず、このファイルを読みます。未知の `schemaVersion` は無視して処理を続けず、対応版へアプリを更新するまで停止します。

## 5. ディレクトリとデータの所有関係

```text
AGENTS.md                              共通の不変ルール
docs/article-format.md                 AI原稿・Markdown契約
docs/system-design-and-operations.md   この設計・運用契約
site.config.json                       版固有のURL・振り分け条件
content/articles/<ID>.md               記事の正本。1記事1ファイル
scripts/next-article-id.mjs             単一リポジトリ用の補助採番
scripts/validate-articles.mjs           公開前の最低限の構造検証
website/index.html                      トップページ生成物
website/articles/<ID>.html              記事ページ生成物
website/articles/index.json             公開記事カタログと画像プール
website/feed.xml                        RSS生成物
website/sitemap.xml                     サイトマップ生成物
website/robots.txt                      クローラー設定
website/manifest.webmanifest            PWA設定
website/service-worker.js               PWAキャッシュ処理
website/assets/                         共通UI、画像、アイコン
website/favorites.html                  お気に入り一覧
website/read-later.html                 あとで読む一覧
```

Markdownだけが記事本文の編集元です。`website/articles/<ID>.html` を直接編集しても、次の生成で上書きされるものとして扱います。共通UIを変えた場合は、記事を持つ2リポジトリへ同じ変更を反映し、両方で検証します。

## 6. 記事ID、Issue、URL

- 記事IDは `YYYY.M.D.N`。日付は `Asia/Tokyo` の公開日、`N` はその日の1始まり連番です。
- IDは2つの記事リポジトリを合わせて一意にします。
- ファイル名、front matterの `id`、カタログの `id`、HTMLの識別子を一致させます。
- 公開URLは `<site.config.origin>/articles/<ID>` です。ソース上のファイルは `<ID>.html` ですが、公開リンクでは拡張子を付けません。
- `issue` は画面上の通し番号です。v1の更新アプリでは両版の公開記事を合わせた最大値に1を足し、重複させません。URLや永続保存のキーには使いません。
- 一度公開したIDを別記事へ再利用しません。公開日を直す必要がある場合も、既存URLを維持するか、明示的な移転処理を行います。

既存の `npm run article:next-id -- YYYY-MM-DD` は、そのリポジトリの `index.json` だけを見る補助コマンドです。自動更新アプリの正式な採番には使わず、必ず工学版と非工学版の和集合から次番号を計算します。

## 7. ジャンルと版の振り分け

許可するジャンルIDは `culture`、`economy`、`engineering`、`politics`、`science` の5つです。

```text
categories に engineering がある   → kizi-kougaku
categories に engineering がない   → kizi-other
```

- `categories[0]` は主ジャンルです。
- `heroPool` は `categories[0]` と一致させます。
- 工学判定は主ジャンルだけでなく、`categories` 全体を見ます。
- 通常状態では同じIDを両版へ置きません。
- 雄武町の金銀鉱床の記事 `2026.8.19.1` は `engineering` を含むため工学版だけに置きます。

公開後に `engineering` の有無を変える操作は、単なる記事更新ではなく「版移転」です。重複公開を避ける既定手順は、旧版から削除して公開完了を確認した後、新版へ追加する順序です。この間は短時間404になり得るため、アプリは利用者へ警告し、旧URLから新オリジンへのリダイレクト追加を選べるようにします。

## 8. 原稿から公開までの状態

推奨する状態遷移は次の通りです。

```text
draft（アプリ内）
  → validated（原稿検証済み）
  → previewed（生成結果を確認済み）
  → publishing（Git更新・Pages公開待ち）
  → published（本番確認済み）
  → superseded / unpublished（更新・公開終了）
```

現在のリポジトリ検証は、`content/articles/` にあるMarkdownがすべてカタログと公開HTMLに対応することを要求します。そのため `status: draft` の原稿を `main` に保存してはいけません。下書きはアプリ自身の保存領域、専用ブランチ、またはPull Requestで管理し、公開コミットへ入れる時点で `status: published` にします。

## 9. 新規公開アルゴリズム

1. 工学版と非工学版の `main` の最新コミットSHAを取得する。
2. 両方の `website/articles/index.json` と `content/articles/*.md` を読み、IDとIssueの和集合を作る。
3. 希望公開日から未使用のIDを採番する。
4. AIへ `docs/article-format.md` 全体、調査資料、採番済みID、Issueを渡す。
5. AIの出力がMarkdown 1ファイルだけであることを確認する。
6. front matter、本文構造、URL、出典、禁止記法、ジャンルを検証する。
7. `site.config.json` に従って配信先を1つに決める。
8. 日本語正本から5言語の翻訳を生成・検証する。
9. Markdownとすべての公開成果物を一時作業領域に生成する。
10. 対象リポジトリで `npm run check` を実行する。
11. 開始時の `main` SHAが変わっていないことを確認する。変わっていれば最新化し、IDを再計算して生成し直す。
12. 全ファイルを1つのGitコミットにし、`main` を更新する。
13. Cloudflare Pagesの対象コミットが成功し、本番URLが200、canonicalが正しいことを確認する。
14. 記事ID、対象版、GitコミットSHA、公開URL、公開確認時刻をアプリの履歴へ保存する。

GitHub APIで実装する場合、Contents APIで複数ファイルを1つずつ `main` に書き込むと、途中状態がデプロイされます。blob、tree、commitを作成して最後にbranch refを更新するGit Data API相当の処理、またはローカルclone上の1回の `git commit` と `git push` を使います。

## 10. 更新、公開終了、削除

### 記事更新

- IDと公開URLは維持する。
- `updatedAt` を更新し、必要なら表示上の最終更新日も同期する。
- Markdownから全成果物を再生成する。
- タイトルや要約変更時はHTML、トップ、カタログ、RSS、OGP、JSON-LDを同期する。
- 翻訳は日本語正本との差分を反映し、古い翻訳を残さない。

### 公開終了

- 通常は履歴保全のため完全削除より、明示的な公開終了ページまたは適切な転送を優先する。
- 検索から外す場合はカタログ、トップ、RSS、サイトマップから除外し、ページ側の検索制御も揃える。

### 完全削除

- Markdown、記事HTML、カタログ項目、トップ掲載、RSS、サイトマップ、Service Workerのプリキャッシュ、旧リダイレクトを同じコミットで更新する。
- 法務・安全上の緊急削除を除き、Git履歴自体は書き換えない。
- 削除後に対象URL、一覧、RSS、サイトマップを確認する。

## 11. 公開成果物の同期契約

記事を公開・更新・削除したときは、必要に応じて次を同じコミットで同期します。

| 成果物 | 同期内容 |
| --- | --- |
| `content/articles/<ID>.md` | 日本語の正本とメタデータ |
| `website/articles/<ID>.html` | 本文、5翻訳、目次、保存・共有UI、SEO |
| `website/articles/index.json` | 一覧、ジャンル、要約、URL、読了時間 |
| `website/index.html` | 最新記事、ジャンル件数、空状態 |
| `website/feed.xml` | 公開記事のRSS項目 |
| `website/sitemap.xml` | 公開URLと更新日 |
| `website/service-worker.js` | プリキャッシュ対象やアセット版が変わる場合 |
| `website/_redirects` | URL移転や旧URL互換が必要な場合 |

生成は決定的であるべきです。同じMarkdown、同じテンプレート、同じ設定からは、生成時刻など意図した項目を除いて同じ成果物を得られるようにします。

## 12. 記事HTMLと多言語の契約

- 日本語を基準言語とします。
- 対応言語は `ja`、`en`、`pt`、`de`、`zh-CN`、`ar` です。
- 日本語以外の5翻訳は同じ記事HTML内に各1つ置き、`data-article-translation="<language>"` で識別します。
- アラビア語では文書方向をRTLに切り替えます。
- 初回言語はブラウザ設定から選び、未対応言語は日本語へ戻します。
- 翻訳が欠けた場合は日本語を表示しますが、公開前検証では翻訳欠落をエラーにします。
- 固有名詞、数値、単位、出典URL、既知／未確定の区別を翻訳で変えません。

記事HTMLには少なくとも記事IDを示す `data-article-slug`、お気に入り操作 `data-favorite-toggle`、あとで読む操作 `data-read-later-toggle` を含めます。

## 13. トップ画像の契約

- 本文画像は禁止です。
- `website/articles/index.json` の `imagePools` に5ジャンル×4枚を登録します。
- 画像ファイルは `website/assets/images/` に置きます。
- トップ画像は `heroPool` の4枚からブラウザ側でランダムに選びます。
- ファイルを差し替える場合は、両記事版の画像、カタログ、キャッシュを同期します。
- 画像名の変更や削除では、古いService Workerキャッシュからの参照にも注意します。

## 14. SEO、SNS、配信メタデータ

各公開記事で次を生成・検証します。

- 一意な `<title>` とdescription
- `site.config.origin` に一致するcanonical URL
- Open Graphのtitle、description、URL、type、image
- X/Twitterカード
- NewsArticleまたはArticleのJSON-LD
- `lang` と翻訳表示時の言語・方向
- RSS項目
- sitemapのURLと更新日
- 有効なrobots設定

別オリジンへ記事を移す場合はcanonicalとSNS URLを必ず新しい版へ変えます。案内版 `kizi.pages.dev` に記事canonicalを向けません。

## 15. ブラウザ内データ契約

閲覧設定、お気に入り、あとで読むは `website/assets/reader.js` が管理します。

### IndexedDB

- DB名: `kizi-reader`
- DB version: `2`
- `settings` store: keyPath `key`、固定キー `reader`
- `favorites` store: keyPath `slug`
- `readLater` store: keyPath `slug`

設定レコードの現在の `settingsSchema` は `2` です。主なフィールドは次の通りです。

```json
{
  "key": "reader",
  "settingsSchema": 2,
  "language": "ja",
  "articleFont": "gothic",
  "articleScale": 1,
  "articleBold": false,
  "uiScale": 1,
  "controlScale": 1,
  "themeMode": "system",
  "accentColor": "orange"
}
```

お気に入りとあとで読むのレコード形は共通です。

```json
{
  "slug": "2026.8.19.1",
  "url": "/articles/2026.8.19.1",
  "title": "記事タイトル",
  "date": "2026-08-19",
  "savedAt": "ISO 8601日時"
}
```

IndexedDBが使えない場合はlocalStorageの `kizi-reader-fallback` を代替保存に使います。テーマ互換用に `kizi-theme-mode` も使います。

重要: IndexedDBとlocalStorageはオリジン単位です。`kizi-kougaku.pages.dev` と `kizi-other.pages.dev` のお気に入り・あとで読む・設定は自動共有されません。将来、更新アプリやアカウント同期で統合する場合は、両オリジンのデータ移行またはエクスポート／インポート仕様を別途設計します。

DB名、store名、keyPath、レコードキーを変更すると既存ユーザーの保存データが読めなくなります。変更時はDB versionと `settingsSchema` を上げ、`onupgradeneeded` で後方互換の移行を実装します。

## 16. PWAとキャッシュ

- `manifest.webmanifest` と192px、512px、maskableアイコンを維持します。
- Service Workerは同一オリジンのGETを扱い、ナビゲーションはネットワーク優先、静的資産はキャッシュ利用です。
- CSS、JavaScript、アイコン、記事、一覧ページを変更して古い表示が残り得る場合は、アセットのクエリ版と `CACHE_NAME` を更新します。
- 記事を削除した場合はプリキャッシュ一覧からも除きます。
- Service Workerのinstallで404資産が1つでもあると更新に失敗するため、公開前に全 `CORE_ASSETS` を確認します。
- 案内版には旧記事サイトのService Workerを残しません。

## 17. 対応ブラウザとアクセシビリティ

- 標準HTML、CSS、JavaScript APIを優先し、特定ブラウザだけの技術を必須にしません。
- IndexedDB失敗時はlocalStorage、`ResizeObserver` がない場合はscroll/resize、テーマ変更監視では新旧イベントAPIのフォールバックを維持します。
- JavaScript無効時でも記事本文と基本リンクを読める構造を維持します。
- キーボード操作、フォーカス表示、ARIA、十分なタッチ領域、RTL、ズーム、prefers-reduced-motionを壊しません。
- 小型画面から8Kまで、本文の読みやすい最大行長を守り、単純な画面倍率だけで引き伸ばしません。

## 18. 検証と公開完了条件

最低限、対象の記事版で次を実行します。

```sh
npm run check
```

現行チェックはJavaScript構文、記事MarkdownとHTMLの1対1対応、ID、日付、ジャンル、版ルール、翻訳、canonical、保存ボタン、5×4画像を確認します。自動更新アプリはこれに加えて次を確認します。

- 両リポジトリを横断したIDとIssueの重複
- Markdownリンクと出典URLの妥当性
- HTMLの安全なサニタイズ
- トップ、記事、404、お気に入り、あとで読むの表示
- RSSとsitemapのXML妥当性
- manifestとService Workerの全参照先
- canonical、OGP、JSON-LDの内容
- ライト／ダーク、6言語、LTR／RTL、代表的な画面幅
- 本番デプロイが対象コミットSHAで成功したこと
- 公開URLが期待するHTTP状態と内容を返すこと

`git push` の成功だけを公開完了とは扱いません。Pagesのデプロイ成功と本番HTTP確認までを `published` とします。

## 19. 競合、再試行、冪等性

- 公開処理の開始時に各 `main` のSHAを記録し、push直前に再確認します。
- SHAが変わった場合は上書きやforce pushをせず、最新状態から採番・生成・検証をやり直します。
- GitHubのnon-fast-forward、409、422は競合として扱い、同じIDをそのまま再送しません。
- 同じ公開操作を再実行しても、同じIDの記事が二重登録されないよう、操作IDと対象記事IDを履歴に持ちます。
- ネットワーク失敗後は、まずGitHubとPagesの現状を照合し、未反映と確認できた処理だけ再実行します。
- `main` へのforce pushは禁止です。

## 20. 認証とセキュリティ

- 通常公開に必要なのは対象GitHubリポジトリへcommit/pushできる認証です。CloudflareはGit連携で自動公開されるため、日常の更新にCloudflare書き込み権限を持たせる必要はありません。
- デプロイ状況をAPI監視する場合は、読み取りだけの最小権限を使います。
- トークンはOSの安全な資格情報ストアまたは実行環境のsecretへ保存し、リポジトリ、設定JSON、ログ、生成HTMLへ書きません。
- AIへ認証情報、非公開Git情報、不要な個人情報を渡しません。
- Markdownのraw HTML、script、iframe、本文画像を拒否し、生成HTMLではURLとテキストをエスケープします。
- 外部リンクは許可方式を明示し、危険なURL schemeを拒否します。
- ログでは記事ID、工程、コミットSHA、結果を記録し、トークンや原文中の機密情報を伏せます。

## 21. 障害対応とロールバック

### Pagesの公開失敗

1. 対象コミットSHAとPagesの失敗ログを確認する。
2. `npm run check` を同じコミットで再現する。
3. 設定、欠落ファイル、Service Workerのプリキャッシュ、HTML参照先を確認する。
4. 修正を新しいコミットでpushする。

### 表示崩れやJavaScript障害

1. ライト／ダーク、代表画面幅、6言語で再現する。
2. ブラウザコンソールとネットワーク404を確認する。
3. 共通UIの問題なら工学版・非工学版の両方を修正する。
4. キャッシュ原因ならアセット版とService Workerのcache名を更新する。

### 誤公開

- 履歴を書き換えず、原則 `git revert <bad-commit>` を新しいコミットとしてpushします。
- 記事だけを直せる場合は修正コミットを優先します。
- ロールバック後もPagesの対象コミットと本番URLを確認します。
- リポジトリ、Pagesプロジェクト、広いディレクトリを削除する操作を自動化しません。

## 22. 定期保守

### 記事公開ごと

- 両版の最新状態、ID、Issue、ジャンル、出典を確認する。
- `npm run check` と生成差分を確認する。
- 本番デプロイとURLを確認する。

### 月次

- トップ、最新記事、RSS、sitemap、robots、manifest、404を確認する。
- 外部リンク切れと画像404を確認する。
- 工学版と非工学版の共通UI差分を確認する。
- Service Workerの古い参照とキャッシュ版を確認する。

### 四半期または大きな変更時

- 代表ブラウザ、モバイル、RTL、キーボード、ズームで回帰確認する。
- IndexedDB移行とfallbackを確認する。
- GitHub／Cloudflare連携の権限を見直す。
- 記事形式、設定、カタログのschemaVersionとアプリ対応範囲を確認する。
- 復旧手順としてgit revertから本番反映までを確認する。

## 23. スキーマと互換性の変更

- `docs/article-format.md`、front matter、`site.config.json`、`index.json`、IndexedDBは別々のスキーマです。
- 必須項目の追加、意味変更、削除では対応する `schemaVersion` を上げます。
- スキーマ変更は、文書、生成器、検証器、既存データ移行、テストを同じ変更で行います。
- 自動更新アプリは未対応の新しいschemaVersionを黙って書き換えません。
- テンプレートや生成器を作る際は生成器バージョンをアプリ履歴へ記録し、どの版で生成したか追跡可能にします。

## 24. 自動更新アプリの最小機能

v1で必要な機能は次の通りです。

- 3リポジトリの接続確認と最新化
- 2記事版を横断した次ID・Issue取得
- AI用プロンプトへの記事形式契約の組み込み
- Markdown入力、検証、プレビュー、編集
- ジャンルによる配信先の自動判定
- 5言語翻訳の生成と確認
- 静的成果物の一括生成
- dry-runと差分表示
- `npm run check` 実行
- 1コミットでの公開と競合再試行
- Pages公開状況と本番URL確認
- 記事更新、公開終了、版移転
- 操作履歴、コミットSHA、エラー、再試行状態
- git revertによるロールバック支援

アプリの内部データは、少なくとも `operationId`、記事ID、Issue、対象版、開始時main SHA、生成器バージョン、状態、commit SHA、deployment結果、時刻、エラー概要を保持します。認証情報はこの履歴へ含めません。

## 25. Definition of Done

記事の自動更新は、次をすべて満たしたときだけ完了です。

- Markdownが `docs/article-format.md` に適合している。
- IDとIssueが両版で一意である。
- `site.config.json` に従い、1つの版だけへ配置されている。
- 正本と全生成物が1コミットで同期している。
- `npm run check` と追加検証が成功している。
- `main` をforce pushしていない。
- Cloudflare Pagesがそのcommit SHAを正常公開している。
- 本番URL、canonical、RSS、sitemap、保存UI、翻訳が確認できる。
- 操作履歴に記事ID、版、commit SHA、公開結果が残っている。
- 共通契約を変えた場合、3リポジトリのこの文書と関連スキーマが同期している。
