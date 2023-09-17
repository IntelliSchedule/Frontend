// Background Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "content_script_ready") {
    contentScriptReady = true;
    sendMessageWhenReady();
  }
});

let scrapedData = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "storeScrapedData") {
    scrapedData = request.data;
  }
});

// Provide a way for the popup to request the data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getScrapedData") {
    sendResponse({ data: scrapedData });
  }
});

let contentScriptReady = false;

function sendMessageWhenReady() {
  console.log("sending message from background");
  if (!contentScriptReady) {
    console.log("Content script is not ready yet. Retrying in 2 seconds...");
    setTimeout(sendMessageWhenReady, 2000);
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log("querying tabs from background");
    if (!tabs.length) {
      console.log("No active tab found.");
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "scrapeData" },
      function (response) {
        if (chrome.runtime.lastError) {
          console.log("Runtime error:", chrome.runtime.lastError);
          return;
        }

        if (response && response.data) {
          console.log("Received response:", response);
        } else {
          console.log("No valid response received.");
        }
      }
    );
  });
}
