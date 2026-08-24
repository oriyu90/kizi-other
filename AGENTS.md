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
- 現行配布版は `v0.3.0`、対象commitは `274798c4731f8a73a545b850d711b45f1e827a2d`、Releaseは `https://github.com/oriyu90/kizi-publisher-macos/releases/tag/v0.3.0` とする。変更を始める前に同repositoryの `README.md`、`docs/ARCHITECTURE.md`、`docs/QUALITY_REPORT.md` と最新Releaseを確認する。
- `v0.3.0` はR2統合配信へ対応済みである。記事リポジトリへのpush後にGitHub Check Run `Publish to kizi / delivery`、`kizi.pages.dev/api/publish-status`、統合記事URLを順に確認し、push後の確認失敗は同じcommitを操作履歴から再確認する。Cloudflare資格情報をPublisherへ追加しない。
- v0.3.0の通常入力はAIが作成したMarkdown、主ジャンル、任意の副ジャンルだけである。ID、Issue、公開日、order、author、language、readingMinutes、heroPool、status、配信先、公開URL、commit messageはアプリが決める。AI原稿のauthorとreadingMinutesは採用しない。
- Publisherへ貼る原稿をAIに作らせる場合は、private Publisher repositoryの `docs/AI_ARTICLE_WRITING_RULES.txt` をAIへ全文渡す。AIが入力front matterへ書く項目は `title`、`subtitle`、`description`、`tags` だけとし、Publisherが生成する完全な保存後front matterと混同しない。
- v0.3.0が実装済みの公開操作は新規追加と完全削除である。既存記事編集、公開終了、版移転、revert専用UIは未実装なので、存在を仮定しない。
- v0.3.0はpreview時とcommit直前に3リポジトリのremote SHA snapshotを照合する。commit作成直後とpush直後にjournalへSHAを保存し、local-only commitはR2確認へ進めずrecovery refを案内する。完全削除後のcollection確認は記事IDの部分一致ではなく、catalogのid/url、RSSのlink/guid、sitemapのlocを完全一致で判定する。
- 起動時と公開操作前に3リポジトリを同期し、2記事版の最新 `main` を横断してIDとIssueを採番する。記事操作はアプリ専用cloneとdetached worktreeで行い、検証後の全成果物を1commitで `main` へpushする。force pushとユーザーの通常cloneの変更は禁止する。
- GitHub認証は端末の `gh` ログインを利用し、GitHub tokenをアプリへ保存しない。AI keyはElectron `safeStorage` で暗号化し、renderer、Git、operation journal、ログへ渡さない。
- 翻訳はOpenAI API互換providerに対応する。Chat Completionsの `<base>/chat/completions` とResponsesの `<base>/responses` を選択できる。外部Base URLはHTTPSのみ、loopbackだけHTTPを許可する。key不要設定ではAuthorization headerを送信しない。
- macOS Publisher v0.3.0より後の次版は、本文と同時に`title`、`subtitle`、`description`を5言語へ翻訳し、版カタログの`translations`へ生成する。AI入力Markdownのschemaは変更しない。5言語が揃わない場合は公開前検証で停止し、既存記事のフィールド欠落はkizi側で日本語メタデータへフォールバックする。
- 公開前にrouting、生成物、変更ファイルallowlist、secret、対象リポジトリの `npm run check`、remote SHAを検証する。push後はCloudflare PagesのCheck Runと本番HTTPを確認し、push済みだが確認に失敗した状態を未公開と誤表示しない。
- アプリの操作journal、専用clone、設定、Memoは `~/Library/Application Support/kizi Publisher/` に置く。公開操作はfile lock、atomic journal、push失敗時のGit recovery refを使い、クラッシュ後もremote SHAとjournalから結果を判定できる状態を維持する。
- v0.3.0のMemoは「操作履歴」と「設定」の間にあり、AI執筆ルールをUTF-8 plain textで `memo.txt` へ保存する。700ms後・focus解除時・通常終了前に自動保存し、明示保存とCommand+Sにも対応する。上限は1 MiB、file modeは0600、atomic renameを使い、symlinkを拒否する。アプリ更新・アプリ再起動・Mac再起動後も同じuserDataから復元し、GitHub、記事リポジトリ、AI APIへ送信しない。暗号化しないためcredentialや未公開取材情報は保存しない。
- GUIはHallmarkのinteraction-state原則を採用済みである。primary buttonはオレンジ面に暗色文字を使い、default、hover、focus、active、disabled、loading、error、successを区別する。visible buttonは44×44 CSS px以上、focus ringを常時識別可能にし、light/dark両テーマの文字コントラストを自動試験する。v0.3.0の測定範囲は4.72:1〜16.95:1である。
- v0.3.0の「配信・R2」画面はaccount全体のR2 Standard無料枠に対する月初来推定を表示する。実測にはkizi Pages productionの`CLOUDFLARE_ACCOUNT_ID`とAccount Analytics Read tokenを`CLOUDFLARE_ANALYTICS_TOKEN`として設定する。未設定時は公式無料枠と「実測値なし」を表示し、請求確定値はCloudflare dashboardを正とする。
- v0.3.0はmacOS 12.0以降、arm64/x64向けDMGを配布する。arm64 SHA-256は `19c548ccacf8a8fa6d4e60cc8aa6982c2c83fe717c87b96bc7947ea63eb8e038`、x64は `d2908eddc28f6c411362a0794a17caa54036f715b7ad1f7ae952a0847e8a1343` である。
- v0.3.0 DMGはad-hoc署名、mount、`codesign --verify --deep --strict`、起動を確認済みだが、Developer ID署名とApple notarizationは未実施である。実機起動確認はmacOS 26.5のApple Silicon、x64はRosetta経由であり、macOS 12〜25とIntel実機は未確認である。
- Publisherの契約やRelease情報を変更した場合、この節を `kizi`、`kizi-kougaku`、`kizi-other` の3リポジトリで同じcommit単位に同期する。

## kizi Publisher Android continuity contract

- Android版のソース正本はprivate repository `https://github.com/oriyu90/kizi-publisher-android` の `main` とする。対象はAndroid 8.0（API 26）以降のスマートフォン、タブレット、freeform window、Samsung DeX相当のdesktop windowingとする。
- Android版のローカル作業フォルダは使い捨てとし、引き継ぎや再開時は既存フォルダを正本とみなさず、`gh repo clone oriyu90/kizi-publisher-android` でprivate `main`から復元する。変更前に同repoの`README.md`、`AGENTS.md`、`docs/ARCHITECTURE.md`、`docs/THREAT_MODEL.md`、`docs/QUALITY_REPORT.md`、最新ReleaseとGitHub Actionsを確認する。
- Android現行配布版は `v0.1.1`、対象commitは `62c74af7e87d74a91187feacbc5f9a0838802955`、Releaseは `https://github.com/oriyu90/kizi-publisher-android/releases/tag/v0.1.1` とする。APK SHA-256は `3b7f5fc31e85a6ee254d41a37ab6e0898a4af03786113b110217376b182c99c7`、AAB SHA-256は `81e7fbe4916e77c935cd0a4dc9c69eeecc19b32745db4ece75c417f92b35678f`、署名証明書SHA-256は `29bc33a0240eb1f17dd5fb4748c1034a0b8663405a9c341ba192c520624a660f` である。署名は個人配布用の自己署名であり、Google Play App Signingは未使用である。
- 更新互換性に必要な署名正本はrepository外の `~/Library/Application Support/kizi Publisher Android/signing/kizi-publisher-android-release.jks` と同directoryの `password.txt` である。ローカルcloneを削除してもよいが、この署名directoryを失うと既存APKへ上書き更新できないため、repositoryやクラウド同期へ入れず安全な別媒体で保全する。OAuth client IDは任意の公開build設定であり、PAT、OAuth token、AI keyは復元資料やbuild入力にしない。
- Android版はmacOS版と同じ記事入力・routing・横断採番・完全削除・公開完了契約を守る。端末へNode.jsやGit cloneを同梱せず、GitHub APIでprivate candidate branchを作り、記事リポジトリの `Android Publisher Candidate / validate` が生成・`npm run check`・変更allowlist検証を終えた単一commitだけをvalidated refへ置く。アプリは3リポジトリのremote SHAを再照合してからforceなしで `main` をfast-forwardする。
- 通常認証はGitHub OAuth Device Flowを使い、client secretはAPKへ含めない。個人所有端末向け特例としてPersonal access tokenを設定画面から取り込めるが、tokenのソース、BuildConfig、APK asset、Git、Room、operation payload、ログ、Memoへの埋め込みは禁止する。OAuth token、refresh token、PAT、AI keyはAndroid Keystoreの別鍵を使うAES-256-GCM envelopeで暗号化し、logout時に暗号文と鍵aliasを削除する。
- Android版の公開操作は新規追加と完全削除である。preview payload、candidate作成後、validated commit作成後、main反映後のSHAと状態をRoom journalとapp-private atomic payloadへ保存する。クラッシュ後はPREVIEWED原稿を記録済み公開日・IDで完全一致復元し、candidate refまたは同じsource commitから再開・再確認する。候補refの再開時は既存workflow runを先に照合し、force pushを使わない。
- main反映後はmacOS版と同じく `Publish to kizi / delivery`、`/api/publish-status`、統合記事URLまたは完全削除後のexact-match collection不在を順に確認し、すべて成功するまで完了扱いにしない。Cloudflare資格情報をAndroid版へ追加しない。
- Memoはapp internal storageのUTF-8 plain text、上限1 MiB、`AtomicFile`、symlink拒否とし、700ms後・focus解除・background移行・明示保存・Ctrl+Sで保存する。暗号化しないためcredentialと未公開取材情報を保存しない。
- Android Publisher v0.1.1より後の次版も、本文翻訳と同じ5言語の`title`、`subtitle`、`description`をcandidate生成時に版カタログへ追加し、validated ref作成前に完全性を検証する。AI入力Markdownのschemaと通常入力項目は変更しない。
- GUIはHallmarkのdefault、hover、focus、active、disabled、loading、error、successを区別し、visible controlを48×48 dp以上、focus ringを3 dpとする。current window metricsに基づきcompact、medium、expanded、large、extra-largeをruntime再配置し、touch、mouse、trackpad、keyboard、画面回転、multi-window、DeXに対応する。
- fresh cloneでの保守はJDK 21、Android SDK/Build Tools 36、Node.jsを用い、`npm ci --ignore-scripts`、`./gradlew quality bundleRelease`、`./gradlew installDebug connectedDebugAndroidTest`、`npm run check:secrets`、`npm run test:runner`を通す。release時はversionCode/versionName、署名検証、APK/AABのsizeとSHA-256、更新インストール、private Release、同commitのQuality Actionを確認してから現行版情報を更新する。
- Android版の契約、Release、journal schemaまたはcandidate workflowを変更した場合、この節と `docs/system-design-and-operations.md` を `kizi`、`kizi-kougaku`、`kizi-other` の3リポジトリで同じ更新単位に同期する。

## Local workspace disposal and recovery contract

- `kizi`、`kizi-kougaku`、`kizi-other`、`kizi-publisher-macos`、`kizi-publisher-android`のローカルcloneはすべて使い捨てとし、GitHubの各private/public repositoryとReleaseを正本にする。削除前に未追跡ファイル、未commit差分、未push commitがないことを確認し、残す必要がある作業は`codex/`接頭辞のremote branchへcommitして、branch名とcommit SHAを`docs/system-design-and-operations.md`へ記録する。
- `node_modules`、`.wrangler`、`dist`、`release`、`test-results`、`.gradle`、`build`、`app/build`、Androidの`local.properties`は再生成可能であり、正本やバックアップにしない。復元・検証・Release再作成の手順は`docs/system-design-and-operations.md`を正とする。
- Git外で失うと復元できないものは別扱いにする。Androidの更新署名鍵とpassword、未完了操作を含むmacOS PublisherのuserData、必要なMemoは、clone削除前に安全な別媒体へ保全する。credential、token、AI key、署名password、未公開情報をGit、Release、共通文書、退避branchへ入れない。
- `docs/mac-publisher-app-design.md`は実装前の履歴設計であり、現行仕様の正本ではない。現行判断はこの`AGENTS.md`、`docs/article-format.md`、`docs/system-design-and-operations.md`、各Publisher repositoryのREADME・architecture・quality reportを優先する。
