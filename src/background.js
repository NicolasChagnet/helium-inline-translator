// src/background.js

const BADGE_TIMEOUT_MS = 4000;
const badgeTimers = new Map();

const CONTEXT_MENUS = [
  {
    id: "translate-page",
    messageKey: "contextMenuTranslatePage",
    contexts: ["page"],
  },
  {
    id: "translate-selection",
    messageKey: "contextMenuTranslateSelection",
    contexts: ["selection"],
  },
];

// Both the context menus and the keyboard commands share these ids.
const COMMAND_ACTIONS = {
  "translate-page": "translate-full-page",
  "translate-selection": "translate-selection",
};

function getMessage(key, fallback) {
  return chrome.i18n.getMessage(key) || fallback;
}

function setBadgeState(state, tabId) {
  const key = typeof tabId === "number" ? tabId : "global";
  if (badgeTimers.has(key)) {
    clearTimeout(badgeTimers.get(key));
    badgeTimers.delete(key);
  }

  const target = typeof tabId === "number" ? { tabId } : {};

  if (state === "success") {
    chrome.action.setBadgeText({ text: "✓", ...target });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e", ...target });
  } else if (state === "error") {
    chrome.action.setBadgeText({ text: "!", ...target });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444", ...target });
  } else {
    chrome.action.setBadgeText({ text: "", ...target });
    return;
  }

  const timeoutId = setTimeout(() => {
    chrome.action.setBadgeText({ text: "", ...target });
    badgeTimers.delete(key);
  }, BADGE_TIMEOUT_MS);
  badgeTimers.set(key, timeoutId);
}

// Context menu titles follow the browser UI language, because chrome.i18n reads
// the same locale that picks the _locales/<lang> folder.
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    for (const { id, messageKey, contexts } of CONTEXT_MENUS) {
      chrome.contextMenus.create({
        id,
        title: getMessage(messageKey, "Translate"),
        contexts,
      });
    }
  });
}

function translateInTab(tabId, action) {
  return chrome.tabs.sendMessage(tabId, { action }).catch(() => {
    // No content script here: chrome:// pages, the Web Store, or a PDF viewer.
    setBadgeState("error", tabId);
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  setupContextMenus();

  if (details.reason !== "install") {
    return;
  }

  chrome.i18n.getAcceptLanguages((languages) => {
    const primaryLang = languages?.[0]?.split("-")[0];
    chrome.storage.sync.set({ targetLanguage: primaryLang || "en" });
  });
});

chrome.runtime.onStartup.addListener(setupContextMenus);

const RETRY_LIMIT = 3;
const RETRY_BASE_DELAY_MS = 600;
const RETRY_MAX_DELAY_MS = 4000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelay(attempt) {
  const delay = Math.min(
    RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
    RETRY_MAX_DELAY_MS
  );
  return delay + Math.random() * 200;
}

async function requestTranslation(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(
      `Translation service responded with ${response.status}`
    );
    // 4xx errors other than rate limiting will not resolve on a retry.
    error.retryable = response.status === 429 || response.status >= 500;
    throw error;
  }

  const data = await response.json();
  if (!data?.[0]?.[0]?.[0]) {
    throw new Error("Invalid translation response format");
  }
  return data[0].map((segment) => segment[0]).join("");
}

async function translateText(text) {
  const { targetLanguage } = await chrome.storage.sync.get("targetLanguage");
  const targetLang = targetLanguage || "en";

  for (let attempt = 1; ; attempt++) {
    try {
      const translatedText = await requestTranslation(text, targetLang);
      return { success: true, translatedText };
    } catch (error) {
      const canRetry = error.retryable !== false && attempt < RETRY_LIMIT;
      if (!canRetry) {
        console.error(`Translation failed after ${attempt} attempt(s):`, error);
        return { success: false, translatedText: "" };
      }
      await sleep(retryDelay(attempt));
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reportTranslationFailure") {
    // Some batches never succeeded, so the last badge state is misleading.
    setBadgeState("error", sender?.tab?.id);
    return;
  }

  if (request.action !== "getTranslation") {
    return;
  }

  translateText(request.text)
    .then((result) => {
      setBadgeState(result.success ? "success" : "error", sender?.tab?.id);
      sendResponse(result);
    })
    .catch((error) => {
      console.error("Message handler error:", error);
      setBadgeState("error", sender?.tab?.id);
      sendResponse({ success: false, translatedText: "" });
    });
  return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const action = COMMAND_ACTIONS[info.menuItemId];
  if (action && typeof tab?.id === "number") {
    translateInTab(tab.id, action);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const action = COMMAND_ACTIONS[command];
  if (!action) {
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (typeof tab?.id === "number") {
    await translateInTab(tab.id, action);
  }
});
