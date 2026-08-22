import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../website/articles/index.json", import.meta.url), "utf8"));
const requested = process.argv[2] || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(requested);
if (!match) throw new Error("日付は YYYY-MM-DD で指定してください");
const [, year, month, day] = match;
const prefix = `${Number(year)}.${Number(month)}.${Number(day)}.`;
const maxOrder = manifest.articles
  .filter((article) => article.id.startsWith(prefix))
  .reduce((max, article) => Math.max(max, article.order), 0);
console.log(`${prefix}${maxOrder + 1}`);
