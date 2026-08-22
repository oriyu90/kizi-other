const KIZI_IMAGES = {
  culture: ["culture-2026-01.webp", "culture-2026-02.webp", "culture-2026-03.webp", "culture-2026-04.webp"],
  economy: ["economy-2026-01.webp", "economy-2026-02.webp", "economy-2026-03.webp", "economy-2026-04.webp"],
  engineering: ["engineering-2026-01.webp", "engineering-2026-02.webp", "engineering-2026-03.webp", "engineering-2026-04.webp"],
  politics: ["politics-2026-01.webp", "politics-2026-02.webp", "politics-2026-03.webp", "politics-2026-04.webp"],
  science: ["science-2026-01.webp", "science-2026-02.webp", "science-2026-03.webp", "science-2026-04.webp"]
};

function initRandomImages() {
  document.querySelectorAll("[data-random-image]").forEach((image) => {
    const category = image.dataset.randomImage;
    const choices = KIZI_IMAGES[category];
    if (!choices?.length) return;
    const pick = choices[Math.floor(Math.random() * choices.length)];
    image.src = `/assets/images/${pick}`;
    image.dataset.selectedImage = pick;
  });
}

function initMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-main-nav]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  if (!button || !nav) return;

  const setMenuState = (open) => {
    nav.classList.toggle("is-open", open);
    backdrop?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    const label = button.querySelector("[data-menu-label]");
    if (label) label.textContent = open ? (button.dataset.menuCloseText || "閉じる") : (button.dataset.menuOpenText || "メニュー");
    button.setAttribute("aria-label", label?.textContent || "メニュー");
  };

  button.addEventListener("click", () => setMenuState(!nav.classList.contains("is-open")));
  backdrop?.addEventListener("click", () => setMenuState(false));
  nav.addEventListener("click", (event) => {
    if (!event.target.closest("a, .nav-settings")) setMenuState(false);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuState(false)));
  nav.querySelectorAll("[data-settings-open]").forEach((control) => control.addEventListener("click", () => setMenuState(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) setMenuState(false);
  });
  document.addEventListener("kizi:languagechange", () => setMenuState(nav.classList.contains("is-open")));
}

function initReadingProgress() {
  const progress = document.querySelector("[data-reading-progress]");
  const article = document.querySelector("[data-article-body]");
  if (!progress || !article) return;

  const update = () => {
    const start = window.scrollY + article.getBoundingClientRect().top;
    const end = start + article.scrollHeight - window.innerHeight;
    const pageEnd = document.documentElement.scrollHeight - window.innerHeight;
    const atPageEnd = window.scrollY >= pageEnd - 2;
    const value = atPageEnd ? 1 : Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    progress.style.width = `${value * 100}%`;
  };
  update();
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  if ("ResizeObserver" in window) new ResizeObserver(update).observe(article);
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch((error) => {
      console.warn("kizi service worker could not be registered", error);
    });
  });
}

initRandomImages();
initMenu();
initReadingProgress();
initServiceWorker();
