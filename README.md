# kizi

背景まで丁寧に読み解く独立系ニュースサイトの共通コードです。公開版は役割で分かれています。

- [kizi 工学](https://kizi-kougaku.pages.dev/): `engineering` を含む記事
- [kizi 非工学](https://kizi-other.pages.dev/): `engineering` を含まない記事
- [kizi 案内](https://kizi.pages.dev/): 2版とStudio Riziへの入口
- Author: [Yuki Orita / Studio Rizi](https://studio-rizi.pages.dev/)

## AI article workflow

記事IDは公開日とその日の連番を組み合わせた `YYYY.M.D.N` です。例: `2026.8.21.1`。

- AI原稿は `content/articles/<記事ID>.md` に1記事1ファイルで保存する
- Markdownを唯一の編集元にし、投稿アプリが `website/articles/<記事ID>.html` を生成する
- タイトル、副題、要点、説明、ジャンル、出典を含む
- 本文画像は使わず、ジャンル別の共通トップ画像を使う
- 工学を含むかどうかで2つの公開版へ自動振り分けする

AIへ渡す完全な仕様は [docs/article-format.md](docs/article-format.md)、リポジトリ共通ルールは [AGENTS.md](AGENTS.md) を参照してください。

## Publishing workflow

```sh
npm run article:next-id -- 2026-08-21
npm run check
git push origin main
```

`main` へのpush後、Cloudflare PagesのGit連携が `website/` を自動公開します。サイトURLと版の振り分け条件は `site.config.json` で管理します。

## Local preview

```sh
cd website
python3 -m http.server 4173
```

トップ画像は `website/assets/images/` に5ジャンル×4枚を収録し、`website/assets/app.js` が記事ジャンルのプールから選びます。
