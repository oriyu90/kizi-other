import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const root = process.cwd();
const operationId = process.argv[2] ?? "";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const shaPattern = /^[0-9a-f]{40}$/;
const idPattern = /^(\d{4})\.(\d{1,2})\.(\d{1,2})\.([1-9]\d*)$/;
const categories = new Set(["culture", "economy", "engineering", "politics", "science"]);
const categoryNames = { culture: "文化", economy: "経済", engineering: "工学", politics: "政治", science: "理学" };
const languageLabels = { ja: "日本語", en: "English", pt: "Português", de: "Deutsch", "zh-CN": "简体中文", ar: "العربية" };
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: false, breaks: false });
const payloadPath = path.join(root, "publisher-operations", `${operationId}.json`);
const maxPayloadBytes = 24 * 1024 * 1024;

function fail(message) { throw new Error(message); }
function assert(condition, message) { if (!condition) fail(message); }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function jsonForHtml(value) { return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c"); }
function quote(value) { return JSON.stringify(value); }
function rfc822(date) { return new Date(`${date}T00:00:00+09:00`).toUTCString(); }
function articleSort(a, b) { return b.date.localeCompare(a.date) || b.order - a.order; }
async function readJson(file) { return JSON.parse(await readFile(file, "utf8")); }
async function writeText(file, value) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, value, { encoding: "utf8", mode: 0o600 }); }

function canonicalMarkdown(metadata, body) {
  return [
    "---", "schemaVersion: 2", `id: ${quote(metadata.id)}`, `issue: ${metadata.issue}`,
    `title: ${quote(metadata.title)}`, `subtitle: ${quote(metadata.subtitle)}`, `description: ${quote(metadata.description)}`,
    `publishedAt: ${quote(metadata.publishedAt)}`, `updatedAt: ${quote(metadata.updatedAt)}`, `order: ${metadata.order}`,
    `author: ${quote(metadata.author)}`, `language: ${quote(metadata.language)}`, "categories:",
    ...metadata.categories.map((item) => `  - ${quote(item)}`), "tags:", ...metadata.tags.map((item) => `  - ${quote(item)}`),
    `readingMinutes: ${metadata.readingMinutes}`, `heroPool: ${quote(metadata.heroPool)}`, `status: ${quote(metadata.status)}`, "---", "", body.trim(), ""
  ].join("\n");
}

function validateMetadata(metadata, site) {
  const required = ["id", "issue", "title", "subtitle", "description", "publishedAt", "updatedAt", "order", "author", "language", "categories", "tags", "readingMinutes", "heroPool", "status"];
  for (const field of required) assert(metadata[field] !== undefined && metadata[field] !== "", `metadata.${field} is required`);
  assert(metadata.schemaVersion === 2 && idPattern.test(metadata.id), "invalid article identity");
  assert(Number.isInteger(metadata.issue) && metadata.issue > 0 && Number.isInteger(metadata.order) && metadata.order > 0, "invalid issue/order");
  assert(metadata.language === "ja" && metadata.author === "kizi編集部" && metadata.status === "published", "managed metadata mismatch");
  assert(Array.isArray(metadata.categories) && metadata.categories.length >= 1 && metadata.categories.length <= 5, "invalid categories");
  assert(new Set(metadata.categories).size === metadata.categories.length && metadata.categories.every((item) => categories.has(item)), "unknown or duplicate category");
  assert(Array.isArray(metadata.tags) && metadata.tags.length >= 1 && metadata.tags.length <= 8 && new Set(metadata.tags).size === metadata.tags.length, "invalid tags");
  assert(metadata.heroPool === metadata.categories[0], "heroPool mismatch");
  const requiredCategories = site.articleRouting?.requireCategories ?? [];
  const excludedCategories = site.articleRouting?.excludeCategories ?? [];
  assert(requiredCategories.every((item) => metadata.categories.includes(item)) && excludedCategories.every((item) => !metadata.categories.includes(item)), "edition routing mismatch");
  const parts = idPattern.exec(metadata.id);
  assert(parts && metadata.publishedAt === `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` && metadata.order === Number(parts[4]), "id/date/order mismatch");
}

function articleEntry(metadata) {
  return { id: metadata.id, date: metadata.publishedAt, order: metadata.order, category: metadata.categories[0], secondaryCategories: metadata.categories.slice(1), title: metadata.title, description: metadata.description, readingMinutes: metadata.readingMinutes, author: metadata.author, url: `/articles/${metadata.id}` };
}

function renderArticlePage(metadata, body, translations, site, manifest) {
  const primary = metadata.categories[0];
  const canonical = `${site.deliveryOrigin}/articles/${metadata.id}`;
  const image = manifest.imagePools[metadata.heroPool]?.[0] ?? "og-default.jpg";
  const imageUrl = `${site.deliveryOrigin}/assets/images/${image}`;
  const tags = metadata.categories.map((category) => `<a class="tag" href="/#${category}">${escapeHtml(categoryNames[category])}</a>`).join(" ");
  const translationTemplates = Object.entries(translations).map(([language, translated]) => `<template data-article-translation="${language}">\n${markdown.render(translated)}\n</template>`).join("\n");
  const jsonLd = { "@context": "https://schema.org", "@type": "NewsArticle", headline: metadata.title, alternativeHeadline: metadata.subtitle, description: metadata.description, image: [imageUrl], datePublished: `${metadata.publishedAt}T09:00:00+09:00`, dateModified: `${metadata.updatedAt}T00:00:00+09:00`, inLanguage: "ja", articleSection: metadata.categories.map((category) => categoryNames[category]), keywords: metadata.tags, author: { "@type": "Organization", name: metadata.author }, mainEntityOfPage: canonical };
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metadata.title)} | kizi</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <meta name="author" content="${escapeHtml(metadata.author)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/kizi-192.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="alternate" type="application/rss+xml" title="kizi RSS" href="/feed.xml">
  <link rel="stylesheet" href="/assets/styles.css?v=11">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="kizi">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <script type="application/ld+json">${jsonForHtml(jsonLd)}</script>
</head>
<body class="article-page">
  <a class="skip-link" href="#article-body">本文へ移動</a>
  <header class="site-header"><a class="brand" href="/" aria-label="kizi ホーム"><span>kizi<span class="brand-dot">.</span></span><span class="brand-tagline">Read beyond<br>the headline</span></a><div class="header-actions"><button class="menu-toggle" type="button" aria-label="メニューを開く" aria-expanded="false" data-menu-toggle><span class="menu-label">メニュー</span></button></div></header>
  <nav class="main-nav" aria-label="メインナビゲーション" data-main-nav><a href="/#latest">最新記事</a><a href="/#categories">ジャンル</a><a href="/favorites">お気に入り</a><a href="/read-later">あとで読む</a><button class="nav-settings" type="button" data-settings-open>閲覧設定</button></nav><div class="nav-backdrop" aria-hidden="true" data-menu-backdrop></div><div class="article-progress" aria-hidden="true"><span data-reading-progress></span></div>
  <main><header class="article-hero"><nav class="breadcrumbs" aria-label="パンくずリスト"><a href="/">ホーム</a><span>/</span><a href="/#${primary}">${escapeHtml(categoryNames[primary])}</a><span>/</span><span aria-current="page">Issue ${String(metadata.issue).padStart(3, "0")}</span></nav><p class="eyebrow">Issue ${String(metadata.issue).padStart(3, "0")} / Deep read</p><div>${tags}</div><h1 class="article-title">${escapeHtml(metadata.title)}</h1><p class="article-subtitle">${escapeHtml(metadata.subtitle)}</p><div class="article-meta"><time datetime="${metadata.publishedAt}">${metadata.publishedAt.replaceAll("-", ".")}</time><span>約${metadata.readingMinutes}分</span><span>文 / ${escapeHtml(metadata.author)}</span><span>最終更新 ${metadata.updatedAt.replaceAll("-", ".")}</span></div><div class="article-actions"><button class="favorite-button" type="button" aria-pressed="false" data-favorite-toggle data-article-slug="${metadata.id}" data-article-url="/articles/${metadata.id}" data-article-title="${escapeHtml(metadata.title)}" data-article-date="${metadata.publishedAt}"><span data-favorite-label>お気に入りに追加</span></button><button class="read-later-button" type="button" aria-pressed="false" data-read-later-toggle data-article-slug="${metadata.id}" data-article-url="/articles/${metadata.id}" data-article-title="${escapeHtml(metadata.title)}" data-article-date="${metadata.publishedAt}"><span data-read-later-label>あとで読む</span></button></div></header>
  <figure class="article-cover"><img src="/assets/images/${escapeHtml(image)}" data-random-image="${metadata.heroPool}" alt="${escapeHtml(categoryNames[metadata.heroPool])}ジャンルのイメージ" width="1672" height="941" fetchpriority="high"></figure><div class="article-layout"><aside class="article-aside" aria-label="記事情報"><div class="article-aside-inner"><h2>Languages</h2><p>${Object.entries(languageLabels).map(([code, label]) => `${escapeHtml(label)} (${code})`).join("<br>")}</p></div></aside><article class="article-body" id="article-body" data-article-body>${markdown.render(body)}</article></div><div class="article-translations" hidden aria-hidden="true">${translationTemplates}</div></main>
  <footer class="site-footer"><div class="footer-top"><p class="footer-statement"><span>飽くなき</span><em>知の探究</em></p><nav class="footer-links"><a href="/">トップページ</a><a href="/feed.xml">RSS</a><a href="https://studio-rizi.pages.dev/" target="_blank" rel="author noopener">Yuki Orita / Studio Rizi ↗</a></nav></div><div class="footer-bottom"><span>© 2026 kizi</span><span>Independent news / Hiroshima, Japan</span></div></footer><script src="/assets/app.js?v=8" defer></script><script src="/assets/reader.js?v=10" defer></script>
</body></html>
`;
}

function renderIndexPage(manifest, site) {
  const articles = [...manifest.articles].sort(articleSort); const latest = articles[0];
  const rows = articles.map((article) => `<a class="article-row" href="${article.url}"><span class="article-row-date">${article.date.replaceAll("-", ".")}</span><span class="article-row-category">${escapeHtml(categoryNames[article.category])}</span><span class="article-row-title">${escapeHtml(article.title)}</span><span class="article-row-arrow" aria-hidden="true">→</span></a>`).join("\n");
  const counts = Object.fromEntries(Object.keys(categoryNames).map((category) => [category, articles.filter((article) => [article.category, ...(article.secondaryCategories ?? [])].includes(category)).length]));
  const categoryLinks = manifest.categories.filter((category) => site.edition === "engineering" || category.id !== "engineering").map((category, index) => `<a class="category-link" id="${category.id}" href="#latest"><span class="category-index">${String(index + 1).padStart(2, "0")}</span><span class="category-name">${escapeHtml(category.name)}</span><span class="category-count">${String(counts[category.id]).padStart(2, "0")}</span></a>`).join("\n");
  const hero = latest ? `<section class="hero page-shell"><div class="hero-copy"><p class="eyebrow">Latest / Issue</p><h1 class="hero-title">${escapeHtml(latest.title)}</h1><p class="hero-deck">${escapeHtml(latest.description)}</p><a class="hero-link" href="${latest.url}">記事を読む <span aria-hidden="true">→</span></a></div><a class="hero-visual" href="${latest.url}"><img src="/assets/images/${escapeHtml(manifest.imagePools[latest.category][0] ?? "og-default.jpg")}" data-random-image="${latest.category}" alt=""></a></section>` : `<section class="hero page-shell"><div class="hero-copy"><p class="eyebrow">Latest</p><h1 class="hero-title">新しい記事を準備しています。</h1><p class="hero-deck">公開された記事はここに表示されます。</p></div></section>`;
  return `<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(site.name)}</title><meta name="description" content="${escapeHtml(site.name)}の記事一覧"><link rel="canonical" href="${escapeHtml(site.origin)}/"><link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><link rel="alternate" type="application/rss+xml" title="kizi RSS" href="/feed.xml"><link rel="stylesheet" href="/assets/styles.css?v=11"></head>\n<body><a class="skip-link" href="#latest">記事一覧へ移動</a><header class="site-header"><a class="brand" href="/"><span>kizi<span class="brand-dot">.</span></span><span class="brand-tagline">Read beyond<br>the headline</span></a><div class="header-actions"><button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false">メニュー</button></div></header><nav class="main-nav" data-main-nav><a href="#latest">最新記事</a><a href="#categories">ジャンル</a><a href="/favorites">お気に入り</a><a href="/read-later">あとで読む</a><button class="nav-settings" data-settings-open>閲覧設定</button></nav><div class="nav-backdrop" data-menu-backdrop></div>\n<main>${hero}<section class="section page-shell" id="latest"><div class="section-head"><div><span class="section-index">01 — NOW</span><p class="eyebrow">Latest articles</p></div><h2 class="section-title">いま、読む記事。</h2></div><div class="article-list">${rows || '<p class="empty-state">公開記事はまだありません。</p>'}</div></section><section class="section page-shell" id="categories"><div class="section-head"><div><span class="section-index">02 — INDEX</span><p class="eyebrow">Categories</p></div><h2 class="section-title">関心から、深く読む。</h2></div><div class="category-grid">${categoryLinks}</div></section></main>\n<footer class="site-footer"><div class="footer-top"><p class="footer-statement"><span>飽くなき</span><em>知の探究</em></p><nav class="footer-links"><a href="/feed.xml">RSS</a><a href="https://studio-rizi.pages.dev/" target="_blank" rel="author noopener">Yuki Orita / Studio Rizi ↗</a></nav></div><div class="footer-bottom"><span>© 2026 kizi</span></div></footer><script src="/assets/app.js?v=8" defer></script><script src="/assets/reader.js?v=10" defer></script></body></html>\n`;
}

function renderFeed(manifest, site) { const articles = [...manifest.articles].sort(articleSort); const last = articles[0]?.date ?? "2026-08-22"; const items = articles.map((article) => `    <item><title>${escapeHtml(article.title)}</title><link>${site.deliveryOrigin}${article.url}</link><guid isPermaLink="true">${site.deliveryOrigin}${article.url}</guid><pubDate>${rfc822(article.date)}</pubDate>${[article.category, ...(article.secondaryCategories ?? [])].map((category) => `<category>${escapeHtml(categoryNames[category])}</category>`).join("")}<description>${escapeHtml(article.description)}</description></item>`).join("\n"); return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeHtml(site.name)}</title><link>${site.origin}/</link><description>${escapeHtml(site.name)}の記事フィード</description><language>ja</language><lastBuildDate>${rfc822(last)}</lastBuildDate><atom:link href="${site.origin}/feed.xml" rel="self" type="application/rss+xml" />\n${items}\n</channel></rss>\n`; }
function renderSitemap(manifest, site) { const latest = [...manifest.articles].sort(articleSort)[0]?.date ?? "2026-08-22"; const urls = [`  <url><loc>${site.origin}/</loc><lastmod>${latest}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`, ...manifest.articles.map((article) => `  <url><loc>${site.deliveryOrigin}${article.url}</loc><lastmod>${article.date}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`)]; return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`; }
async function writeCollections(manifest, site) { manifest.articles.sort(articleSort); await Promise.all([writeText(path.join(root, "website/articles/index.json"), `${JSON.stringify(manifest, null, 2)}\n`), writeText(path.join(root, "website/index.html"), renderIndexPage(manifest, site)), writeText(path.join(root, "website/feed.xml"), renderFeed(manifest, site)), writeText(path.join(root, "website/sitemap.xml"), renderSitemap(manifest, site))]); }

assert(uuidPattern.test(operationId), "invalid operation UUID");
const stat = await lstat(payloadPath); assert(stat.isFile() && !stat.isSymbolicLink() && stat.size <= maxPayloadBytes, "unsafe operation payload");
const payload = JSON.parse(await readFile(payloadPath, "utf8"));
const { digest, ...core } = payload;
assert(payload.schemaVersion === 1 && payload.operationId === operationId && ["create", "delete"].includes(payload.operation), "invalid payload identity");
assert(typeof digest === "string" && digest === sha256(JSON.stringify(core)), "payload digest mismatch");
assert(shaPattern.test(payload.baseSha) && payload.snapshot?.[payload.edition] === payload.baseSha, "invalid base snapshot");
assert(new Date(payload.createdAt).toISOString() === payload.createdAt && Math.abs(Date.now() - Date.parse(payload.createdAt)) < 7 * 24 * 60 * 60 * 1000, "invalid operation time");
const site = await readJson(path.join(root, "site.config.json"));
assert(site.schemaVersion === 2 && site.edition === payload.edition && process.env.GITHUB_REPOSITORY === site.repository, "repository/edition mismatch");
assert(process.env.GITHUB_REF_NAME === `kizi-publisher-android/${operationId}`, "candidate ref mismatch");
const testMode = process.env.KIZI_ANDROID_RUNNER_TEST === "1";
assert(!(testMode && process.env.CI === "true"), "runner test mode is forbidden in CI");
const remoteMain = testMode ? payload.baseSha : execFileSync("git", ["ls-remote", "origin", "refs/heads/main"], { encoding: "utf8", maxBuffer: 1024 * 1024 }).trim().split(/\s+/)[0];
assert(remoteMain === payload.baseSha, "target main changed before validation");
const manifest = await readJson(path.join(root, "website/articles/index.json"));
let articleId;
if (payload.operation === "create") {
  const create = payload.create; assert(create && typeof create.body === "string" && create.translations && create.metadata, "invalid create payload");
  const metadata = create.metadata; articleId = metadata.id; validateMetadata(metadata, site);
  assert(!manifest.articles.some((article) => article.id === articleId), "article already exists");
  assert(create.canonicalMarkdown === canonicalMarkdown(metadata, create.body), "canonical Markdown mismatch");
  assert(Object.keys(create.translations).sort().join(",") === ["ar", "de", "en", "pt", "zh-CN"].sort().join(","), "translation set mismatch");
  const sourceUrls = [...new Set(create.body.match(/https?:\/\/[^\s)>\]]+/g) ?? [])];
  for (const [language, text] of Object.entries(create.translations)) { assert(typeof text === "string" && text.length > 0 && Buffer.byteLength(text) <= 4 * 1024 * 1024, `${language} translation invalid`); assert(!/<(?:script|iframe|img|object|embed)\b/i.test(text) && !/!\[[^\]]*\]\([^)]+\)/.test(text), `${language} translation unsafe`); assert(sourceUrls.every((url) => text.includes(url)), `${language} translation missing URL`); }
  manifest.articles.push(articleEntry(metadata)); manifest.articles.sort(articleSort);
  await writeText(path.join(root, "content/articles", `${articleId}.md`), create.canonicalMarkdown);
  await writeText(path.join(root, "content/translations", `${articleId}.json`), `${JSON.stringify({ schemaVersion: 1, articleId, sourceDigest: sha256(create.canonicalMarkdown.replace(/\r\n?/g, "\n").trim() + "\n"), provider: create.provider?.name ?? "openai-compatible", model: create.provider?.model, translations: create.translations }, null, 2)}\n`);
  await writeText(path.join(root, "website/articles", `${articleId}.html`), renderArticlePage(metadata, create.body, create.translations, site, manifest));
  await writeCollections(manifest, site);
} else {
  const deletion = payload.delete; assert(deletion && idPattern.test(deletion.articleId) && typeof deletion.confirmationTitle === "string", "invalid delete payload"); articleId = deletion.articleId;
  const existing = manifest.articles.find((article) => article.id === articleId); assert(existing && existing.title === deletion.confirmationTitle, "delete title mismatch");
  manifest.articles = manifest.articles.filter((article) => article.id !== articleId);
  await Promise.all([rm(path.join(root, "content/articles", `${articleId}.md`)), rm(path.join(root, "content/translations", `${articleId}.json`), { force: true }), rm(path.join(root, "website/articles", `${articleId}.html`))]);
  await writeCollections(manifest, site);
}
await rm(payloadPath);
const allowed = new Set([`content/articles/${articleId}.md`, `content/translations/${articleId}.json`, `website/articles/${articleId}.html`, "website/articles/index.json", "website/index.html", "website/feed.xml", "website/sitemap.xml"]);
const changed = execFileSync("git", ["diff", "--name-only", payload.baseSha], { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 }).trim().split("\n").filter(Boolean);
assert(changed.length > 0 && changed.every((file) => allowed.has(file)), `changed-file allowlist violation: ${changed.filter((file) => !allowed.has(file)).join(", ")}`);
const credentialPattern = /(authorization\s*:|bearer\s+[a-z0-9._-]{16,}|gh[pousr]_[a-z0-9_]{20,}|github_pat_[a-z0-9_]{20,}|sk-[a-z0-9_-]{16,}|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i;
for (const file of changed) { try { const text = await readFile(path.join(root, file), "utf8"); assert(!credentialPattern.test(text), `credential-like content in ${file}`); } catch (error) { if (payload.operation !== "delete") throw error; } }
const finalRemoteMain = testMode ? payload.baseSha : execFileSync("git", ["ls-remote", "origin", "refs/heads/main"], { encoding: "utf8", maxBuffer: 1024 * 1024 }).trim().split(/\s+/)[0];
assert(finalRemoteMain === payload.baseSha, "target main changed during generation");
await writeText(path.join(root, "publisher-operation-base.json"), `${JSON.stringify({ baseSha: payload.baseSha, createdAt: payload.createdAt })}\n`);
process.stdout.write(`${JSON.stringify({ operationId, articleId, edition: payload.edition, changedFiles: changed })}\n`);
