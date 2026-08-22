import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const articlesDirectory = path.join(root, "website/articles");
const contentDirectory = path.join(root, "content/articles");
const manifest = JSON.parse(await readFile(path.join(articlesDirectory, "index.json"), "utf8"));
const site = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
const idPattern = /^(\d{4})\.(\d{1,2})\.(\d{1,2})\.([1-9]\d*)$/;
const allowedCategories = new Set(["culture", "economy", "engineering", "politics", "science"]);
const requiredTranslations = ["en", "pt", "de", "zh-CN", "ar"];
const errors = [];

function parseFrontMatter(markdown, articleId) {
  if (!markdown.startsWith("---\n")) {
    errors.push(`${articleId}: Markdown先頭にfront matterが必要です`);
    return { metadata: {}, body: markdown };
  }
  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) {
    errors.push(`${articleId}: front matterが閉じられていません`);
    return { metadata: {}, body: markdown };
  }

  const metadata = {};
  let currentArray = null;
  for (const line of markdown.slice(4, end).split("\n")) {
    const item = /^\s{2}-\s+(.+)$/.exec(line);
    if (item && currentArray) {
      metadata[currentArray].push(item[1].replace(/^['"]|['"]$/g, ""));
      continue;
    }
    const field = /^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/.exec(line);
    if (!field) continue;
    const [, key, raw = ""] = field;
    if (!raw) {
      metadata[key] = [];
      currentArray = key;
      continue;
    }
    currentArray = null;
    const value = raw.replace(/^['"]|['"]$/g, "");
    metadata[key] = /^\d+$/.test(value) ? Number(value) : value;
  }
  return { metadata, body: markdown.slice(end + 5).trimStart() };
}

const entries = await readdir(articlesDirectory, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".html"));
const directories = entries.filter((entry) => entry.isDirectory());
if (directories.length) errors.push(`記事ディレクトリは禁止です: ${directories.map((entry) => entry.name).join(", ")}`);
const contentEntries = await readdir(contentDirectory, { withFileTypes: true });
const markdownFiles = contentEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
const contentDirectories = contentEntries.filter((entry) => entry.isDirectory());
if (contentDirectories.length) errors.push(`Markdownの記事ディレクトリは禁止です: ${contentDirectories.map((entry) => entry.name).join(", ")}`);

const seen = new Set();
for (const article of manifest.articles) {
  const match = idPattern.exec(article.id);
  if (!match) {
    errors.push(`記事IDの形式が不正です: ${article.id}`);
    continue;
  }
  const [, year, month, day, order] = match;
  const expectedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  if (article.date !== expectedDate) errors.push(`${article.id}: dateは${expectedDate}である必要があります`);
  if (Number(order) !== article.order) errors.push(`${article.id}: orderは${order}である必要があります`);
  const date = new Date(`${expectedDate}T00:00:00Z`);
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) errors.push(`${article.id}: 実在しない日付です`);
  const articleCategories = [article.category, ...(article.secondaryCategories || [])];
  if (!allowedCategories.has(article.category)) errors.push(`${article.id}: 未定義ジャンル ${article.category}`);
  for (const category of article.secondaryCategories || []) if (!allowedCategories.has(category)) errors.push(`${article.id}: 未定義ジャンル ${category}`);
  for (const category of site.articleRouting.requireCategories || []) {
    if (!articleCategories.includes(category)) errors.push(`${article.id}: ${site.edition}版に必要なジャンル ${category} がありません`);
  }
  for (const category of site.articleRouting.excludeCategories || []) {
    if (articleCategories.includes(category)) errors.push(`${article.id}: ${site.edition}版で禁止されたジャンル ${category} を含みます`);
  }
  if (seen.has(article.id)) errors.push(`記事IDが重複しています: ${article.id}`);
  seen.add(article.id);

  const articlePath = path.join(articlesDirectory, `${article.id}.html`);
  try {
    const html = await readFile(articlePath, "utf8");
    if (!html.includes(`data-article-slug="${article.id}"`)) errors.push(`${article.id}: HTML内の記事IDが一致しません`);
    if (!html.includes(`${site.deliveryOrigin}/articles/${article.id}`)) errors.push(`${article.id}: canonical URLが統合配信先と一致しません`);
    if (!html.includes("data-favorite-toggle")) errors.push(`${article.id}: お気に入りボタンがありません`);
    if (!html.includes("data-read-later-toggle")) errors.push(`${article.id}: あとで読むボタンがありません`);
    for (const language of requiredTranslations) {
      const marker = `data-article-translation="${language}"`;
      if (html.split(marker).length !== 2) errors.push(`${article.id}: ${language}翻訳は同じHTML内に1つ必要です`);
    }
  } catch {
    errors.push(`${article.id}: 記事ファイルがありません`);
  }

  try {
    const markdown = await readFile(path.join(contentDirectory, `${article.id}.md`), "utf8");
    const { metadata, body } = parseFrontMatter(markdown, article.id);
    const requiredMetadata = ["schemaVersion", "id", "issue", "title", "subtitle", "description", "publishedAt", "updatedAt", "order", "author", "language", "categories", "tags", "readingMinutes", "heroPool", "status"];
    for (const field of requiredMetadata) if (metadata[field] === undefined || metadata[field] === "") errors.push(`${article.id}: Markdownの ${field} が必要です`);
    if (metadata.schemaVersion !== 2) errors.push(`${article.id}: schemaVersionは2である必要があります`);
    if (metadata.id !== article.id) errors.push(`${article.id}: MarkdownのIDが一致しません`);
    if (metadata.publishedAt !== article.date) errors.push(`${article.id}: Markdownの公開日が一致しません`);
    if (metadata.order !== article.order) errors.push(`${article.id}: Markdownのorderが一致しません`);
    if (JSON.stringify(metadata.categories) !== JSON.stringify(articleCategories)) errors.push(`${article.id}: Markdownとindex.jsonのジャンルが一致しません`);
    if (metadata.heroPool !== metadata.categories?.[0]) errors.push(`${article.id}: heroPoolはcategoriesの先頭と一致させてください`);
    if (metadata.status !== "published") errors.push(`${article.id}: カタログ掲載記事のstatusはpublishedである必要があります`);
    if (!body.startsWith("## 要点\n")) errors.push(`${article.id}: 本文は「## 要点」から始めてください`);
    if (!/^## 結論$/m.test(body)) errors.push(`${article.id}: 「## 結論」が必要です`);
    if (!/^## 出典$/m.test(body)) errors.push(`${article.id}: 「## 出典」が必要です`);
    if (/^#\s+/m.test(body)) errors.push(`${article.id}: 本文にH1は使用できません`);
    if (/!\[[^\]]*\]\([^)]+\)/.test(body)) errors.push(`${article.id}: 本文画像は使用できません`);
    if (/```mermaid/i.test(body) || /<(?:script|iframe|img)\b/i.test(body)) errors.push(`${article.id}: ブラウザ依存の埋め込みは使用できません`);
  } catch {
    errors.push(`${article.id}: Markdown原稿がありません`);
  }
}

for (const file of files) {
  const id = file.name.slice(0, -5);
  if (!seen.has(id)) errors.push(`index.jsonにない記事ファイルです: ${file.name}`);
}

for (const file of markdownFiles) {
  const id = file.name.slice(0, -3);
  if (!seen.has(id)) errors.push(`index.jsonにないMarkdown原稿です: ${file.name}`);
}

for (const category of allowedCategories) {
  const pool = manifest.imagePools[category];
  if (!Array.isArray(pool) || pool.length !== 4) {
    errors.push(`${category}: 画像は4枚ちょうど必要です`);
    continue;
  }
  for (const image of pool) {
    try { await access(path.join(root, "website/assets/images", image)); }
    catch { errors.push(`${category}: 画像がありません: ${image}`); }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Validated ${manifest.articles.length} article source/HTML pair and 5 × 4 image assets for ${site.edition}.`);
