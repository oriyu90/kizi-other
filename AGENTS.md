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

- `kizi-kougaku` は、`categories` に `engineering` を含む記事だけを配信する。
- `kizi-other` は、`categories` に `engineering` を含まない記事だけを配信する。
- 1記事を両方の版で配信しない。振り分け判定では主ジャンル・副ジャンルを区別せず、`categories` 全体を見る。
- `kizi` は記事を配信せず、`kizi-kougaku`、`kizi-other`、Studio Riziへの案内ページだけを置く。
- 雄武町の金銀鉱床の記事 `2026.8.19.1` は `engineering` を含め、`kizi-kougaku` だけで配信する。

## Publishing contract

- サイト固有のURLと振り分け条件は `site.config.json` を正とする。
- 記事追加時はMarkdown、`website/articles/index.json`、生成HTML、トップページ、RSS、サイトマップを同じ更新単位で同期する。
- 公開前に `npm run check` を通す。
- GitHubの `main` へのpushをCloudflare Pagesの本番自動デプロイ起点とする。
- 自動更新アプリは2つの記事リポジトリの最新 `main` を確認してから、記事IDとIssue番号を横断採番する。
- 公開成果物は1回のGitコミットで原子的に更新する。複数ファイルを1ファイルずつ `main` へ直接書き込まない。
- 認証情報、APIトークン、AIの内部プロンプト、未公開の取材情報をリポジトリやブラウザへ保存しない。
