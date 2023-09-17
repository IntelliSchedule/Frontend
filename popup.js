document.addEventListener("DOMContentLoaded", () => {
  const findButton = document.getElementById("findButton");
  const mainContainer = document.getElementById("mainContainer");

  findButton.addEventListener("click", function () {
    console.log("Find button clicked.");

    // Start with the UI changes
    this.classList.add("loading");

    // Message content script to get saved scraped data
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log("Querying active tab for messaging content script.");

      chrome.runtime.sendMessage(
        { action: "getScrapedData" },
        function (response) {
          console.log("Received response from content script:", response);
          if (response && response.data) {
            console.log(
              "Received scraped data from content script:",
              response.data
            );

            const professorNames = response.data.map(({ instructor }) => {
              return instructor.name;
            });

            // Create the payload
            const payload = {
              professorNames: professorNames,
            };

            fetch(
              "https://4695-131-94-186-10.ngrok-free.app/queryProfessorResults",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            )
              .then((res) => res.json()) // Parse the JSON response
              .then((data) => {
                console.log("API response:", data);
                // Stop the loading animation
                findButton.classList.remove("loading");
                document.body.classList.add("expanded");
                mainContainer.style.display = "flex";
                findButton.style.display = "none"; // Hide the findButton
                // Create and append your cards here, based on API response
                const parentContainer =
                  document.getElementById("mainContainer");
                const limitedEntries = Object.entries(
                  data.professorInformationList
                ).slice(0, 3);
                // Loop through each response and create a card
                limitedEntries.forEach(([professorName, info]) => {
                  // Create child container
                  const childContainer = document.createElement("div");
                  childContainer.className = "child-container";

                  // Create left side of the card
                  const cardLeft = document.createElement("div");
                  cardLeft.className = "card_left";

                  // Create titles
                  const cardTitles = document.createElement("div");
                  cardTitles.className = "card_titles";

                  ["Overall", "Difficulty", "Take Again"].forEach((title) => {
                    const cardTitle = document.createElement("div");
                    cardTitle.className = "card_title";
                    cardTitle.innerText = title;
                    cardTitles.appendChild(cardTitle);
                  });

                  // Create ratings
                  const cardRatings = document.createElement("div");
                  cardRatings.className = "card_ratings";

                  [info.avgRating, info.avgDifficulty, info.sentiment].forEach(
                    (rating) => {
                      const cardRating = document.createElement("div");
                      cardRating.className = "card_rating";
                      cardRating.innerText = rating;
                      cardRatings.appendChild(cardRating);
                    }
                  );

                  // Create bottom section
                  const cardBottom = document.createElement("div");
                  cardBottom.className = "card_bottom";

                  const cardName = document.createElement("div");
                  cardName.className = "card_name";
                  cardName.innerText = professorName;

                  const cardCart = document.createElement("img");
                  cardCart.className = "card_cart";
                  cardCart.src = "./cart.png";
                  cardCart.alt = "shopping cart";

                  cardBottom.appendChild(cardName);
                  cardBottom.appendChild(cardCart);

                  // Append everything to cardLeft
                  cardLeft.appendChild(cardTitles);
                  cardLeft.appendChild(cardRatings);
                  cardLeft.appendChild(cardBottom);

                  // Create right side of the card
                  const cardRight = document.createElement("div");
                  cardRight.className = "card_right";

                  const arrow = document.createElement("img");
                  arrow.className = "arrow";
                  arrow.src = "./arrow.png";
                  arrow.alt = "drop down arrow";

                  cardRight.appendChild(arrow);

                  // Append both sides to the child container
                  childContainer.appendChild(cardLeft);
                  childContainer.appendChild(cardRight);

                  // Append child container to the parent container
                  parentContainer.appendChild(childContainer);

                  // Event listener for the arrow
                  arrow.addEventListener("click", function () {
                    // Hide all other cards
                    document
                      .querySelectorAll(".child-container")
                      .forEach((container) => {
                        container.style.display = "none";
                      });

                    // Show only the clicked card
                    childContainer.style.display = "flex";

                    // Create and display summary card if it doesn't already exist
                    if (!document.getElementById("summary")) {
                      const summaryCard = document.createElement("div");
                      summaryCard.id = "summary";
                      summaryCard.innerText = info.summary; // Replace with actual summary

                      const closeButton = document.createElement("button");
                      closeButton.innerText = "X";
                      closeButton.addEventListener("click", function () {
                        // Remove summary card
                        summaryCard.remove();

                        // Show all cards
                        document
                          .querySelectorAll(".child-container")
                          .forEach((container) => {
                            container.style.display = "flex";
                          });
                      });

                      summaryCard.appendChild(closeButton);
                      // Insert the summary card below the clicked card
                      parentContainer.insertBefore(
                        summaryCard,
                        childContainer.nextSibling
                      );
                    }
                  });
                });
              })
              .catch((error) => {
                console.log("API call failed:", error);
                // Stop the loading animation
                findButton.classList.remove("loading");
                document.body.classList.add("expanded");
                mainContainer.style.display = "flex";
                findButton.style.display = "none"; // Hide the findButton
              });
          } else {
            console.log("No valid response received from content script.");
          }
        }
      );
    });
  });

  let boxes = document.querySelectorAll(".child-container");
  boxes.forEach((box) => {
    box.addEventListener("click", function () {
      console.log("Card clicked.");

      boxes.forEach((innerBox) => {
        if (innerBox !== this) {
          innerBox.style.display = "none";
        } else {
          innerBox.classList.add("expanded");
        }
      });
    });
  });
});
