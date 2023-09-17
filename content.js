function scrapeData() {
  console.log("Starting to scrape data");
  const scrapedData = [];

  // Get the table body
  const tbody = document.querySelector(".ps_grid-body");

  if (tbody) {
    // Iterate through each row in the table body
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((row, index) => {
      let parsedInfo = {};

      const instructorElement = row.querySelector("[id*='INSTR_LONG']"); // Using a wildcard
      if (instructorElement) {
        const instructors = instructorElement.textContent
          .trim()
          .split(",")
          .map((name) => name.trim());

        if (instructors.length > 0) {
          const [firstName, lastName] = instructors[0].split(" ");
          parsedInfo.instructor = {
            name: firstName.toLowerCase() + " " + lastName.toLowerCase(),
          };
        }
      }

      scrapedData.push(parsedInfo);
      chrome.runtime.sendMessage({
        action: "storeScrapedData",
        data: scrapedData,
      });
    });
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeData") {
    sendResponse({ data: scrapeData() });
  }
});

// Initialize a MutationObserver
const observer = new MutationObserver((mutationsList, observer) => {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      const element = document.querySelector("tbody.ps_grid-body");
      if (element) {
        console.log("Element is now in the DOM");
        scrapeData();
        observer.disconnect(); // Stop observing once the element is found
      }
    }
  }
});

// Configuration for the observer
const config = { attributes: false, childList: true, subtree: true };

// Start observing the entire body of the document
observer.observe(document.body, config);

// Notify background script that content script has loaded
chrome.runtime.sendMessage({ message: "content_script_ready" });
