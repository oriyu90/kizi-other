# kizi common rules

## Read first

- 記事・投稿アプリ・公開処理を変更する前に `docs/article-format.md` と `docs/system-design-and-operations.md` を読む。
- `AGENTS.md` は不変の共通ルール、`docs/article-format.md` はAI原稿契約、`docs/system-design-and-operations.md` はシステム設計・リポジトリ・保守契約とする。
- 実装と文書が食い違う場合は推測で公開せず、実装、検証スクリプト、スキーマ、文書を同じ変更で整合させる。

## Article source of truth

- AIが作成する記事は `content/articles/<YYYY.M.D.N>.md` に、1記事1Markdownファイルで保存する。
- 記事IDは公開日と当日内の連番を結んだ `YYYY.M.D.N` とする。例: `2026.8.21.1`。
- Markdownの必須メタデータ、本文構造、表記、出典、禁止事項は `docs/article-format.md` に従う。
- `website/articles/<ID>.html` は投稿アプリがMarkdownから生成する公開成果物であり、生成後に本文を直接編集しない。
- 本文内へ画像を挿入しない。トップ画像はジャンル別の共通画像プールから選ぶ。

## Edition routing

- `kizi-kougaku` は、`categories` に `engineering` を含む記事だけの正本を保持する。
- `kizi-other` は、`categories` に `engineering` を含まない記事だけの正本を保持する。
- 1記事を両方の版で配信しない。振り分け判定では主ジャンル・副ジャンルを区別せず、`categories` 全体を見る。
- `kizi` は2記事リポジトリからR2へ同期された記事を統合配信し、読者向けURLを `https://kizi.pages.dev/articles/<ID>` に統一する。
- 雄武町の金銀鉱床の記事 `2026.8.19.1` は `engineering` を含め、`kizi-kougaku` だけで配信する。

## Publishing contract

- サイト固有のURL、振り分け条件、配信先は `site.config.json` を正とする。
- 記事追加時はMarkdown、`website/articles/index.json`、生成HTML、トップページ、RSS、サイトマップを同じ更新単位で同期する。
- 公開前に `npm run check` を通す。
- 記事リポジトリの`main`へのpushをGitHub ActionsのR2同期起点とし、`kizi`リポジトリの`main`へのpushを統合UIとPages Functionsの本番デプロイ起点とする。
- 自動更新アプリは2つの記事リポジトリの最新 `main` を確認してから、記事IDとIssue番号を横断採番する。
- 公開成果物は1回のGitコミットで原子的に更新する。R2では記事オブジェクトを先に保存し、版カタログを最後に切り替える。複数ファイルを1ファイルずつ `main` へ直接書き込まない。
- GitHub Actionsの同期はGitHub OIDCを使い、Cloudflare API tokenやR2 access keyを記事リポジトリへ保存しない。
- Publisherはpush後に`Publish to kizi` Check Run、`/api/publish-status`、統合記事URLの順に確認し、3つすべてが成功するまで公開完了にしない。
- 認証情報、APIトークン、AIの内部プロンプト、未公開の取材情報をリポジトリやブラウザへ保存しない。

## kizi Publisher continuity contract

- macOS投稿アプリのソース正本はprivate repository `https://github.com/oriyu90/kizi-publisher-macos` の `main` とする。ローカルの作業フォルダは使い捨てであり、引き継ぎ時は `gh repo clone oriyu90/kizi-publisher-macos` で復元する。
- 現行配布版は `v0.2.0`、対象commitは `ebfce322b41401c65796e0b461d4cc60ac73e6d9`、Releaseは `https://github.com/oriyu90/kizi-publisher-macos/releases/tag/v0.2.0` とする。変更を始める前に同repositoryの `README.md`、`docs/ARCHITECTURE.md`、`docs/QUALITY_REPORT.md` と最新Releaseを確認する。
- `v0.2.0` はR2統合配信へ対応済みである。記事リポジトリへのpush後にGitHub Check Run `Publish to kizi / delivery`、`kizi.pages.dev/api/publish-status`、統合記事URLを順に確認し、push後の確認失敗は同じcommitを操作履歴から再確認する。Cloudflare資格情報をPublisherへ追加しない。
- v0.2.0の通常入力はAIが作成したMarkdown、主ジャンル、任意の副ジャンルだけである。ID、Issue、公開日、order、author、language、readingMinutes、heroPool、status、配信先、公開URL、commit messageはアプリが決める。
- v0.2.0が実装済みの公開操作は新規追加と完全削除である。既存記事編集、公開終了、版移転、revert専用UIは未実装なので、存在を仮定しない。
- 起動時と公開操作前に3リポジトリを同期し、2記事版の最新 `main` を横断してIDとIssueを採番する。記事操作はアプリ専用cloneとdetached worktreeで行い、検証後の全成果物を1commitで `main` へpushする。force pushとユーザーの通常cloneの変更は禁止する。
- GitHub認証は端末の `gh` ログインを利用し、GitHub tokenをアプリへ保存しない。AI keyはElectron `safeStorage` で暗号化し、renderer、Git、operation journal、ログへ渡さない。
- 翻訳はOpenAI API互換providerに対応する。Chat Completionsの `<base>/chat/completions` とResponsesの `<base>/responses` を選択できる。外部Base URLはHTTPSのみ、loopbackだけHTTPを許可する。key不要設定ではAuthorization headerを送信しない。
- 公開前にrouting、生成物、変更ファイルallowlist、secret、対象リポジトリの `npm run check`、remote SHAを検証する。push後はCloudflare PagesのCheck Runと本番HTTPを確認し、push済みだが確認に失敗した状態を未公開と誤表示しない。
- アプリの操作journal、専用clone、設定は `~/Library/Application Support/kizi Publisher/` に置く。公開操作はfile lock、atomic journal、push失敗時のGit recovery refを使い、クラッシュ後もremote SHAとjournalから結果を判定できる状態を維持する。
- GUIはHallmarkのinteraction-state原則を採用済みである。primary buttonはオレンジ面に暗色文字を使い、default、hover、focus、active、disabled、loading、error、successを区別する。visible buttonは44×44 CSS px以上、focus ringを常時識別可能にし、light/dark両テーマの文字コントラストを自動試験する。v0.2.0の測定範囲は4.72:1〜16.95:1である。
- v0.2.0の「配信・R2」画面はaccount全体のR2 Standard無料枠に対する月初来推定を表示する。実測にはkizi Pages productionの`CLOUDFLARE_ACCOUNT_ID`とAccount Analytics Read tokenを`CLOUDFLARE_ANALYTICS_TOKEN`として設定する。未設定時は公式無料枠と「実測値なし」を表示し、請求確定値はCloudflare dashboardを正とする。
- v0.2.0はmacOS 12.0以降、arm64/x64向けDMGを配布する。arm64 SHA-256は `7c4539dd64a478266e44e6eca567b4e62e06e9b49fbf4ccd0328cdc49138b99b`、x64は `7b1b818b93998bb6a7fead972d3db772e5da947bad63e244546f5c6be280cea3` である。
- v0.2.0 DMGはad-hoc署名、mount、`codesign --verify --deep --strict`、起動を確認済みだが、Developer ID署名とApple notarizationは未実施である。実機起動確認はmacOS 26.5のApple Silicon、x64はRosetta経由であり、macOS 12〜25とIntel実機は未確認である。
- Publisherの契約やRelease情報を変更した場合、この節を `kizi`、`kizi-kougaku`、`kizi-other` の3リポジトリで同じcommit単位に同期する。
