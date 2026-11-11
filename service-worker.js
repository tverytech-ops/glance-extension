/* Glance MV3 service worker. CSP is intentionally never modified.
 * Session rules are scoped to the previewing tab and destination host.
 */
const RULE_BASE = 71000;
const MENU_ID = "glance-preview-link";
const DEFAULTS = { altClick: true, hoverAlt: false, modifierKey: "alt", middleClick: false, contextMenu: true, frameStripping: false, modalWidth: 88, modalHeight: 88 };

async function getSettings() {
  return { ...DEFAULTS, ...await chrome.storage.sync.get(DEFAULTS) };
}
function ruleIdForTab(tabId) {
  return Number.isInteger(tabId) && tabId >= 0 && tabId < 2_147_400_000 ? RULE_BASE + tabId + 1 : null;
}
async function clearRuleForTab(tabId) {
  const id = ruleIdForTab(tabId);
  if (id === null) return;
  try { await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [id] }); }
  catch (error) { console.warn("[Glance] Rule cleanup failed:", error); }
}
async function setRuleForTab(hostname, tabId) {
  const id = ruleIdForTab(tabId);
  if (id === null) return;
  await clearRuleForTab(tabId);
  const prefs = await getSettings();
  if (!prefs.frameStripping || !hostname) return;
  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id],
      addRules: [{
        id, priority: 1,
        action: { type: "modifyHeaders", responseHeaders: [{ header: "x-frame-options", operation: "remove" }] },
        condition: { requestDomains: [hostname], resourceTypes: ["sub_frame"], tabIds: [tabId] }
      }]
    });
  } catch (error) {
    console.warn("[Glance] Temporary X-Frame-Options rule unavailable:", error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  if (message?.type === "GLANCE_PREVIEW_START") {
    let hostname = "";
    try {
      const url = new URL(message.url);
      if (url.protocol === "http:" || url.protocol === "https:") hostname = url.hostname;
    } catch (_) {}
    setRuleForTab(hostname, tabId).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (message?.type === "GLANCE_PREVIEW_END") {
    clearRuleForTab(tabId).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.frameId === 0) {
    chrome.tabs.sendMessage(details.tabId, { type: "GLANCE_PARENT_NAVIGATION" }).catch(() => {});
  }
});
chrome.webNavigation.onReferenceFragmentUpdated.addListener(details => {
  if (details.frameId === 0) {
    chrome.tabs.sendMessage(details.tabId, { type: "GLANCE_PARENT_NAVIGATION" }).catch(() => {});
  }
});
chrome.tabs.onRemoved.addListener(tabId => clearRuleForTab(tabId));

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(null);
  await chrome.storage.sync.set({ ...DEFAULTS, ...stored });
  await chrome.contextMenus.removeAll();
  if ((await getSettings()).contextMenu) {
    chrome.contextMenus.create({ id: MENU_ID, title: "Preview link with Glance", contexts: ["link"] });
  }
});
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync" || !changes.contextMenu) return;
  await chrome.contextMenus.removeAll();
  if (changes.contextMenu.newValue) {
    chrome.contextMenus.create({ id: MENU_ID, title: "Preview link with Glance", contexts: ["link"] });
  }
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID && info.linkUrl && tab?.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { type: "GLANCE_OPEN", url: info.linkUrl }).catch(() => {});
  }
});
