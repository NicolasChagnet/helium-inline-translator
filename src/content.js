// src/content.js
console.log("Helium Inline Translator: Content script v8 loaded and active!");

const TRANSLATION_SEPARATOR = "\n|||HTSEP|||\n";
const TRANSLATION_SEPARATOR_ALT = "\n\n[-HTS-]\n\n";
const TRANSLATION_SEPARATOR_SR = "\n\n[---]\n\n";

// Languages that need alternative separator (separator gets transliterated)
const ALT_SEPARATOR_LANGS = ["ru", "uk", "bg", "ga"];
// Serbian and Urdu need their own separator (even [-HTS-] gets modified)
const SR_SEPARATOR_LANGS = ["sr", "ur"];

// Global state for full-page translation
let pageOriginals = new Map();
let isPageTranslated = false;
let isPageTranslating = false;

// Global state for selection translation
let selectionOriginals = new Map();
let lastTranslatedNodes = [];
let isSelectionTranslated = false;
let isSelectionTranslating = false;

const translationCache = new Map();
let currentTargetLanguage = "en";

function getTargetLanguageFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ targetLanguage: "en" }, (data) => {
      resolve(data.targetLanguage || "en");
    });
  });
}

// Main listener for commands from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate-selection") {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      handleSelectionTranslation();
    } else if (isSelectionTranslated) {
      revertSelectionTranslation();
    }
  } else if (request.action === "translate-full-page") {
    if (isPageTranslating) {
      return;
    }
    if (isPageTranslated) {
      console.log(
        "Helium Inline Translator: Page is already translated. Reverting now.",
      );
      revertPageTranslation();
    } else {
      handleFullPageTranslation();
    }
  } else if (request.action === "revert-translation") {
    revertPageTranslation();
  }
  // Nothing is sent back; returning true would keep the message channel open.
});

// Handles translating the current user selection
async function handleSelectionTranslation() {
  if (isSelectionTranslating) {
    return;
  }

  // Restore a previous selection translation first, so the new one is
  // translated from the original text.
  if (isSelectionTranslated) {
    revertSelectionTranslation();
  }

  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || selection.isCollapsed) {
    return;
  }

  isSelectionTranslating = true;
  try {
    currentTargetLanguage = await getTargetLanguageFromStorage();
    const separator = SR_SEPARATOR_LANGS.includes(currentTargetLanguage)
      ? TRANSLATION_SEPARATOR_SR
      : ALT_SEPARATOR_LANGS.includes(currentTargetLanguage)
        ? TRANSLATION_SEPARATOR_ALT
        : TRANSLATION_SEPARATOR;

    const textNodes = collectTextNodesFromRange(selection.getRangeAt(0));
    if (!textNodes.length) {
      return;
    }

    const joinedText = textNodes.map((node) => node.nodeValue).join(separator);

    let response;
    try {
      response = await chrome.runtime.sendMessage({
        action: "getTranslation",
        text: joinedText,
      });
    } catch (error) {
      console.error(
        "Helium Inline Translator: Failed to translate selection.",
        error,
      );
      return;
    }

    if (
      !response ||
      !response.success ||
      typeof response.translatedText !== "string"
    ) {
      console.error(
        "Helium Inline Translator: Invalid selection translation response.",
        response,
      );
      return;
    }

    const translatedTexts = response.translatedText.split(separator);
    if (translatedTexts.length !== textNodes.length) {
      console.error("Helium Inline Translator: Selection translation mismatch.", {
        expected: textNodes.length,
        received: translatedTexts.length,
      });
      return;
    }

    textNodes.forEach((node, index) => {
      if (node.isConnected) {
        selectionOriginals.set(node, node.nodeValue);
        node.nodeValue = translatedTexts[index];
      }
    });

    lastTranslatedNodes = textNodes;
    isSelectionTranslated = true;
    selection.removeAllRanges();
  } finally {
    isSelectionTranslating = false;
  }
}

// Reverts the last selection translation
function revertSelectionTranslation() {
  console.log("Helium Inline Translator: Reverting selection translation.");
  for (const node of lastTranslatedNodes) {
    if (node.isConnected && selectionOriginals.has(node)) {
      node.nodeValue = selectionOriginals.get(node);
    }
  }
  selectionOriginals.clear();
  lastTranslatedNodes = [];
  isSelectionTranslated = false;
}

function collectTextNodesFromRange(range) {
  if (!range) {
    console.log(
      "Helium Inline Translator: No range provided to collectTextNodesFromRange",
    );
    return [];
  }

  const textNodes = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null,
  );

  const rootNode = walker.currentNode;
  if (
    rootNode &&
    rootNode.nodeType === Node.TEXT_NODE &&
    rootNode.nodeValue.trim() &&
    range.intersectsNode(rootNode)
  ) {
    textNodes.push(rootNode);
  }

  let node;
  while ((node = walker.nextNode())) {
    if (range.intersectsNode(node) && node.nodeValue.trim()) {
      textNodes.push(node);
    }
  }

  console.log(
    `Helium Inline Translator: collectTextNodesFromRange found ${textNodes.length} nodes`,
  );
  return textNodes;
}

// Handles translating all text nodes on the page
async function handleFullPageTranslation() {
  if (isPageTranslating) {
    return;
  }

  console.log(
    "Helium Inline Translator: Starting full page translation with batching.",
  );
  isPageTranslating = true;
  isPageTranslated = true;
  currentTargetLanguage = await getTargetLanguageFromStorage();

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (
          node.parentElement.closest(
            'script, style, textarea, [contenteditable="true"]',
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.nodeValue.trim() === "") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const nodesToTranslate = [];
  try {
    while (walker.nextNode()) {
      nodesToTranslate.push(walker.currentNode);
    }

    for (const node of nodesToTranslate) {
      if (!pageOriginals.has(node)) {
        pageOriginals.set(node, node.nodeValue);
      }
    }

    const failedBatches = await translateNodesInBatches(nodesToTranslate);
    if (failedBatches > 0) {
      // A green badge would hide the untranslated parts of the page.
      chrome.runtime
        .sendMessage({ action: "reportTranslationFailure" })
        .catch(() => {});
    }
  } finally {
    isPageTranslating = false;
  }

  console.log(
    `Helium Inline Translator: Finished. Translated ${pageOriginals.size} text nodes.`,
  );
}

async function translateNodesInBatches(nodes) {
  const BATCH_CHAR_LIMIT = 4500;
  const MAX_PARALLEL_REQUESTS = 3;

  const batches = [];
  let currentBatch = [];
  let currentCount = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeText = pageOriginals.get(node) || "";

    if (
      currentBatch.length > 0 &&
      currentCount + nodeText.length > BATCH_CHAR_LIMIT
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentCount = 0;
    }

    currentBatch.push(node);
    currentCount += nodeText.length;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  const queue = batches.slice();
  const running = [];
  let failedBatches = 0;

  while (queue.length > 0 || running.length > 0) {
    while (queue.length > 0 && running.length < MAX_PARALLEL_REQUESTS) {
      const batch = queue.shift();
      const promise = processBatch(batch).finally(() => {
        const index = running.indexOf(promise);
        if (index !== -1) {
          running.splice(index, 1);
        }
      });
      running.push(promise);
    }

    if (running.length > 0) {
      await Promise.race(running);
    }
  }

  return failedBatches;

  async function processBatch(nodeBatch) {
    if (!nodeBatch || nodeBatch.length === 0) {
      return;
    }

    const originalTexts = nodeBatch.map((n) => pageOriginals.get(n) || "");
    const cacheKeys = originalTexts.map(
      (text) => `${currentTargetLanguage}|${text}`,
    );
    const results = new Array(nodeBatch.length).fill(undefined);

    const textsToTranslate = [];
    const translationIndices = [];

    for (let i = 0; i < nodeBatch.length; i++) {
      const cachedValue = translationCache.get(cacheKeys[i]);
      if (cachedValue !== undefined) {
        results[i] = cachedValue;
      } else {
        textsToTranslate.push(originalTexts[i]);
        translationIndices.push(i);
      }
    }

    if (textsToTranslate.length > 0) {
      // Use alternative separator for languages that transliterate the main separator
      const separator = SR_SEPARATOR_LANGS.includes(currentTargetLanguage)
        ? TRANSLATION_SEPARATOR_SR
        : ALT_SEPARATOR_LANGS.includes(currentTargetLanguage)
          ? TRANSLATION_SEPARATOR_ALT
          : TRANSLATION_SEPARATOR;

      const joinedText = textsToTranslate.join(separator);

      try {
        const response = await chrome.runtime.sendMessage({
          action: "getTranslation",
          text: joinedText,
        });

        if (!response?.success) {
          throw new Error("Translation request failed");
        }

        const translatedTexts = response.translatedText.split(separator);

        if (translatedTexts.length === textsToTranslate.length) {
          translationIndices.forEach((batchIndex, resultIndex) => {
            const translatedText = translatedTexts[resultIndex];
            results[batchIndex] = translatedText;
            translationCache.set(cacheKeys[batchIndex], translatedText);
          });
        } else {
          failedBatches++;
          console.error(
            "Helium Inline Translator: Batch translation mismatch.",
            {
              originalCount: textsToTranslate.length,
              translatedCount: translatedTexts.length,
            },
          );
        }
      } catch (e) {
        failedBatches++;
        console.error(
          "Helium Inline Translator: Failed to process a batch.",
          e,
        );
      }
    }

    for (let i = 0; i < nodeBatch.length; i++) {
      const nodeToUpdate = nodeBatch[i];
      if (results[i] !== undefined && nodeToUpdate.isConnected) {
        nodeToUpdate.nodeValue = results[i];
      }
    }
  }
}

// Reverts the full page translation
function revertPageTranslation() {
  console.log("Helium Inline Translator: Reverting page translation.");
  for (const [node, originalText] of pageOriginals.entries()) {
    if (node.isConnected) {
      node.nodeValue = originalText;
    }
  }
  pageOriginals.clear();
  isPageTranslated = false;
}
