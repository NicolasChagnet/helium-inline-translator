// Chrome resolves these names from _locales using the browser UI language.
function t(key) {
  return chrome.i18n.getMessage(key) || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });

  document.documentElement.lang = chrome.i18n.getUILanguage();
}

document.addEventListener("DOMContentLoaded", async () => {
  const languages = [
    { code: "pt-BR", name: "Português (Brasil)", flag: "BR" },
    { code: "pt-PT", name: "Português (Portugal)", flag: "PT" },
    { code: "en", name: "English", flag: "US" },
    { code: "es", name: "Español", flag: "ES" },
    { code: "fr", name: "Français", flag: "FR" },
    { code: "de", name: "Deutsch", flag: "DE" },
    { code: "it", name: "Italiano", flag: "IT" },
    { code: "ja", name: "日本語", flag: "JP" },
    { code: "ko", name: "한국어", flag: "KR" },
    { code: "zh-CN", name: "中文 (简体)", flag: "CN" },
    { code: "zh-TW", name: "中文 (繁體)", flag: "TW" },
    { code: "ru", name: "Русский", flag: "RU" },
    { code: "uk", name: "Українська", flag: "UA" },
    { code: "ar", name: "العربية", flag: "SA" },
    { code: "he", name: "עברית", flag: "IL" },
    { code: "fa", name: "فارسی", flag: "IR" },
    { code: "ur", name: "اردو", flag: "PK" },
    { code: "hi", name: "हिन्दी", flag: "IN" },
    { code: "bn", name: "বাংলা", flag: "BD" },
    { code: "th", name: "ไทย", flag: "TH" },
    { code: "vi", name: "Tiếng Việt", flag: "VN" },
    { code: "id", name: "Bahasa Indonesia", flag: "ID" },
    { code: "ms", name: "Bahasa Melayu", flag: "MY" },
    { code: "tl", name: "Filipino", flag: "PH" },
    { code: "nl", name: "Nederlands", flag: "NL" },
    { code: "pl", name: "Polski", flag: "PL" },
    { code: "tr", name: "Türkçe", flag: "TR" },
    { code: "el", name: "Ελληνικά", flag: "GR" },
    { code: "cs", name: "Čeština", flag: "CZ" },
    { code: "sk", name: "Slovenčina", flag: "SK" },
    { code: "hu", name: "Magyar", flag: "HU" },
    { code: "ro", name: "Română", flag: "RO" },
    { code: "bg", name: "Български", flag: "BG" },
    { code: "hr", name: "Hrvatski", flag: "HR" },
    { code: "sv", name: "Svenska", flag: "SE" },
    { code: "da", name: "Dansk", flag: "DK" },
    { code: "nb", name: "Norsk", flag: "NO" },
    { code: "fi", name: "Suomi", flag: "FI" },
    { code: "et", name: "Eesti", flag: "EE" },
    { code: "lv", name: "Latviešu", flag: "LV" },
    { code: "lt", name: "Lietuvių", flag: "LT" },
    { code: "sl", name: "Slovenščina", flag: "SI" },
    { code: "is", name: "Íslenska", flag: "IS" },
    { code: "lb", name: "Lëtzebuergesch", flag: "LU" },
    { code: "mt", name: "Malti", flag: "MT" },
    { code: "ca", name: "Català", flag: "AD" },
    { code: "af", name: "Afrikaans", flag: "ZA" },
    { code: "ga", name: "Gaeilge", flag: "IE" },
    { code: "sr", name: "Српски", flag: "RS" },
  ];

  const FLAG_SOURCES = {
    BR: chrome.runtime.getURL("icons/flags/br.svg"),
    PT: chrome.runtime.getURL("icons/flags/pt.svg"),
    US: chrome.runtime.getURL("icons/flags/us.svg"),
    ES: chrome.runtime.getURL("icons/flags/es.svg"),
    FR: chrome.runtime.getURL("icons/flags/fr.svg"),
    DE: chrome.runtime.getURL("icons/flags/de.svg"),
    IT: chrome.runtime.getURL("icons/flags/it.svg"),
    JP: chrome.runtime.getURL("icons/flags/jp.svg"),
    KR: chrome.runtime.getURL("icons/flags/kr.svg"),
    CN: chrome.runtime.getURL("icons/flags/cn.svg"),
    TW: chrome.runtime.getURL("icons/flags/tw.svg"),
    RU: chrome.runtime.getURL("icons/flags/ru.svg"),
    UA: chrome.runtime.getURL("icons/flags/ua.svg"),
    SA: chrome.runtime.getURL("icons/flags/sa.svg"),
    IL: chrome.runtime.getURL("icons/flags/il.svg"),
    IR: chrome.runtime.getURL("icons/flags/ir.svg"),
    PK: chrome.runtime.getURL("icons/flags/pk.svg"),
    IN: chrome.runtime.getURL("icons/flags/in.svg"),
    BD: chrome.runtime.getURL("icons/flags/bd.svg"),
    TH: chrome.runtime.getURL("icons/flags/th.svg"),
    VN: chrome.runtime.getURL("icons/flags/vn.svg"),
    ID: chrome.runtime.getURL("icons/flags/id.svg"),
    MY: chrome.runtime.getURL("icons/flags/my.svg"),
    PH: chrome.runtime.getURL("icons/flags/ph.svg"),
    NL: chrome.runtime.getURL("icons/flags/nl.svg"),
    PL: chrome.runtime.getURL("icons/flags/pl.svg"),
    TR: chrome.runtime.getURL("icons/flags/tr.svg"),
    GR: chrome.runtime.getURL("icons/flags/gr.svg"),
    CZ: chrome.runtime.getURL("icons/flags/cz.svg"),
    SK: chrome.runtime.getURL("icons/flags/sk.svg"),
    HU: chrome.runtime.getURL("icons/flags/hu.svg"),
    RO: chrome.runtime.getURL("icons/flags/ro.svg"),
    BG: chrome.runtime.getURL("icons/flags/bg.svg"),
    HR: chrome.runtime.getURL("icons/flags/hr.svg"),
    SE: chrome.runtime.getURL("icons/flags/se.svg"),
    DK: chrome.runtime.getURL("icons/flags/dk.svg"),
    NO: chrome.runtime.getURL("icons/flags/no.svg"),
    FI: chrome.runtime.getURL("icons/flags/fi.svg"),
    EE: chrome.runtime.getURL("icons/flags/ee.svg"),
    LV: chrome.runtime.getURL("icons/flags/lv.svg"),
    LT: chrome.runtime.getURL("icons/flags/lt.svg"),
    SI: chrome.runtime.getURL("icons/flags/si.svg"),
    IS: chrome.runtime.getURL("icons/flags/is.svg"),
    LU: chrome.runtime.getURL("icons/flags/lu.svg"),
    MT: chrome.runtime.getURL("icons/flags/mt.svg"),
    AD: chrome.runtime.getURL("icons/flags/ad.svg"),
    ZA: chrome.runtime.getURL("icons/flags/za.svg"),
    IE: chrome.runtime.getURL("icons/flags/ie.svg"),
    RS: chrome.runtime.getURL("icons/flags/rs.svg"),
  };

  let selectedLangCode;
  let favorites;
  let isDark;
  let searchTerm = "";

  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const selectedLangBtn = document.getElementById("selectedLang");
  const dropdown = document.getElementById("dropdown");
  const langName = document.getElementById("langName");
  const langFlag = document.getElementById("langFlag");
  const searchBox = document.getElementById("searchBox");
  const favoritesSection = document.getElementById("favoritesSection");
  const favoritesList = document.getElementById("favoritesList");
  const allLanguages = document.getElementById("allLanguages");
  const shortcutSelectionKeys = document.getElementById(
    "shortcutSelectionKeys",
  );
  const shortcutPageKeys = document.getElementById("shortcutPageKeys");
  const customizeShortcuts = document.getElementById("customizeShortcuts");
  const versionLabel = document.getElementById("versionLabel");

  // --- Shortcut Display ---
  const SHORTCUTS_PAGE_URL = "chrome://extensions/shortcuts";
  const IS_MAC = /Mac/i.test(navigator.userAgent);
  const MAC_KEY_SYMBOLS = {
    Command: "⌘",
    MacCtrl: "⌃",
    Ctrl: "⌃",
    Alt: "⌥",
    Option: "⌥",
    Shift: "⇧",
  };

  // Shortcuts are user-editable, so read the current binding from Chrome
  // instead of hardcoding it in the popup markup.
  function formatShortcut(shortcut) {
    if (!shortcut) {
      return "—";
    }

    const parts = shortcut.split("+");
    if (!IS_MAC) {
      return parts.join(" + ");
    }
    return parts
      .map((part) => {
        if (MAC_KEY_SYMBOLS[part]) {
          return MAC_KEY_SYMBOLS[part];
        }
        return part.length === 1 ? part.toUpperCase() : part;
      })
      .join("");
  }

  async function renderShortcuts() {
    const commands = await chrome.commands.getAll();
    const shortcutOf = (name) =>
      commands.find((command) => command.name === name)?.shortcut || "";

    shortcutSelectionKeys.textContent = formatShortcut(
      shortcutOf("translate-selection"),
    );
    shortcutPageKeys.textContent = formatShortcut(shortcutOf("translate-page"));
  }

  // Chrome refuses to open chrome:// pages from extension code, so hand the
  // address to the user on the clipboard instead.
  async function copyShortcutsPageUrl() {
    try {
      await navigator.clipboard.writeText(SHORTCUTS_PAGE_URL);
      customizeShortcuts.textContent = "✓";
    } catch (error) {
      console.error("Could not copy the shortcuts page address.", error);
      return;
    }

    setTimeout(() => {
      customizeShortcuts.textContent = "⚙";
    }, 1500);
  }

  // --- Preference Management ---
  async function savePreferences() {
    // Map UI codes to Google Translate API codes
    const langCodeMap = {
      "pt-BR": "pt",
      "pt-PT": "pt",
      "zh-CN": "zh-CN",
      "zh-TW": "zh-TW",
      nb: "no", // Google Translate uses 'no' for Norwegian
      // Note: 'tl' works fine for Filipino in the free API (fil also works)
    };

    const targetLang = langCodeMap[selectedLangCode] || selectedLangCode;

    const prefs = {
      theme: isDark ? "dark" : "light",
      favoriteLangs: favorites,
      targetLanguage: targetLang,
    };
    await chrome.storage.sync.set(prefs);
  }

  // The browser UI language picks both the popup strings and the default
  // translation target.
  function defaultTargetLanguage() {
    const uiLanguage = chrome.i18n.getUILanguage();
    const exact = languages.find((lang) => lang.code === uiLanguage);
    if (exact) {
      return exact.code;
    }

    const base = uiLanguage.split("-")[0];
    const mapped = { pt: "pt-BR", zh: "zh-CN", no: "nb" }[base] || base;
    return languages.some((lang) => lang.code === mapped) ? mapped : "en";
  }

  async function loadPreferences() {
    // Detect system theme
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const data = await chrome.storage.sync.get({
      theme: systemPrefersDark ? "dark" : "light",
      favoriteLangs: ["en", "es"],
      targetLanguage: defaultTargetLanguage(),
    });

    isDark = data.theme === "dark";
    favorites = data.favoriteLangs;

    // Map stored language codes back to UI codes
    const storedToUIMap = {
      pt: "pt-BR",
      no: "nb",
    };

    let targetLang = data.targetLanguage;
    if (storedToUIMap[targetLang]) {
      targetLang = storedToUIMap[targetLang];
    }

    const matchingLang =
      languages.find((l) => l.code === targetLang) ||
      languages.find((l) => l.code.startsWith(targetLang)) ||
      languages[0];
    selectedLangCode = matchingLang.code;

    updateUIForPreferences();
    applyTranslations();
  }

  function updateUIForPreferences() {
    body.className = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀️" : "🌙";

    const lang = languages.find((l) => l.code === selectedLangCode);
    if (lang) {
      setFlagContent(langFlag, lang.flag);
      langName.textContent = lang.name;
    }
  }

  // --- UI Logic ---
  function toggleTheme() {
    isDark = !isDark;
    body.className = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    savePreferences();
  }

  async function toggleFavorite(code) {
    const index = favorites.indexOf(code);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(code);
    }
    await savePreferences();
    renderLanguages();
  }

  async function selectLanguage(code) {
    selectedLangCode = code;
    const lang = languages.find((l) => l.code === code);
    setFlagContent(langFlag, lang.flag);
    langName.textContent = lang.name;
    dropdown.classList.remove("active");
    searchBox.value = "";
    searchTerm = "";
    await savePreferences();
    renderLanguages();
  }

  function renderLanguages() {
    favoritesList.innerHTML = "";
    allLanguages.innerHTML = "";

    const filtered = languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const favLangs = filtered.filter((lang) =>
      favorites.includes(lang.code.split("-")[0]),
    );

    if (favLangs.length > 0 && !searchTerm) {
      favoritesSection.style.display = "block";
      favLangs.forEach((lang) => {
        favoritesList.appendChild(createLanguageOption(lang));
      });
    } else {
      favoritesSection.style.display = "none";
    }

    filtered.forEach((lang) => {
      allLanguages.appendChild(createLanguageOption(lang));
    });
  }

  function createLanguageOption(lang) {
    const option = document.createElement("div");
    option.className =
      "language-option" + (lang.code === selectedLangCode ? " selected" : "");

    const leftContent = document.createElement("div");
    leftContent.className = "left-content";

    const flag = document.createElement("span");
    flag.className = "flag";
    setFlagContent(flag, lang.flag);

    const name = document.createElement("span");
    name.textContent = lang.name;

    leftContent.appendChild(flag);
    leftContent.appendChild(name);

    const star = document.createElement("div");
    star.className =
      "star" + (favorites.includes(lang.code.split("-")[0]) ? " active" : "");
    star.textContent = "♥";
    star.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(lang.code.split("-")[0]);
    });

    option.appendChild(leftContent);
    option.appendChild(star);

    option.addEventListener("click", () => selectLanguage(lang.code));

    return option;
  }

  // --- Event Listeners ---
  themeToggle.addEventListener("click", toggleTheme);
  customizeShortcuts.addEventListener("click", copyShortcutsPageUrl);

  selectedLangBtn.addEventListener("click", () => {
    dropdown.classList.toggle("active");
    if (dropdown.classList.contains("active")) {
      setTimeout(() => searchBox.focus(), 100);
    }
  });

  searchBox.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderLanguages();
  });

  searchBox.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".language-selector")) {
      dropdown.classList.remove("active");
    }
  });

  // --- Initial Load ---
  versionLabel.textContent = `v${chrome.runtime.getManifest().version}`;
  await loadPreferences();
  renderLanguages();
  await renderShortcuts();

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      isDark = e.matches;
      updateUIForPreferences();
      savePreferences();
    });

  function getFlagAsset(code) {
    if (!code) return undefined;
    return FLAG_SOURCES[code.toUpperCase()];
  }

  function setFlagContent(element, countryCode) {
    if (!element) return;
    element.innerHTML = "";
    element.classList.remove("has-image");

    const assetPath = getFlagAsset(countryCode);
    if (!assetPath) {
      element.textContent = countryCode || "";
      return;
    }

    // The flag is decorative; the language name sits next to it.
    element.classList.add("has-image");
    const img = document.createElement("img");
    img.src = assetPath;
    img.alt = "";
    img.width = 36;
    img.height = 36;
    img.decoding = "async";
    img.loading = "lazy";
    element.appendChild(img);
  }
});
