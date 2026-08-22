const KIZI_READER_DB = "kizi-reader";
const KIZI_READER_VERSION = 2;
const DEFAULT_READER_SETTINGS = {
  key: "reader",
  settingsSchema: 2,
  language: "ja",
  articleFont: "gothic",
  articleScale: 1,
  articleBold: false,
  uiScale: 1,
  controlScale: 1,
  themeMode: "system",
  accentColor: "orange"
};

const SUPPORTED_LANGUAGES = ["ja", "en", "pt", "de", "zh-CN", "ar"];
const LANGUAGE_NAMES = {
  ja: "日本語",
  en: "English",
  pt: "Português",
  de: "Deutsch",
  "zh-CN": "简体中文",
  ar: "العربية"
};

const I18N = {
  ja: {
    skipContent: "本文へ移動", mainNavigation: "メインナビゲーション", menu: "メニュー", closeMenu: "閉じる", latestNav: "最新記事", categoriesNav: "ジャンル", creatorNav: "つくった人 ↗", engineeringKizi: "工学kiziに飛ぶ", otherKizi: "非工学kiziに飛ぶ",
    culture: "文化", economy: "経済", engineering: "工学", politics: "政治", science: "理学", scienceEconomy: "理学 / 経済", engineeringScienceEconomy: "工学 / 理学 / 経済",
    articleTitle: "雄武町の「金脈発見」は新たな金山につながるか", articleDeck: "世界の金市場、日本の地質、開発条件から考える。いま分かっていることと、まだ分からないことを切り分けます。", articleSubtitle: "世界の金市場、日本の地質、開発条件から考える",
    readArticle: "記事を読む", readTime: "約14分", byline: "文 / kizi編集部", updated: "最終更新 2026.08.22", latestTitle: "いま、読む記事。",
    categoriesTitle: "世界を見る、<br>5つの入口。", cultureDesc: "表現、記憶、暮らしの形", economyDesc: "価値と選択を数字から読む", engineeringDesc: "技術を形にする設計と実装", politicsDesc: "権力、制度、公共の意思決定", scienceDesc: "自然法則と研究の現在地",
    footerStatement: "<span>飽くなき</span><em>知の探究</em>", firstArticle: "第一号の記事", topPage: "トップページ", home: "ホーム",
    contents: "Contents", tocKeyPoints: "要点", tocGoldMarket: "世界の金市場", tocGeology: "なぜ日本に金があるのか", tocDecline: "日本の金山はなぜ衰退したか", tocOmu: "雄武で何が見つかったか", tocImpact: "地域経済への影響", tocConclusion: "結論",
    settings: "閲覧設定", close: "閉じる", display: "表示", language: "言語", languageNote: "初回はブラウザの言語を自動で選びます。", uiScale: "サイト全体の大きさ", controlScale: "ボタンの大きさ", articleReading: "記事本文", articleFont: "本文フォント", articleScale: "本文の文字サイズ", articleBold: "本文を太文字にする", theme: "テーマ", system: "ブラウザに従う", light: "ホワイト", dark: "ダーク", mincho: "明朝", gothic: "ゴシック", serif: "欧文セリフ", sans: "欧文サンセリフ", accentColor: "アクセントカラー", orange: "オレンジ", blue: "ブルー", red: "レッド", violet: "バイオレット", green: "グリーン", yellow: "イエロー", favorites: "お気に入り", favoritesPageDeck: "お気に入りに追加した記事を、この端末からいつでも読み返せます。", noFavorites: "お気に入りの記事はまだありません。", removeFavorite: "お気に入りから削除", reset: "表示設定を初期値に戻す", settingsOpen: "閲覧設定を開く", favoriteAdd: "お気に入りに追加", favoriteRemove: "お気に入りから削除", loadingTranslation: "翻訳を読み込んでいます…", translationError: "翻訳を読み込めなかったため、日本語の本文を表示しています。"
  },
  en: {
    skipContent: "Skip to content", mainNavigation: "Main navigation", menu: "Menu", closeMenu: "Close", latestNav: "Latest", categoriesNav: "Categories", creatorNav: "Creator ↗", engineeringKizi: "Go to Engineering kizi", otherKizi: "Go to non-engineering kizi",
    culture: "Culture", economy: "Economy", engineering: "Engineering", politics: "Politics", science: "Science", scienceEconomy: "Science / Economy", engineeringScienceEconomy: "Engineering / Science / Economy",
    articleTitle: "Could Omu's ‘gold discovery’ become a new mine?", articleDeck: "A closer look at the global gold market, Japan's geology and the conditions for development—separating what is known from what remains uncertain.", articleSubtitle: "The global gold market, Japan's geology and development conditions",
    readArticle: "Read the article", readTime: "About 14 min", byline: "By kizi Editorial", updated: "Updated Aug 22, 2026", latestTitle: "Read now.",
    categoriesTitle: "Five ways to<br>see the world.", cultureDesc: "Forms of expression, memory and living", economyDesc: "Reading value and choice through numbers", engineeringDesc: "Design and implementation that make technology real", politicsDesc: "Power, institutions and public decisions", scienceDesc: "Natural laws and research today",
    footerStatement: "<span>Relentless pursuit</span><em>of knowledge</em>", firstArticle: "Issue 001", topPage: "Home", home: "Home",
    contents: "Contents", tocKeyPoints: "Key points", tocGoldMarket: "The global gold market", tocGeology: "Why Japan has gold", tocDecline: "Why Japan's gold mines declined", tocOmu: "What was found in Omu", tocImpact: "Regional impact", tocConclusion: "Conclusion",
    settings: "Reading settings", close: "Close", display: "Display", language: "Language", languageNote: "Your browser language is selected on the first visit.", uiScale: "Overall site scale", controlScale: "Button size", articleReading: "Article text", articleFont: "Body font", articleScale: "Article text size", articleBold: "Use bold article text", theme: "Theme", system: "Follow browser", light: "White", dark: "Dark", mincho: "Japanese serif", gothic: "Japanese sans", serif: "Serif", sans: "Sans serif", accentColor: "Accent color", orange: "Orange", blue: "Blue", red: "Red", violet: "Violet", green: "Green", yellow: "Yellow", favorites: "Favorites", favoritesPageDeck: "Return anytime to the articles saved as favorites on this device.", noFavorites: "You have no favorite articles yet.", removeFavorite: "Remove from favorites", reset: "Reset display settings", settingsOpen: "Open reading settings", favoriteAdd: "Add to favorites", favoriteRemove: "Remove from favorites", loadingTranslation: "Loading translation…", translationError: "The translation could not be loaded, so the Japanese article is shown."
  },
  pt: {
    skipContent: "Ir para o conteúdo", mainNavigation: "Navegação principal", menu: "Menu", closeMenu: "Fechar", latestNav: "Mais recente", categoriesNav: "Categorias", creatorNav: "Criador ↗", engineeringKizi: "Ir para o kizi de engenharia", otherKizi: "Ir para o kizi não engenharia",
    culture: "Cultura", economy: "Economia", engineering: "Engenharia", politics: "Política", science: "Ciências", scienceEconomy: "Ciências / Economia", engineeringScienceEconomy: "Engenharia / Ciências / Economia",
    articleTitle: "A ‘descoberta de ouro’ em Omu pode virar uma nova mina?", articleDeck: "Uma análise do mercado mundial de ouro, da geologia do Japão e das condições de desenvolvimento, separando o que sabemos do que ainda é incerto.", articleSubtitle: "Mercado mundial de ouro, geologia japonesa e condições de desenvolvimento",
    readArticle: "Ler o artigo", readTime: "Cerca de 14 min", byline: "Por kizi Editorial", updated: "Atualizado em 22 ago. 2026", latestTitle: "Para ler agora.",
    categoriesTitle: "Cinco entradas para<br>ver o mundo.", cultureDesc: "Formas de expressão, memória e vida", economyDesc: "Valor e escolhas lidos pelos números", engineeringDesc: "Projeto e implementação que materializam a tecnologia", politicsDesc: "Poder, instituições e decisões públicas", scienceDesc: "Leis naturais e pesquisa hoje",
    footerStatement: "<span>Busca incansável</span><em>pelo conhecimento</em>", firstArticle: "Edição 001", topPage: "Início", home: "Início",
    contents: "Conteúdo", tocKeyPoints: "Pontos principais", tocGoldMarket: "Mercado mundial de ouro", tocGeology: "Por que há ouro no Japão", tocDecline: "Por que as minas japonesas declinaram", tocOmu: "O que foi encontrado em Omu", tocImpact: "Impacto regional", tocConclusion: "Conclusão",
    settings: "Configurações de leitura", close: "Fechar", display: "Exibição", language: "Idioma", languageNote: "Na primeira visita, usamos o idioma do navegador.", uiScale: "Escala geral do site", controlScale: "Tamanho dos botões", articleReading: "Texto do artigo", articleFont: "Fonte do texto", articleScale: "Tamanho do texto", articleBold: "Usar texto em negrito", theme: "Tema", system: "Seguir navegador", light: "Branco", dark: "Escuro", mincho: "Mincho", gothic: "Gótico", serif: "Serifada", sans: "Sem serifa", accentColor: "Cor de destaque", orange: "Laranja", blue: "Azul", red: "Vermelho", violet: "Violeta", green: "Verde", yellow: "Amarelo", favorites: "Favoritos", favoritesPageDeck: "Volte quando quiser aos artigos salvos como favoritos neste dispositivo.", noFavorites: "Ainda não há artigos favoritos.", removeFavorite: "Remover dos favoritos", reset: "Restaurar exibição", settingsOpen: "Abrir configurações de leitura", favoriteAdd: "Adicionar aos favoritos", favoriteRemove: "Remover dos favoritos", loadingTranslation: "Carregando tradução…", translationError: "Não foi possível carregar a tradução; o artigo em japonês está sendo exibido."
  },
  de: {
    skipContent: "Zum Inhalt", mainNavigation: "Hauptnavigation", menu: "Menü", closeMenu: "Schließen", latestNav: "Neuester Artikel", categoriesNav: "Kategorien", creatorNav: "Über den Macher ↗", engineeringKizi: "Zum Technik-kizi", otherKizi: "Zum Nicht-Technik-kizi",
    culture: "Kultur", economy: "Wirtschaft", engineering: "Ingenieurwesen", politics: "Politik", science: "Naturwissenschaft", scienceEconomy: "Naturwissenschaft / Wirtschaft", engineeringScienceEconomy: "Ingenieurwesen / Naturwissenschaft / Wirtschaft",
    articleTitle: "Kann der ‚Goldfund‘ in Omu zu einer neuen Mine werden?", articleDeck: "Ein Blick auf den globalen Goldmarkt, Japans Geologie und die Bedingungen für eine Erschließung – getrennt nach Bekanntem und Ungewissem.", articleSubtitle: "Goldmarkt, Japans Geologie und Bedingungen für die Erschließung",
    readArticle: "Artikel lesen", readTime: "Etwa 14 Min.", byline: "Von der kizi-Redaktion", updated: "Aktualisiert am 22. Aug. 2026", latestTitle: "Jetzt lesen.",
    categoriesTitle: "Fünf Zugänge,<br>die Welt zu sehen.", cultureDesc: "Formen von Ausdruck, Erinnerung und Leben", economyDesc: "Werte und Entscheidungen in Zahlen lesen", engineeringDesc: "Entwurf und Umsetzung technischer Lösungen", politicsDesc: "Macht, Institutionen und öffentliche Entscheidungen", scienceDesc: "Naturgesetze und Forschung heute",
    footerStatement: "<span>Unermüdliche Suche</span><em>nach Wissen</em>", firstArticle: "Ausgabe 001", topPage: "Startseite", home: "Startseite",
    contents: "Inhalt", tocKeyPoints: "Kernaussagen", tocGoldMarket: "Der globale Goldmarkt", tocGeology: "Warum es in Japan Gold gibt", tocDecline: "Warum Japans Goldminen zurückgingen", tocOmu: "Was in Omu gefunden wurde", tocImpact: "Regionale Auswirkungen", tocConclusion: "Fazit",
    settings: "Leseeinstellungen", close: "Schließen", display: "Darstellung", language: "Sprache", languageNote: "Beim ersten Besuch wird die Browsersprache verwendet.", uiScale: "Gesamtgröße der Website", controlScale: "Schaltflächengröße", articleReading: "Artikeltext", articleFont: "Textschrift", articleScale: "Textgröße", articleBold: "Artikeltext fett", theme: "Farbschema", system: "Browser folgen", light: "Weiß", dark: "Dunkel", mincho: "Mincho", gothic: "Gothic", serif: "Serifenschrift", sans: "Serifenlos", accentColor: "Akzentfarbe", orange: "Orange", blue: "Blau", red: "Rot", violet: "Violett", green: "Grün", yellow: "Gelb", favorites: "Favoriten", favoritesPageDeck: "Hier finden Sie jederzeit die auf diesem Gerät gespeicherten Lieblingsartikel.", noFavorites: "Noch keine Lieblingsartikel.", removeFavorite: "Aus Favoriten entfernen", reset: "Anzeige zurücksetzen", settingsOpen: "Leseeinstellungen öffnen", favoriteAdd: "Zu Favoriten hinzufügen", favoriteRemove: "Aus Favoriten entfernen", loadingTranslation: "Übersetzung wird geladen…", translationError: "Die Übersetzung konnte nicht geladen werden; der japanische Artikel wird angezeigt."
  },
  "zh-CN": {
    skipContent: "跳转到正文", mainNavigation: "主导航", menu: "菜单", closeMenu: "关闭", latestNav: "最新文章", categoriesNav: "分类", creatorNav: "创作者 ↗", engineeringKizi: "前往工程kizi", otherKizi: "前往非工程kizi",
    culture: "文化", economy: "经济", engineering: "工程", politics: "政治", science: "理学", scienceEconomy: "理学 / 经济", engineeringScienceEconomy: "工程 / 理学 / 经济",
    articleTitle: "雄武町的“金矿发现”会成为一座新矿山吗？", articleDeck: "从全球黄金市场、日本地质与开发条件出发，区分目前已知的事实与仍待确认的问题。", articleSubtitle: "从全球黄金市场、日本地质与开发条件来分析",
    readArticle: "阅读文章", readTime: "约14分钟", byline: "文 / kizi编辑部", updated: "更新于2026年8月22日", latestTitle: "现在，读这篇。",
    categoriesTitle: "观察世界的<br>五个入口。", cultureDesc: "表达、记忆与生活的形态", economyDesc: "从数字理解价值与选择", engineeringDesc: "让技术落地的设计与实现", politicsDesc: "权力、制度与公共决策", scienceDesc: "自然规律与研究前沿",
    footerStatement: "<span>永不止步的</span><em>知识探索</em>", firstArticle: "第001期", topPage: "首页", home: "首页",
    contents: "目录", tocKeyPoints: "要点", tocGoldMarket: "全球黄金市场", tocGeology: "日本为何有黄金", tocDecline: "日本金矿为何衰退", tocOmu: "雄武发现了什么", tocImpact: "对地区经济的影响", tocConclusion: "结论",
    settings: "阅读设置", close: "关闭", display: "显示", language: "语言", languageNote: "首次访问时会自动选择浏览器语言。", uiScale: "网站整体大小", controlScale: "按钮大小", articleReading: "文章正文", articleFont: "正文字体", articleScale: "正文字号", articleBold: "使用粗体正文", theme: "主题", system: "跟随浏览器", light: "白色", dark: "深色", mincho: "明朝体", gothic: "黑体", serif: "衬线体", sans: "无衬线体", accentColor: "强调色", orange: "橙色", blue: "蓝色", red: "红色", violet: "紫色", green: "绿色", yellow: "黄色", favorites: "收藏", favoritesPageDeck: "可随时查看保存在此设备上的收藏文章。", noFavorites: "尚未收藏文章。", removeFavorite: "取消收藏", reset: "恢复显示默认值", settingsOpen: "打开阅读设置", favoriteAdd: "加入收藏", favoriteRemove: "取消收藏", loadingTranslation: "正在加载翻译…", translationError: "无法加载翻译，现显示日文原文。"
  },
  ar: {
    skipContent: "الانتقال إلى المحتوى", mainNavigation: "التنقل الرئيسي", menu: "القائمة", closeMenu: "إغلاق", latestNav: "الأحدث", categoriesNav: "التصنيفات", creatorNav: "صانع الموقع ↗", engineeringKizi: "الذهاب إلى kizi الهندسة", otherKizi: "الذهاب إلى kizi غير الهندسي",
    culture: "ثقافة", economy: "اقتصاد", engineering: "هندسة", politics: "سياسة", science: "علوم", scienceEconomy: "علوم / اقتصاد", engineeringScienceEconomy: "هندسة / علوم / اقتصاد",
    articleTitle: "هل يمكن أن يتحول «اكتشاف الذهب» في أومو إلى منجم جديد؟", articleDeck: "قراءة في سوق الذهب العالمي وجيولوجيا اليابان وشروط التطوير، مع فصل الحقائق المعروفة عما لم يُحسم بعد.", articleSubtitle: "سوق الذهب العالمي وجيولوجيا اليابان وشروط التطوير",
    readArticle: "قراءة المقال", readTime: "نحو 14 دقيقة", byline: "تحرير kizi", updated: "آخر تحديث 22 أغسطس 2026", latestTitle: "مقال للقراءة الآن.",
    categoriesTitle: "خمسة مداخل<br>لرؤية العالم.", cultureDesc: "أشكال التعبير والذاكرة والحياة", economyDesc: "قراءة القيمة والاختيار بالأرقام", engineeringDesc: "التصميم والتنفيذ اللذان يحولان التقنية إلى واقع", politicsDesc: "السلطة والمؤسسات والقرارات العامة", scienceDesc: "قوانين الطبيعة والبحث اليوم",
    footerStatement: "<span>سعي لا ينتهي</span><em>وراء المعرفة</em>", firstArticle: "العدد 001", topPage: "الرئيسية", home: "الرئيسية",
    contents: "المحتويات", tocKeyPoints: "النقاط الأساسية", tocGoldMarket: "سوق الذهب العالمي", tocGeology: "لماذا يوجد الذهب في اليابان", tocDecline: "لماذا تراجعت مناجم اليابان", tocOmu: "ما الذي اكتُشف في أومو", tocImpact: "الأثر الإقليمي", tocConclusion: "الخلاصة",
    settings: "إعدادات القراءة", close: "إغلاق", display: "العرض", language: "اللغة", languageNote: "في الزيارة الأولى نختار لغة المتصفح تلقائيًا.", uiScale: "حجم الموقع بالكامل", controlScale: "حجم الأزرار", articleReading: "نص المقال", articleFont: "خط النص", articleScale: "حجم نص المقال", articleBold: "استخدام خط عريض", theme: "المظهر", system: "اتباع المتصفح", light: "أبيض", dark: "داكن", mincho: "مينشو", gothic: "غوثيك", serif: "ذو زوائد", sans: "بلا زوائد", accentColor: "لون التمييز", orange: "برتقالي", blue: "أزرق", red: "أحمر", violet: "بنفسجي", green: "أخضر", yellow: "أصفر", favorites: "المفضلة", favoritesPageDeck: "يمكنك العودة في أي وقت إلى المقالات المحفوظة كمفضلة على هذا الجهاز.", noFavorites: "لا توجد مقالات مفضلة بعد.", removeFavorite: "إزالة من المفضلة", reset: "إعادة ضبط العرض", settingsOpen: "فتح إعدادات القراءة", favoriteAdd: "إضافة إلى المفضلة", favoriteRemove: "إزالة من المفضلة", loadingTranslation: "جارٍ تحميل الترجمة…", translationError: "تعذر تحميل الترجمة، لذا يُعرض المقال الياباني."
  }
};

const EXTRA_I18N = {
  ja: { readLater: "あとで読む", readLaterPageDeck: "あとで読みたい記事を、この端末に保存して一覧で確認できます。", noReadLater: "あとで読む記事はまだありません。", removeReadLater: "あとで読むから削除", readLaterAdd: "あとで読む", readLaterRemove: "あとで読むから削除", shareArticle: "この記事を共有", articleLink: "記事リンク", shareX: "Xで共有", shareEmail: "メールで共有" },
  en: { readLater: "Read later", readLaterPageDeck: "Keep articles to read later on this device and find them all here.", noReadLater: "You have no articles to read later yet.", removeReadLater: "Remove from read later", readLaterAdd: "Read later", readLaterRemove: "Remove from read later", shareArticle: "Share this article", articleLink: "Article link", shareX: "Share on X", shareEmail: "Share by email" },
  pt: { readLater: "Ler mais tarde", readLaterPageDeck: "Guarde neste dispositivo os artigos que deseja ler mais tarde.", noReadLater: "Ainda não há artigos para ler mais tarde.", removeReadLater: "Remover de ler mais tarde", readLaterAdd: "Ler mais tarde", readLaterRemove: "Remover de ler mais tarde", shareArticle: "Compartilhar este artigo", articleLink: "Link do artigo", shareX: "Compartilhar no X", shareEmail: "Compartilhar por e-mail" },
  de: { readLater: "Später lesen", readLaterPageDeck: "Speichern Sie Artikel zum späteren Lesen auf diesem Gerät.", noReadLater: "Noch keine Artikel zum späteren Lesen.", removeReadLater: "Aus Später lesen entfernen", readLaterAdd: "Später lesen", readLaterRemove: "Aus Später lesen entfernen", shareArticle: "Artikel teilen", articleLink: "Artikellink", shareX: "Auf X teilen", shareEmail: "Per E-Mail teilen" },
  "zh-CN": { readLater: "稍后阅读", readLaterPageDeck: "把想稍后阅读的文章保存在此设备上，并在这里统一查看。", noReadLater: "尚无稍后阅读的文章。", removeReadLater: "从稍后阅读中移除", readLaterAdd: "加入稍后阅读", readLaterRemove: "从稍后阅读中移除", shareArticle: "分享这篇文章", articleLink: "文章链接", shareX: "分享到X", shareEmail: "通过邮件分享" },
  ar: { readLater: "للقراءة لاحقًا", readLaterPageDeck: "احفظ المقالات التي تريد قراءتها لاحقًا على هذا الجهاز.", noReadLater: "لا توجد مقالات للقراءة لاحقًا بعد.", removeReadLater: "إزالة من القراءة لاحقًا", readLaterAdd: "إضافة للقراءة لاحقًا", readLaterRemove: "إزالة من القراءة لاحقًا", shareArticle: "مشاركة هذا المقال", articleLink: "رابط المقال", shareX: "المشاركة على X", shareEmail: "المشاركة بالبريد" }
};

Object.entries(EXTRA_I18N).forEach(([language, messages]) => Object.assign(I18N[language], messages));

const EDITION_I18N = {
  ja: { otherEditionLabel: "kizi 非工学", otherEmptyTitle: "最初の記事を、準備中です。", otherEmptyDeck: "文化・経済・政治・理学の記事は、ここから配信します。", noPublishedArticles: "公開記事はまだありません。", otherEditionTitle: "工学以外の、4つの入口。" },
  en: { otherEditionLabel: "kizi non-engineering", otherEmptyTitle: "The first article is on its way.", otherEmptyDeck: "Culture, economy, politics and science articles will be published here.", noPublishedArticles: "No articles have been published yet.", otherEditionTitle: "Four paths beyond engineering." },
  pt: { otherEditionLabel: "kizi não engenharia", otherEmptyTitle: "O primeiro artigo está sendo preparado.", otherEmptyDeck: "Artigos de cultura, economia, política e ciências serão publicados aqui.", noPublishedArticles: "Ainda não há artigos publicados.", otherEditionTitle: "Quatro entradas além da engenharia." },
  de: { otherEditionLabel: "kizi Nicht-Technik", otherEmptyTitle: "Der erste Artikel ist in Vorbereitung.", otherEmptyDeck: "Artikel zu Kultur, Wirtschaft, Politik und Naturwissenschaft erscheinen hier.", noPublishedArticles: "Noch wurden keine Artikel veröffentlicht.", otherEditionTitle: "Vier Zugänge jenseits der Technik." },
  "zh-CN": { otherEditionLabel: "kizi 非工程版", otherEmptyTitle: "首篇文章正在准备中。", otherEmptyDeck: "文化、经济、政治和理学文章将从这里发布。", noPublishedArticles: "尚无已发布的文章。", otherEditionTitle: "工程之外的四个入口。" },
  ar: { otherEditionLabel: "kizi غير الهندسي", otherEmptyTitle: "المقال الأول قيد الإعداد.", otherEmptyDeck: "سننشر هنا مقالات الثقافة والاقتصاد والسياسة والعلوم.", noPublishedArticles: "لم تُنشر مقالات بعد.", otherEditionTitle: "أربعة مداخل خارج الهندسة." }
};

Object.entries(EDITION_I18N).forEach(([language, messages]) => Object.assign(I18N[language], messages));

const FONT_STACKS = {
  mincho: '"Yu Mincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", serif',
  gothic: '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'Inter, Arial, "Helvetica Neue", sans-serif'
};

const ACCENT_PALETTES = {
  orange: { base: "#ff5c35", lightInk: "#8a240e", darkInk: "#ffc1b0" },
  blue: { base: "#4f7cff", lightInk: "#24469b", darkInk: "#c5d2ff" },
  red: { base: "#ef4444", lightInk: "#991b1b", darkInk: "#fecaca" },
  violet: { base: "#8b5cf6", lightInk: "#5b21b6", darkInk: "#ddd6fe" },
  green: { base: "#22a06b", lightInk: "#0f6b46", darkInk: "#a7e8cb" },
  yellow: { base: "#e6a700", lightInk: "#755200", darkInk: "#ffe39a" }
};

let readerDb;
let readerSettings;
let originalArticleHtml = null;
let translationRequest = 0;
let readerFallback = { settings: null, favorites: {}, readLater: {} };

function loadReaderFallback() {
  try {
    const stored = JSON.parse(localStorage.getItem("kizi-reader-fallback") || "{}");
    readerFallback = {
      ...readerFallback,
      ...stored,
      favorites: { ...readerFallback.favorites, ...(stored.favorites || {}) },
      readLater: { ...readerFallback.readLater, ...(stored.readLater || {}) }
    };
  } catch (error) {
    readerFallback = { settings: null, favorites: {}, readLater: {} };
  }
}

function saveReaderFallback() {
  localStorage.setItem("kizi-reader-fallback", JSON.stringify(readerFallback));
}

function detectReaderLanguage() {
  const requested = navigator.languages?.length ? navigator.languages : [navigator.language || "ja"];
  for (const raw of requested) {
    const code = raw.toLowerCase();
    if (code.startsWith("zh")) return "zh-CN";
    const match = SUPPORTED_LANGUAGES.find((language) => code === language.toLowerCase() || code.startsWith(`${language.toLowerCase()}-`));
    if (match) return match;
  }
  return "ja";
}

function openReaderDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(KIZI_READER_DB, KIZI_READER_VERSION);
    let abandoned = false;
    const abandon = (name, message) => {
      if (abandoned) return;
      abandoned = true;
      const error = new Error(message);
      error.name = name;
      reject(error);
    };
    const timeout = setTimeout(() => abandon("TimeoutError", "IndexedDB open timed out"), 1500);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
      if (!db.objectStoreNames.contains("favorites")) db.createObjectStore("favorites", { keyPath: "slug" });
      if (!db.objectStoreNames.contains("readLater")) db.createObjectStore("readLater", { keyPath: "slug" });
    };
    request.onblocked = () => {
      clearTimeout(timeout);
      abandon("BlockedError", "IndexedDB upgrade is blocked by another kizi tab");
    };
    request.onsuccess = () => {
      clearTimeout(timeout);
      if (abandoned) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeout);
      if (!abandoned) reject(request.error);
    };
  });
}

function dbRequest(storeName, mode, operation) {
  if (!readerDb) return Promise.resolve(undefined);
  return new Promise((resolve, reject) => {
    const transaction = readerDb.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const getSetting = () => readerDb ? dbRequest("settings", "readonly", (store) => store.get("reader")) : Promise.resolve(readerFallback.settings);
const putSettings = () => {
  if (readerDb) return dbRequest("settings", "readwrite", (store) => store.put(readerSettings));
  readerFallback.settings = { ...readerSettings };
  saveReaderFallback();
  return Promise.resolve(readerSettings);
};
const getFavorites = () => readerDb ? dbRequest("favorites", "readonly", (store) => store.getAll()) : Promise.resolve(Object.values(readerFallback.favorites));
const getFavorite = (slug) => readerDb ? dbRequest("favorites", "readonly", (store) => store.get(slug)) : Promise.resolve(readerFallback.favorites[slug]);
const putFavorite = (favorite) => {
  if (readerDb) return dbRequest("favorites", "readwrite", (store) => store.put(favorite));
  readerFallback.favorites[favorite.slug] = favorite;
  saveReaderFallback();
  return Promise.resolve(favorite);
};
const deleteFavorite = (slug) => {
  if (readerDb) return dbRequest("favorites", "readwrite", (store) => store.delete(slug));
  delete readerFallback.favorites[slug];
  saveReaderFallback();
  return Promise.resolve();
};
const getReadLaterItems = () => readerDb ? dbRequest("readLater", "readonly", (store) => store.getAll()) : Promise.resolve(Object.values(readerFallback.readLater));
const getReadLaterItem = (slug) => readerDb ? dbRequest("readLater", "readonly", (store) => store.get(slug)) : Promise.resolve(readerFallback.readLater[slug]);
const putReadLaterItem = (item) => {
  if (readerDb) return dbRequest("readLater", "readwrite", (store) => store.put(item));
  readerFallback.readLater[item.slug] = item;
  saveReaderFallback();
  return Promise.resolve(item);
};
const deleteReadLaterItem = (slug) => {
  if (readerDb) return dbRequest("readLater", "readwrite", (store) => store.delete(slug));
  delete readerFallback.readLater[slug];
  saveReaderFallback();
  return Promise.resolve();
};

function t(key) {
  return I18N[readerSettings?.language]?.[key] || I18N.ja[key] || key;
}

function applyVisualSettings() {
  const root = document.documentElement;
  root.style.setProperty("--ui-scale", readerSettings.uiScale);
  const adaptiveScale = innerWidth >= 2560 ? Math.min(1.25, innerWidth / 2560) : 1;
  const siteScale = innerWidth <= 680
    ? Math.min(1, Math.max(.9, readerSettings.uiScale))
    : readerSettings.uiScale * adaptiveScale;
  root.style.setProperty("--site-scale", String(siteScale));
  root.style.fontSize = `${16 * siteScale}px`;
  root.style.setProperty("--control-size", `${42 * readerSettings.controlScale * siteScale}px`);
  root.style.setProperty("--control-field-size", `${44 * readerSettings.controlScale * siteScale}px`);
  root.style.setProperty("--control-padding", `${16 * readerSettings.controlScale * siteScale}px`);
  const articleBase = Math.min(22, Math.max(17, 16 + innerWidth * .0012)) * 1.2;
  root.style.setProperty("--article-scale", `${articleBase * readerSettings.articleScale}px`);
  root.style.setProperty("--article-font-family", FONT_STACKS[readerSettings.articleFont] || FONT_STACKS.gothic);
  root.style.setProperty("--article-weight", readerSettings.articleBold ? "650" : "400");
  const theme = readerSettings.themeMode === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : readerSettings.themeMode;
  const palette = ACCENT_PALETTES[readerSettings.accentColor] || ACCENT_PALETTES.orange;
  root.style.setProperty("--accent", palette.base);
  root.style.setProperty("--accent-ink", theme === "dark" ? palette.darkInk : palette.lightInk);
  root.dataset.theme = theme;
  localStorage.setItem("kizi-theme-mode", readerSettings.themeMode);
}

function updateTranslatedChrome() {
  document.documentElement.lang = readerSettings.language;
  document.documentElement.dir = readerSettings.language === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
  document.querySelectorAll("[data-settings-open]").forEach((button) => button.setAttribute("aria-label", t("settingsOpen")));
  const menuButton = document.querySelector("[data-menu-toggle]");
  if (menuButton) {
    menuButton.dataset.menuOpenText = t("menu");
    menuButton.dataset.menuCloseText = t("closeMenu");
    const menuOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.querySelector("[data-menu-label]").textContent = menuOpen ? t("closeMenu") : t("menu");
    menuButton.setAttribute("aria-label", menuOpen ? t("closeMenu") : t("menu"));
  }
  document.dispatchEvent(new CustomEvent("kizi:languagechange"));
  const isArticle = Boolean(document.querySelector("[data-article-body]"));
  const isFavoritesPage = Boolean(document.querySelector("[data-favorites-page]"));
  const isReadLaterPage = Boolean(document.querySelector("[data-read-later-page]"));
  const isOtherEdition = document.body.dataset.edition === "other";
  document.title = isArticle
    ? `${t("articleTitle")} | kizi`
    : isFavoritesPage
      ? `${t("favorites")} | kizi`
      : isReadLaterPage
        ? `${t("readLater")} | kizi`
      : isOtherEdition
        ? `${t("otherEditionLabel")} | kizi`
        : `kizi — ${t("footerStatement").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = isFavoritesPage
    ? t("favoritesPageDeck")
    : isReadLaterPage
      ? t("readLaterPageDeck")
      : isOtherEdition
        ? t("otherEmptyDeck")
        : t("articleDeck");
}

function articleDataFrom(button) {
  return {
    slug: button.dataset.articleSlug,
    url: button.dataset.articleUrl,
    title: button.dataset.articleTitle || t("articleTitle"),
    date: button.dataset.articleDate,
    savedAt: new Date().toISOString()
  };
}

function escapeAttribute(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function favoriteButtonMarkup(article) {
  return `<button class="favorite-button" type="button" aria-pressed="false" data-favorite-toggle data-article-slug="${escapeAttribute(article.slug)}" data-article-url="${escapeAttribute(article.url)}" data-article-title="${escapeAttribute(article.title)}" data-article-date="${escapeAttribute(article.date)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg><span data-favorite-label>${t("favoriteAdd")}</span></button>`;
}

function ensureArticleEndActions() {
  const article = document.querySelector("[data-article-body]");
  const source = document.querySelector("[data-favorite-toggle]");
  const end = article?.querySelector(".article-end");
  if (!article || !source || !end || end.querySelector("[data-article-end-actions]")) return;
  const articleData = articleDataFrom(source);
  const absoluteUrl = document.querySelector('link[rel="canonical"]')?.href || new URL(articleData.url, location.origin).href;
  const shareText = `${t("articleTitle")} | kizi`;
  const actions = document.createElement("div");
  actions.className = "article-end-actions";
  actions.dataset.articleEndActions = "";
  actions.innerHTML = `
    <div class="share-links" aria-label="${t("shareArticle")}">
      <span>${t("shareArticle")}</span>
      <a href="${absoluteUrl}">${t("articleLink")}</a>
      <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(absoluteUrl)}&text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener" aria-label="${t("shareX")}">X</a>
      <a href="mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(absoluteUrl)}" aria-label="${t("shareEmail")}">Email</a>
    </div>
    ${favoriteButtonMarkup(articleData)}`;
  end.append(actions);
}

async function applyArticleLanguage() {
  const article = document.querySelector("[data-article-body]");
  if (!article) return;
  if (originalArticleHtml === null) originalArticleHtml = article.innerHTML;
  const requestId = ++translationRequest;
  article.setAttribute("aria-busy", "true");
  article.lang = readerSettings.language;
  if (readerSettings.language === "ja") {
    article.innerHTML = originalArticleHtml;
    article.removeAttribute("aria-busy");
    return;
  }
  try {
    const template = document.querySelector(`template[data-article-translation="${readerSettings.language}"]`);
    if (!template) throw new Error(`Missing inline translation: ${readerSettings.language}`);
    const html = template.innerHTML.trim();
    if (requestId !== translationRequest) return;
    article.innerHTML = html;
  } catch (error) {
    if (requestId !== translationRequest) return;
    article.innerHTML = `<p class="translation-status">${t("translationError")}</p>${originalArticleHtml}`;
    article.lang = "ja";
  } finally {
    if (requestId === translationRequest) article.removeAttribute("aria-busy");
  }
}

async function applyLanguage() {
  updateTranslatedChrome();
  await applyArticleLanguage();
  ensureArticleEndActions();
  await updateFavoriteState();
  await updateReadLaterState();
  await renderFavorites();
  await renderReadLater();
}

function scalePercent(value) {
  return `${Math.round(Number(value) * 100)}%`;
}

function selectOptions(items, selected) {
  return items.map(([value, label]) => `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`).join("");
}

function selectField(setting, label, options) {
  return `<label class="setting-field setting-choice"><span class="setting-label"><span>${label}</span></span><span class="setting-select-shell"><select class="setting-select" data-setting="${setting}">${options}</select><span class="setting-select-arrow" aria-hidden="true">↓</span></span></label>`;
}

function accentOptions() {
  return Object.entries(ACCENT_PALETTES).map(([value, palette]) => `
    <label class="accent-option" title="${t(value)}">
      <input type="radio" name="accent-color" data-setting="accentColor" value="${value}"${readerSettings.accentColor === value ? " checked" : ""}>
      <span class="accent-swatch" style="--swatch: ${palette.base}" aria-hidden="true"></span>
      <span class="visually-hidden">${t(value)}</span>
    </label>`).join("");
}

async function renderSavedArticles({ selector, items, removeDataset, removeLabel, emptyLabel }) {
  const containers = [...document.querySelectorAll(selector)];
  if (!containers.length) return;
  items.sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
  const currentSlug = document.querySelector("[data-article-slug]")?.dataset.articleSlug;
  const createCard = (item) => {
    const card = document.createElement("div");
    card.className = "favorite-card";
    const content = document.createElement("a");
    content.className = "favorite-card-content";
    content.href = item.url;
    const title = document.createElement("span");
    title.className = "favorite-card-title";
    title.textContent = item.slug === currentSlug ? t("articleTitle") : item.title;
    const date = document.createElement("time");
    date.dateTime = item.date || "";
    date.textContent = (item.date || "").replace(/-/g, ".");
    content.append(title, date);
    const remove = document.createElement("button");
    remove.className = "favorite-remove";
    remove.type = "button";
    remove.dataset[removeDataset] = item.slug;
    remove.setAttribute("aria-label", removeLabel);
    remove.textContent = "×";
    card.append(content, remove);
    return card;
  };
  containers.forEach((container) => {
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "favorites-empty";
      empty.textContent = emptyLabel;
      container.replaceChildren(empty);
      return;
    }
    container.replaceChildren(...items.map(createCard));
  });
}

async function renderFavorites() {
  await renderSavedArticles({
    selector: "[data-favorites-list]",
    items: (await getFavorites()) || [],
    removeDataset: "removeFavorite",
    removeLabel: t("removeFavorite"),
    emptyLabel: t("noFavorites")
  });
}

async function renderReadLater() {
  await renderSavedArticles({
    selector: "[data-read-later-list]",
    items: (await getReadLaterItems()) || [],
    removeDataset: "removeReadLater",
    removeLabel: t("removeReadLater"),
    emptyLabel: t("noReadLater")
  });
}

async function renderSettingsPanel() {
  const panel = document.querySelector("[data-settings-panel]");
  if (!panel) return;
  panel.setAttribute("aria-label", t("settings"));
  panel.innerHTML = `
    <div class="settings-header"><h2>${t("settings")}</h2><button class="icon-button" type="button" aria-label="${t("close")}" data-settings-close>×</button></div>
    <div class="settings-scroll">
      <section class="settings-section"><h3>${t("display")}</h3>
        ${selectField("language", t("language"), selectOptions(SUPPORTED_LANGUAGES.map((code) => [code, LANGUAGE_NAMES[code]]), readerSettings.language))}
        <p class="settings-note">${t("languageNote")}</p>
        <label class="setting-field"><span class="setting-label"><span>${t("uiScale")}</span><output class="setting-value" data-value-for="uiScale">${scalePercent(readerSettings.uiScale)}</output></span><input class="setting-range" data-setting="uiScale" type="range" min="0.85" max="1.2" step="0.05" value="${readerSettings.uiScale}"></label>
        <label class="setting-field"><span class="setting-label"><span>${t("controlScale")}</span><output class="setting-value" data-value-for="controlScale">${scalePercent(readerSettings.controlScale)}</output></span><input class="setting-range" data-setting="controlScale" type="range" min="0.85" max="1.3" step="0.05" value="${readerSettings.controlScale}"></label>
        ${selectField("themeMode", t("theme"), selectOptions([["system", t("system")], ["light", t("light")], ["dark", t("dark")]], readerSettings.themeMode))}
        <fieldset class="accent-field"><legend>${t("accentColor")}</legend><div class="accent-options">${accentOptions()}</div></fieldset>
      </section>
      <section class="settings-section"><h3>${t("articleReading")}</h3>
        ${selectField("articleFont", t("articleFont"), selectOptions([["gothic", t("gothic")], ["mincho", t("mincho")], ["serif", t("serif")], ["sans", t("sans")]], readerSettings.articleFont))}
        <label class="setting-field"><span class="setting-label"><span>${t("articleScale")}</span><output class="setting-value" data-value-for="articleScale">${scalePercent(readerSettings.articleScale)}</output></span><input class="setting-range" data-setting="articleScale" type="range" min="0.85" max="1.25" step="0.05" value="${readerSettings.articleScale}"></label>
        <label class="setting-check"><input data-setting="articleBold" type="checkbox"${readerSettings.articleBold ? " checked" : ""}><span>${t("articleBold")}</span></label>
      </section>
      <section class="settings-section"><h3>${t("favorites")}</h3><div class="favorites-list" data-favorites-list></div></section>
      <section class="settings-section"><h3>${t("readLater")}</h3><div class="favorites-list" data-read-later-list></div></section>
      <section class="settings-section"><button class="text-button" type="button" data-reset-settings>${t("reset")}</button></section>
    </div>`;
  await renderFavorites();
  await renderReadLater();
}

function closeSettings() {
  document.querySelector("[data-settings-backdrop]")?.classList.remove("is-open");
  const panel = document.querySelector("[data-settings-panel]");
  panel?.classList.remove("is-open");
  panel?.setAttribute("aria-hidden", "true");
}

async function openSettings() {
  await renderSettingsPanel();
  document.querySelector("[data-settings-backdrop]")?.classList.add("is-open");
  const panel = document.querySelector("[data-settings-panel]");
  panel?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  panel?.querySelector("select, button")?.focus();
}

function createSettingsShell() {
  const backdrop = document.createElement("div");
  backdrop.className = "settings-backdrop";
  backdrop.dataset.settingsBackdrop = "";
  const panel = document.createElement("aside");
  panel.className = "settings-panel";
  panel.dataset.settingsPanel = "";
  panel.setAttribute("aria-hidden", "true");
  panel.setAttribute("aria-label", t("settings"));
  document.body.append(backdrop, panel);

  document.querySelectorAll("[data-settings-open]").forEach((button) => button.addEventListener("click", openSettings));
  backdrop.addEventListener("click", closeSettings);
  panel.addEventListener("click", async (event) => {
    if (event.target.closest("[data-settings-close]")) closeSettings();
    const remove = event.target.closest("[data-remove-favorite]");
    if (remove) {
      await deleteFavorite(remove.dataset.removeFavorite);
      await renderFavorites();
      await updateFavoriteState();
    }
    const removeReadLater = event.target.closest("[data-remove-read-later]");
    if (removeReadLater) {
      await deleteReadLaterItem(removeReadLater.dataset.removeReadLater);
      await renderReadLater();
      await updateReadLaterState();
    }
    if (event.target.closest("[data-reset-settings]")) {
      readerSettings = { ...DEFAULT_READER_SETTINGS, language: detectReaderLanguage() };
      await putSettings();
      applyVisualSettings();
      await applyLanguage();
      await renderSettingsPanel();
    }
  });
  panel.addEventListener("input", async (event) => {
    const input = event.target.closest("input[data-setting]");
    if (!input || input.type !== "range") return;
    readerSettings[input.dataset.setting] = Number(input.value);
    panel.querySelector(`[data-value-for="${input.dataset.setting}"]`).textContent = scalePercent(input.value);
    applyVisualSettings();
    await putSettings();
  });
  panel.addEventListener("change", async (event) => {
    const checkbox = event.target.closest('input[type="checkbox"][data-setting]');
    if (checkbox) {
      readerSettings[checkbox.dataset.setting] = checkbox.checked;
      applyVisualSettings();
      await putSettings();
      return;
    }
    const radio = event.target.closest('input[type="radio"][data-setting]');
    if (radio) {
      readerSettings[radio.dataset.setting] = radio.value;
      applyVisualSettings();
      await putSettings();
      return;
    }
    const control = event.target.closest("select[data-setting]");
    if (!control) return;
    readerSettings[control.dataset.setting] = control.value;
    applyVisualSettings();
    await putSettings();
    if (control.dataset.setting === "language") {
      await applyLanguage();
      await renderSettingsPanel();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSettings();
  });
}

async function updateFavoriteState() {
  const favorites = (await getFavorites()) || [];
  const slugs = new Set(favorites.map((favorite) => favorite.slug));
  document.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
    const active = slugs.has(button.dataset.articleSlug);
    button.setAttribute("aria-pressed", String(active));
    const label = button.querySelector("[data-favorite-label]");
    if (label) label.textContent = active ? t("favoriteRemove") : t("favoriteAdd");
  });
  document.querySelectorAll("[data-favorite-indicator]").forEach((indicator) => indicator.classList.toggle("is-visible", slugs.has(indicator.dataset.favoriteIndicator)));
}

async function updateReadLaterState() {
  const items = (await getReadLaterItems()) || [];
  const slugs = new Set(items.map((item) => item.slug));
  document.querySelectorAll("[data-read-later-toggle]").forEach((button) => {
    const active = slugs.has(button.dataset.articleSlug);
    button.setAttribute("aria-pressed", String(active));
    const label = button.querySelector("[data-read-later-label]");
    if (label) label.textContent = active ? t("readLaterRemove") : t("readLaterAdd");
  });
}

function initSaveButtons() {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-favorite-toggle]");
    if (button) {
      const existing = await getFavorite(button.dataset.articleSlug);
      if (existing) {
        await deleteFavorite(button.dataset.articleSlug);
      } else {
        await putFavorite(articleDataFrom(button));
      }
      await updateFavoriteState();
      await renderFavorites();
      return;
    }

    const readLaterButton = event.target.closest("[data-read-later-toggle]");
    if (!readLaterButton) return;
    const existing = await getReadLaterItem(readLaterButton.dataset.articleSlug);
    if (existing) {
      await deleteReadLaterItem(readLaterButton.dataset.articleSlug);
    } else {
      await putReadLaterItem(articleDataFrom(readLaterButton));
    }
    await updateReadLaterState();
    await renderReadLater();
  });
}

function initLibraryPages() {
  const page = document.querySelector("[data-favorites-page], [data-read-later-page]");
  if (!page) return;
  page.addEventListener("click", async (event) => {
    const remove = event.target.closest("[data-remove-favorite]");
    if (remove) {
      await deleteFavorite(remove.dataset.removeFavorite);
      await renderFavorites();
      await updateFavoriteState();
      return;
    }
    const removeReadLater = event.target.closest("[data-remove-read-later]");
    if (!removeReadLater) return;
    await deleteReadLaterItem(removeReadLater.dataset.removeReadLater);
    await renderReadLater();
    await updateReadLaterState();
  });
}

function syncSystemTheme() {
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = () => {
    if (readerSettings.themeMode === "system") applyVisualSettings();
  };
  if (systemTheme.addEventListener) systemTheme.addEventListener("change", updateTheme);
  else systemTheme.addListener(updateTheme);
}

function syncAdaptiveLayout() {
  let frame;
  addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(applyVisualSettings);
  }, { passive: true });
}

async function initReader() {
  loadReaderFallback();
  try {
    readerDb = await openReaderDb();
  } catch (error) {
    if (!new Set(["BlockedError", "TimeoutError"]).has(error.name)) console.warn("kizi reader settings could not open IndexedDB", error);
  }
  const stored = await getSetting();
  readerSettings = stored ? { ...DEFAULT_READER_SETTINGS, ...stored } : {
    ...DEFAULT_READER_SETTINGS,
    language: detectReaderLanguage(),
    themeMode: localStorage.getItem("kizi-theme-mode") || "system"
  };
  if (!stored || stored.settingsSchema !== DEFAULT_READER_SETTINGS.settingsSchema) {
    readerSettings = { ...readerSettings, settingsSchema: 2, articleFont: "gothic", articleScale: 1, accentColor: readerSettings.accentColor || "orange" };
    await putSettings();
  }
  applyVisualSettings();
  createSettingsShell();
  initSaveButtons();
  initLibraryPages();
  syncSystemTheme();
  syncAdaptiveLayout();
  await applyLanguage();
}

initReader();
