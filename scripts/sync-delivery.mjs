import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const endpoint = process.env.KIZI_SYNC_ENDPOINT || "https://kizi.pages.dev/api/sync";
const edition = process.env.KIZI_EDITION;
const commit = process.env.GITHUB_SHA;
const repository = process.env.GITHUB_REPOSITORY;
const expectedRepositories = {
  engineering: "oriyu90/kizi-kougaku",
  other: "oriyu90/kizi-other"
};

function fail(message) {
  throw new Error(message);
}

if (!expectedRepositories[edition]) fail("KIZI_EDITION must be engineering or other");
if (repository !== expectedRepositories[edition]) fail(`Repository ${repository || "(missing)"} is not valid for ${edition}`);
if (!/^[a-f0-9]{40}$/.test(commit || "")) fail("GITHUB_SHA must be a full commit SHA");
if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL || !process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) fail("GitHub Actions OIDC permission is required");

const remoteMain = execFileSync("git", ["ls-remote", "origin", "refs/heads/main"], { encoding: "utf8" }).trim().split(/\s+/)[0];
if (remoteMain !== commit) fail(`Workflow commit ${commit} is no longer the remote main (${remoteMain || "missing"})`);

async function requestOidcToken() {
  const separator = process.env.ACTIONS_ID_TOKEN_REQUEST_URL.includes("?") ? "&" : "?";
  const url = `${process.env.ACTIONS_ID_TOKEN_REQUEST_URL}${separator}audience=${encodeURIComponent(endpoint)}`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` } });
  if (!response.ok) fail(`Could not obtain GitHub OIDC token (${response.status})`);
  const payload = await response.json();
  if (!payload.value) fail("GitHub OIDC response did not include a token");
  return payload.value;
}

async function post(action, body) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const token = await requestOidcToken();
      const response = await fetch(`${endpoint}/${action}`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result;
      if (response.status < 500 && response.status !== 429) fail(`${action} rejected (${response.status}): ${JSON.stringify(result)}`);
      lastError = new Error(`${action} failed (${response.status})`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** (attempt - 1))));
  }
  throw lastError;
}

const catalogPath = path.join(process.cwd(), "website/articles/index.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const htmlById = new Map();
const articles = [];
for (const article of catalog.articles) {
  const html = await readFile(path.join(process.cwd(), "website/articles", `${article.id}.html`), "utf8");
  const artifactHash = createHash("sha256").update(html).digest("hex");
  htmlById.set(article.id, html);
  articles.push({ ...article, artifactHash });
}

const common = { edition, commit };
const started = await post("begin", { ...common, catalog: { ...catalog, articles } });
const requested = started.uploadIds || [];
const batchSize = 12;
for (let offset = 0; offset < requested.length; offset += batchSize) {
  const ids = requested.slice(offset, offset + batchSize);
  await post("articles", {
    ...common,
    batch: offset / batchSize,
    articles: ids.map((id) => ({ id, html: htmlById.get(id) }))
  });
}
const completed = await post("finalize", common);
console.log(`Published ${completed.articleCount} ${edition} article(s) from ${commit} to kizi.`);
