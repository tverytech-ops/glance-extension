chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            { header: "x-frame-options", operation: "remove" },
            { header: "content-security-policy", operation: "remove" },
            { header: "x-content-type-options", operation: "remove" }
          ]
        },
        condition: {
          urlFilter: "*",
          resourceTypes: ["sub_frame", "xmlhttprequest", "main_frame"]
        }
      }
    ]
  });
});