# kizi article source

このリポジトリはkiziの記事正本と生成済み成果物を保持するsource repositoryです。読者向けサイトと記事URLは[kizi](https://kizi.pages.dev/)へ統一されています。

- 工学を含む記事の正本: `oriyu90/kizi-kougaku`
- 工学を含まない記事の正本: `oriyu90/kizi-other`
- 読者向け記事URL: `https://kizi.pages.dev/articles/<ID>`
- Author: [Yuki Orita / Studio Rizi](https://studio-rizi.pages.dev/)

## AI article workflow

記事IDは公開日とその日の連番を組み合わせた`YYYY.M.D.N`です。

- `content/articles/<記事ID>.md`へ1記事1ファイルで保存する
- Markdownを唯一の編集元にし、Publisherが`website/articles/<記事ID>.html`を生成する
- 本文画像は使わず、ジャンル別の共通トップ画像を使う
- 工学を含むかどうかで2つのsource repositoryへ自動振り分けする

完全な原稿仕様は[docs/article-format.md](docs/article-format.md)、共通ルールは[AGENTS.md](AGENTS.md)、R2同期とPublisherの保守契約は[docs/system-design-and-operations.md](docs/system-design-and-operations.md)を参照してください。

## Publishing workflow

```sh
npm run check
git push origin main
```

`main`へのpush後、GitHub Actionsの`Publish to kizi`がOIDCで統合配信APIへ接続します。変更された記事HTMLだけをCloudflare R2へ保存し、版カタログを最後に確定します。CloudflareのAPI tokenやR2 keyをこのリポジトリへ保存しません。

`kizi-kougaku.pages.dev`と`kizi-other.pages.dev`は互換転送用です。canonical、OGP、JSON-LD、共有URLには`site.config.json`の`deliveryOrigin`を使います。
