let selectedCard = null; // Track the currently selected card
// let playedCard = null; // Track the currently played card

// Function to make cards clickable (Modified)
function makeCardsClickable() {
  const cards = document.querySelectorAll("#human-player-hand .card-icon");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // Remove the 'selected' class from all cards
      cards.forEach((c) => c.classList.remove("selected"));

      // Add the 'selected' class to the clicked card
      card.classList.add("selected");
      selectedCard = card.textContent; // Store the selected card
      console.log("Selected Card:", selectedCard);
    });
  });
}

// Function to draw a card (Modified)
async function drawCard() {
  try {
    showLoader();
    const response = await fetch("/draw_card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ player_name: "Human Player" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to draw card");
    }

    const data = await response.json();

    // Refresh the game state to reflect the new card in the hand
    await fetchGameState();
    makeCardsClickable(); // Re-attach click listeners
  } catch (error) {
    console.error("Error drawing card:", error);
    alert(error.message); // Show an error message to the user
  } finally {
    hideLoader();
  }
}

// Function to play a specific card (Modified)
async function playCard() {
  try {
    showLoader();

    // Check if a card is selected
    if (!selectedCard) {
      alert("Please select a card to play!");
      return;
    }

    const response = await fetch("/play_card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_name: "Human Player",
        card: selectedCard,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to play card");
    }

    const data = await response.json();
    logRecentAction(`Played Card: ${selectedCard}`);

    playedCard = selectedCard; // Update the playedCard variable
    updatePlayedCard(playedCard); // Update the played card section

    // Reset selected card to null to ensure no card is pre-selected after a play
    selectedCard = null;
    const cards = document.querySelectorAll("#human-player-hand .card-icon");
    cards.forEach((c) => c.classList.remove("selected"));

    await fetchGameState(); // Refresh to remove the played card
  } catch (error) {
    console.error("Error playing card:", error);
    alert(error.message);
  } finally {
    hideLoader();
  }
}

// Function to update the Played Card display (Modified)
function updatePlayedCard(card) {
  const playedCardElement = document.getElementById("played-card");
  if (playedCardElement) {
    if (card) {
      const parts = card.split(" "); // Assuming format is "Rank Suit"
      const rank = parts[0];
      const suit = parts[parts.length - 1];

      playedCardElement.innerHTML = `
                <div class="card-icon">
                    <span class="rank">${rank}</span>
                    <span class="suit">${suit}</span>
                </div>
            `;
    } else {
      playedCardElement.innerHTML = `<p>No card played yet.</p>`; // Clear message
    }
  }
}

// (Existing functions like fetchGameState, updateHumanPlayerHand, etc. remain mostly the same)

const audioCache = {};
let savedDecks = [];

function goHome() {
    location.reload(); // Refreshes the page to reset the game state
}

// Function to play sound effects
function playSoundEffect(sound) {
  let audio = audioCache[sound];
  if (!audio) {
    audio = new Audio(sound);
    audio.load();
    audioCache[sound] = audio;
  } else if (audio) {
    audio.currentTime = 0;
  }
  audio.play();
}

// Function to toggle the sidebar
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("active");
}

// script.js
async function toggleSections() {
    const sections = document.getElementById("optional-sections");
    sections.classList.toggle("hidden-section");
    sections.classList.toggle("visible-section");
}

// Function to show Recent Actions
document.addEventListener("DOMContentLoaded", function () {
    const recentActionsTable = document.querySelector("#recent-actions-table tbody");

    // Function to add a new action row
    function addRecentAction(player, action, card) {
        const newRow = document.createElement("tr");
        const time = new Date().toLocaleTimeString(); // Get current time

        newRow.innerHTML = `
            <td>${player}</td>
            <td>${action}</td>
            <td>${card || "—"}</td>
            <td>${time}</td>
        `;

        recentActionsTable.prepend(newRow); // Add new action at the top

        // Limit recent actions to the last 5 entries
        if (recentActionsTable.rows.length > 5) {
            recentActionsTable.deleteRow(5);
        }
    }
      // Function to show Recent Actions
    window.showRecentActions = async function () {
      const recentActionsContainer = document.getElementById("recent-actions-container");
      recentActionsContainer.classList.remove("hidden-section");

    };
    // Example: Adding a test action (Replace with real game events)
    setTimeout(() => {
        addRecentAction("Player 1", "Played", "A♠");
        addRecentAction("Player 2", "Drew", "K♥");
    }, 1000);

    // Expose function globally for use in the game logic
    window.addRecentAction = addRecentAction;
});

  // Function to update active rules
async function showActiveRules() {
    try {
        const activeRulesContainer = document.getElementById("active-rules-container");
        activeRulesContainer.classList.remove("hidden-section");

        const response = await fetch('/game_state');
        const data = await response.json();
        const activeRules = data.activeRuleShifts;

        const ruleShiftsContainer = document.getElementById("rule-shifts-container");
        //First clear the exisiting container before adding new data.
        ruleShiftsContainer.innerHTML = '';

        if (activeRules && activeRules.length > 0) {
            activeRules.forEach(rule => {
                addRuleShift(rule.name, rule.description);
            });
        } else {
            activeRulesContainer.textContent = 'No active rules.';
        }
    } catch (error) {
        console.error('Error fetching active rules:', error);
        activeRulesContainer.textContent = 'Error fetching active rules.';
    }
}
document.addEventListener("DOMContentLoaded", function () {

    const ruleShiftsContainer = document.getElementById("rule-shifts-container");

    // Function to add a new rule shift
    function addRuleShift(ruleName, ruleDescription) {
        const newRule = document.createElement("div");
        newRule.classList.add("rule-shift");

        const time = new Date().toLocaleTimeString(); // Get current time
        newRule.innerHTML = `
            <p><strong>${ruleName}:</strong> ${ruleDescription}</p>
            <span class="rule-time">${time}</span>
        `;

        //Append child instead of prepending for accurate display
        ruleShiftsContainer.appendChild(newRule);

        // Limit rule shifts to the last 3 entries
        if (ruleShiftsContainer.children.length > 3) {
            ruleShiftsContainer.removeChild(ruleShiftsContainer.firstChild);
        }
    }
    // Expose function globally for use in the game logic
    window.addRuleShift = addRuleShift;
});

// Function to update the game state
function updateGameState(state) {
  const gameStateElement = document.getElementById("game-state");
  gameStateElement.textContent = state;
}

// Function to update player hands
function updatePlayerHands(players) {
  const playerHandsElement = document.getElementById("player-hands");
  playerHandsElement.innerHTML = players
    .map(
      (player, index) => `
        <div class="player-hand-container">
            <strong class="player-name">${player.name}:</strong>
            <div class="other-player-hand">
                ${player.hand
                  .map((card) => `<div class="card-icon">${card}</div>`)
                  .join("")}
            </div>
        </div>
        ${
          index < players.length - 1
            ? '<hr class="player-separator">'
            : ""
        }  <!-- Add HR except after the last player -->
    `
    )
    .join("");
}

// Function to update the leaderboard preview
function updateLeaderboardPreview(leaderboard) {
  const leaderboardPreviewElement = document.getElementById(
    "leaderboard-preview"
  );
  if (!leaderboard || leaderboard.length === 0) {
    leaderboardPreviewElement.innerHTML = `<div>No leaderboard entries available</div>`;
    return;
  }
  const maxEntries = 3;
  let displayedEntries = leaderboard
    .slice(0, maxEntries)
    .map(
      (entry, index) => `
        <div>
            <strong>${index + 1}. ${entry.name}:</strong> ${entry.wins} wins
        </div>
    `
    );
  if (leaderboard.length < maxEntries) {
    displayedEntries.push(
      `<div>Only ${leaderboard.length} entr${
        leaderboard.length === 1 ? "y" : "ies"
      } available</div>`
    );
  }
  leaderboardPreviewElement.innerHTML = displayedEntries.join("");
}

// Function to log recent actions
function logRecentAction(action) {
  const recentActionsElement = document.getElementById("recent-actions");
  const actionElement = document.createElement("div");
  actionElement.textContent = action;
  recentActionsElement.appendChild(actionElement);
  recentActionsElement.scrollTop = recentActionsElement.scrollHeight; // Auto-scroll to the latest action
}

// Function to show the loader
function showLoader() {
  document.getElementById("loader").style.display = "block";
}

// Function to hide the loader
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// Function to start the game
async function startGame() {
  try {
    showLoader();
    const response = await fetch("/start_game", { method: "POST" });
    const data = await response.json();
    document.getElementById("game-results").innerHTML = data.message;
    document.getElementById("game-results").classList.add("show");
    await fetchGameState(); // Fetch game state after starting
  } catch (error) {
    console.error("Error:", error);
  } finally {
    hideLoader();
  }
}

// Function to reset the game
async function resetGame() {
  try {
    showLoader();
    const response = await fetch("/reset_game", { method: "POST" });
    const data = await response.json();
    document.getElementById("success-message").classList.add("show");
    setTimeout(() => {
      document.getElementById("success-message").classList.remove("show");
    }, 2000);
    document.getElementById("game-results").classList.remove("show");
    await fetchGameState(); // Fetch game state after reset
  } catch (error) {
    console.error("Error:", error);
  } finally {
    hideLoader();
  }
}

// Function to fetch and display players
async function viewPlayers() {
  try {
    showLoader();
    const response = await fetch("/view_players");
    const players = await response.json();

    const resultsContainer = document.getElementById("game-results");
    resultsContainer.innerHTML = "";

    if (players.length > 0) {
      const playerTable = document.createElement("table");
      playerTable.className = "player-table"; // Add a class for styling

      // Create table header
      const thead = document.createElement("thead");
      thead.innerHTML = `
                <tr>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
            `;
      playerTable.appendChild(thead);

      // Create table body
      const tbody = document.createElement("tbody");
      players.forEach((player) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.score}</td>
                `;
        tbody.appendChild(row);
      });
      playerTable.appendChild(tbody);

      resultsContainer.appendChild(playerTable);
    } else {
      resultsContainer.textContent = "No players found.";
    }

    resultsContainer.classList.add("show");
  } catch (error) {
    console.error("Error fetching players:", error);
  } finally {
    hideLoader();
  }
}

// Function to fetch and display the leaderboard
async function showLeaderboard() {
  try {
    showLoader();
    const response = await fetch("/leaderboard");
    const leaderboard = await response.json();

    const resultsContainer = document.getElementById("game-results");
    resultsContainer.innerHTML = "";

    if (leaderboard.length > 0) {
      const leaderboardTable = document.createElement("table");
      leaderboardTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Wins</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard
                      .map(
                        (entry, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${entry.name}</td>
                            <td>${entry.wins}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            `;
      resultsContainer.appendChild(leaderboardTable);
    } else {
      resultsContainer.textContent = "No leaderboard data available.";
    }

    resultsContainer.classList.add("show");
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  } finally {
    hideLoader();
  }
}

// Function to show Leaderboard Panel
async function showLeaderboardPanel() {
  try {
    showLoader();
    const response = await fetch("/leaderboard");
    const leaderboard = await response.json();

    const resultsContainer = document.getElementById("game-results");
    resultsContainer.innerHTML = "";

    if (leaderboard.length > 0) {
      const leaderboardTable = document.createElement("table");
      leaderboardTable.className = "leaderboard-table"; // Add a class for styling

      // Create table header
      const thead = document.createElement("thead");
      thead.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Wins</th>
                </tr>
            `;
      leaderboardTable.appendChild(thead);

      // Create table body
      const tbody = document.createElement("tbody");
      leaderboard.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.wins}</td>
                `;
        tbody.appendChild(row);
      });
      leaderboardTable.appendChild(tbody);

      resultsContainer.appendChild(leaderboardTable);
    } else {
      resultsContainer.textContent = "No leaderboard data available.";
    }

    resultsContainer.classList.add("show");
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  } finally {
    hideLoader();
  }
}

let aiStrategy = "strategic"; // Default AI strategy

function setAIStrategy(strategy) {
    aiStrategy = strategy;
    document.getElementById("ai-status").textContent = `AI is now playing in ${strategy} mode.`;
}

function aiMakeMove() {
    const aiStatus = document.getElementById("ai-status");
    const aiCardZone = document.getElementById("ai-card-zone");
    const aiLog = document.getElementById("ai-log");

    aiStatus.textContent = "AI is thinking...";

    setTimeout(() => {
        let aiMove = chooseAIMove();
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = aiMove;
        aiCardZone.appendChild(cardElement);

        aiStatus.textContent = `AI played ${aiMove}`;

        // Logging AI Move
        const logEntry = document.createElement("li");
        logEntry.textContent = `AI (${aiStrategy}) played ${aiMove}`;
        aiLog.prepend(logEntry);

    }, 1500);
}

function chooseAIMove() {
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["♠", "♥", "♦", "♣"];
    let chosenCard = "";

    if (aiStrategy === "strategic") {
        // Prefers high-value cards or those that align with a pattern
        chosenCard = ranks[Math.floor(Math.random() * 5 + 8)] + "<span class='suit'>" + suits[Math.floor(Math.random() * suits.length)] + "</span>";
    } else if (aiStrategy === "aggressive") {
        // Prefers face cards (J, Q, K, A)
        const highRanks = ["A", "K", "Q", "J"];
        chosenCard = highRanks[Math.floor(Math.random() * highRanks.length)] + "<span class='suit'>" + suits[Math.floor(Math.random() * suits.length)] + "</span>";
    } else if (aiStrategy === "defensive") {
        // Prefers lower-value cards (2-6) to keep strong ones for later
        chosenCard = ranks[Math.floor(Math.random() * 5 + 1)] + "<span class='suit'>" + suits[Math.floor(Math.random() * suits.length)] + "</span>";
    }

    return chosenCard;
}

// Function to show Saved Decks Panel
async function showSavedDecksPanel() {
  try {
    showLoader();
    savedDecks = JSON.parse(localStorage.getItem("savedDecks")) || [];
    const resultsContainer = document.getElementById("game-results");
    resultsContainer.innerHTML = "";

    if (savedDecks.length > 0) {
      const deckList = document.createElement("ul");
      deckList.className = "saved-decks-list";

      savedDecks.forEach((deck) => {
        // Removed index
        const listItem = document.createElement("li");
        listItem.innerHTML = `
                    <span class="deck-name">${deck.name}</span>
                    <button onclick="useDeck(${deck.id})">Use</button>
                    <button onclick="deleteDeck(${deck.id})">Delete</button>
                `;
        deckList.appendChild(listItem);
      });

      resultsContainer.appendChild(deckList);
    } else {
      resultsContainer.textContent = "No saved decks available.";
    }

    resultsContainer.classList.add("show");
  } catch (error) {
    console.error("Error fetching saved decks:", error);
  } finally {
    hideLoader();
  }
}

// Function to update recent actions
function updateRecentActions(actions) {
  console.log("Updating Recent Actions:", actions);

  if (!actions || !Array.isArray(actions)) {
    console.warn("No recent actions to display.");
    return;
  }

  const recentActionsElement = document.getElementById("recent-actions");
  if (!recentActionsElement) {
    console.error("Element #recent-actions not found in the DOM!");
    return;
  }

  recentActionsElement.innerHTML = `<ul>${actions
    .map((action) => `<li>${action}</li>`)
    .join("")}</ul>`;
  recentActionsElement.scrollTop = recentActionsElement.scrollHeight;
}

async function fetchGameState() {
  try {
    let currentCards = [];
    const cardGameState = await fetch("/game_state");
    if (!cardGameState.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const gameState = await cardGameState.json();

    console.log("Fetched game state:", gameState);

    // Compare the new game state with the previous game state
    if (!areGameStatesEqual(previousGameState, gameState)) {
      // Update the game state display
      updateGameState(gameState.state);

      // Update player hands in the "other-info" section
      updatePlayerHands(gameState.players);

      // Update leaderboard preview in the "other-info" section
      updateLeaderboardPreview(gameState.leaderboard);

      // Update recent actions in the "other-info" section
      updateRecentActions(gameState.recentActions);

      // Update Human Player's Hand
      updateHumanPlayerHand(
        gameState.players.find((player) => player.name === "Human Player")
          ?.hand || []
      );
      
      // Update Current Card area
      updateCurrentCardsArea(gameState?.currentCards || []);

      // Update active rule shifts
      updateActiveRules(gameState.activeRuleShifts);

      previousGameState = gameState;
    }

    document.getElementById("player-turn").textContent =
      gameState.currentPlayerTurn;
    document.getElementById("deck-size").textContent = gameState.deckSize;
    updatePlayedCard(playedCard);
  } catch (error) {
    console.error("Error fetching game state:", error);
  }
}

// Function to update the Human Player's hand
function updateHumanPlayerHand(hand) {
  const humanPlayerHandElement = document.getElementById("human-player-hand");
  humanPlayerHandElement.innerHTML = hand
    .map((cardText) => {
      const parts = cardText.split(" "); // Assuming card is in the format "Rank Suit"
      const rank = parts[0]; // The rank is the first part
      const suit = parts[parts.length - 1]; // The suit is the last part
      return `
            <div class="card-icon">
                <span class="rank">${rank}</span>
                <span class="suit">${suit}</span>
            </div>
        `;
    })
    .join("");
  makeCardsClickable();
}

// Function to update Current Card Area
function updateCurrentCardsArea(card) {
  // Changed name
  const currentCardContainer = document.getElementById("current-cards");
  if (currentCardContainer) {
    currentCardContainer.innerHTML = card
      .map((cardText) => {
        const parts = cardText.trim().split(/\s+/); // Robust split on whitespace assuming card is in the format "Rank Suit"
        if (parts.length < 2) {
          console.error("Invalid card format:", cardText);
          return ""; // Skip rendering card if format is invalid
        }
        const rank = parts[0]; // The first token is assumed to be the rank
        const suit = parts[parts.length - 1]; // The last token is assumed to be the suit
        return `
            <div class="card-icon">
                <span class="rank">${rank}</span>
                <span class="suit">${suit}</span>
            </div>
        `;
      })
      .join("");
  }
}

// Function to fetch and display the game state
let playedCard = [];
let previousGameState = null;

// Function to update active rule shifts
function updateActiveRules(rules) {
  const activeRulesElement = document.getElementById("active-rules");
  if (activeRulesElement) {
    activeRulesElement.innerHTML = rules
      .map(
        (rule) => `
            <div>
                <strong>${rule.name}:</strong> ${rule.description}
            </div>
        `
      )
      .join("");
  }
}

// Function to compare game states
function areGameStatesEqual(gameState1, gameState2) {
  if (!gameState1 || !gameState2) {
    return false;
  }
  if (gameState1.state !== gameState2.state) {
    return false;
  }
  if (gameState1.recentActions.length !== gameState2.recentActions.length) {
    return false;
  }
  for (let i = 0; i < gameState1.recentActions.length; i++) {
    if (gameState1.recentActions[i] !== gameState2.recentActions[i]) {
      return false;
    }
  }
  if (gameState1.leaderboard.length !== gameState2.leaderboard.length) {
    return false;
  }
  for (let i = 0; i < gameState1.leaderboard.length; i++) {
    if (
      gameState1.leaderboard[i].name !== gameState2.leaderboard[i].name ||
      gameState1.leaderboard[i].wins !== gameState2.leaderboard[i].wins
    ) {
      return false;
    }
  }
  if (gameState1.players.length !== gameState2.players.length) {
    return false;
  }
  for (let i = 0; i < gameState1.players.length; i++) {
    if (
      gameState1.players[i].name !== gameState2.players[i].name ||
      gameState1.players[i].hand.length !== gameState2.players[i].hand.length
    ) {
      return false;
    }
    for (let j = 0; j < gameState1.players[i].hand.length; j++) {
      if (gameState1.players[i].hand[j] !== gameState2.players[i].hand[j]) {
        return false;
      }
    }
  }
  return true;
}

// Function to handle winning the game
function handleWin() {
  const gameStateElement = document.getElementById("game-state");
  gameStateElement.classList.add("win-animation");
  playSoundEffect("sounds/win_game.mp3");
  setTimeout(() => {
    gameStateElement.classList.remove("win-animation");
  }, 1000);
}

// Function to generate rule shifts
function generateRuleShift() {
  const ruleShifts = [
    {
      name: "Double Risk Mode",
      description:
        "All card values are doubled for this turn! Take risks but beware!",
      applyEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.hand.forEach((card) => {
            card.value *= 2; // Double card values
          });
        });
      },
      removeEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.hand.forEach((card) => {
            card.value /= 2; // Revert card values
          });
        });
      },
      target: "All Cards",
    },
    {
      name: "Sudden Swap",
      description: "All players randomly swap hands! Adapt quickly!",
      applyEffect: (gameState) => {
        const hands = gameState.players.map((player) => player.hand);
        for (let i = hands.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [hands[i], hands[j]] = [hands[j], hands[i]];
        }
        gameState.players.forEach((player, index) => {
          player.hand = hands[index];
        });
      },
      removeEffect: (gameState) => {
        // No need to revert; the swap is permanent for the turn
      },
      target: "All Hands",
    },
    {
      name: "Reverse Play Order",
      description: "The play order is reversed for this round!",
      applyEffect: (gameState) => {
        gameState.players.reverse(); // Reverse player order
      },
      removeEffect: (gameState) => {
        gameState.players.reverse(); // Revert player order
      },
      target: "Play Order",
    },
    {
      name: "Wildcard Round",
      description: "All cards are considered wildcards for this turn!",
      applyEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.hand.forEach((card) => {
            card.isWildcard = true; // Mark cards as wildcards
          });
        });
      },
      removeEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.hand.forEach((card) => {
            card.isWildcard = false; // Revert wildcard status
          });
        });
      },
      target: "All Cards",
    },
    {
      name: "Steal a Card",
      description:
        "Each player steals a random card from another player's hand!",
      applyEffect: (gameState) => {
        gameState.players.forEach((player) => {
          const otherPlayers = gameState.players.filter((p) => p !== player);
          const randomPlayer =
            otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          const randomCard = randomPlayer.hand.splice(
            Math.floor(Math.random() * randomPlayer.hand.length),
            1
          )[0];
          player.hand.push(randomCard);
        });
      },
      removeEffect: (gameState) => {
        // No need to revert; the swap is permanent for the turn
      },
      target: "All Hands",
    },
    {
      name: "Double Draw",
      description: "Players draw two cards instead of one this turn!",
      applyEffect: (gameState) => {
        gameState.players.forEach((player) => {
          const drawnCards = gameState.deck.splice(0, 2); // Draw two cards
          player.hand.push(...drawnCards);
        });
      },
      removeEffect: (gameState) => {
        // No need to revert; the cards remain in players' hands
      },
      target: "Deck",
    },
    {
      name: "Freeze Hand",
      description: "Players cannot play cards this turn!",
      applyEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.canPlay = false; // Disable playing cards
        });
      },
      removeEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.canPlay = true; // Re-enable playing cards
        });
      },
      target: "All Players",
    },
    {
      name: "Power Surge",
      description:
        "All face cards (Jack, Queen, King) gain double value this turn!",
      applyEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.hand.forEach((card) => {
            if (["Jack", "Queen", "King"].includes(card.rank)) {
              card.value *= 2; // Double value for face cards
            }
          });
        });
      },
      removeEffect: (gameState) => {
        gameState.players.forEach((player) => {
          player.hand.forEach((card) => {
            if (["Jack", "Queen", "King"].includes(card.rank)) {
              card.value /= 2; // Revert value for face cards
            }
          });
        });
      },
      target: "Face Cards",
    },
    {
      name: "Chaos Mode",
      description:
        "All cards are shuffled back into the deck, and players are dealt new hands!",
      applyEffect: (gameState) => {
        // Reshuffle all cards back into the deck
        gameState.deck = [];
        gameState.players.forEach((player) => {
          gameState.deck.push(...player.hand);
          player.hand = [];
        });
        gameState.deck = shuffleArray(gameState.deck); // Shuffle the deck

        // Redeal cards to players
        gameState.players.forEach((player) => {
          player.hand = gameState.deck.splice(0, 5); // Deal 5 cards
        });
      },
      removeEffect: (gameState) => {
        // No need to revert; the new hands are permanent
      },
      target: "Deck and Hands",
    },
  ];

  // Randomly select a rule shift
  const randomIndex = Math.floor(Math.random() * ruleShifts.length);
  return ruleShifts[randomIndex];
}

// Function to use a saved deck
function useDeck(deckId) {
  const selectedDeck = savedDecks.find((deck) => deck.id === deckId); // Find deck by ID
  if (selectedDeck) {
    alert(`Using deck: ${selectedDeck.name}`);
    loadDeckIntoGame(selectedDeck);
  } else {
    console.warn(`Deck with id ${deckId} not found.`);
    showNotification(`Deck with id ${deckId} not found.`); // Use notification system
  }
}

// Function to delete a saved deck
function deleteDeck(deckId) {
  if (confirm("Are you sure you want to delete this deck?")) {
    const index = savedDecks.findIndex((deck) => deck.id === deckId); // Find index by ID
    if (index > -1) {
      savedDecks.splice(index, 1);
      localStorage.setItem("savedDecks", JSON.stringify(savedDecks));
      showSavedDecksPanel(); // Refresh the saved decks list
    } else {
        (`Deck with id ${deckId} not found for deletion.`);
        showNotification(`Deck with id ${deckId} not found for deletion.`); // Use notification system
      }
    }
  }
  
  // Function to load a deck into the game
  function loadDeckIntoGame(deck) {
    // Clear the current hand
    const humanPlayerHand = document.getElementById("human-player-hand");
    humanPlayerHand.innerHTML = "";
  
    // Add cards from the deck to the player's hand
    deck.cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card-icon";
      cardElement.textContent = card;
      humanPlayerHand.appendChild(cardElement);
    });
  
    // Make the new cards clickable
    makeCardsClickable();
  }
  
  // Function to show notifications
  function showNotification(message) {
    const notificationElement = document.createElement("div");
    notificationElement.className = "notification";
    notificationElement.textContent = message;
  
    const notificationsContainer = document.getElementById("notifications");
    notificationsContainer.appendChild(notificationElement);
  
    // Remove the notification after 3 seconds
    setTimeout(() => {
      notificationsContainer.removeChild(notificationElement);
    }, 3000);
  }
  
  // Helper function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Function to apply a rule shift
  async function applyRuleShift() {
    const ruleShift = generateRuleShift();
    try {
      const response = await fetch("/apply_rule_shift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ruleShift),
      });
  
      if (!response.ok) {
        throw new Error("Failed to apply rule shift");
      }
  
      const data = await response.json();
      logRecentAction(
        `Rule Shift Applied: ${ruleShift.name} - ${ruleShift.description}`
      );
      updateGameState(data.gameState);
  
      // Show a notification
      showNotification(`Rule Shift: ${ruleShift.name} - ${ruleShift.description}`);
    } catch (error) {
      console.error("Error applying rule shift:", error);
      alert(error.message);
    }
  }
  
  // Trigger rule shifts every 3 turns
  let turnCount = 0;
  
  function openDeckBuilder() {
    console.log("Deck Builder button clicked");
  
    // Create a modal container
    const modal = document.createElement("div");
    modal.id = "deck-builder-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";
  
    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "10px";
    modalContent.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    modalContent.style.maxWidth = "500px";
    modalContent.style.width = "100%";
  
    // Add a title to the modal
    const title = document.createElement("h2");
    title.textContent = "Deck Builder";
    title.style.marginBottom = "20px";
    modalContent.appendChild(title);
  
    // Add a form for deck-building
    const form = document.createElement("form");
    form.id = "deck-builder-form";
  
    // Input for deck name
    const deckNameLabel = document.createElement("label");
    deckNameLabel.textContent = "Deck Name:";
    deckNameLabel.style.display = "block";
    deckNameLabel.style.marginBottom = "10px";
    const deckNameInput = document.createElement("input");
    deckNameInput.type = "text";
    deckNameInput.name = "deckName";
    deckNameInput.required = true;
    deckNameInput.style.width = "100%";
    deckNameInput.style.padding = "8px";
    deckNameInput.style.marginBottom = "20px";
    form.appendChild(deckNameLabel);
    form.appendChild(deckNameInput);
  
    // Button to submit the form
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Save Deck";
    submitButton.style.padding = "10px 20px";
    submitButton.style.backgroundColor = "#007BFF";
    submitButton.style.color = "#fff";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "5px";
    submitButton.style.cursor = "pointer";
    form.appendChild(submitButton);
  
    // Add form to modal content
    modalContent.appendChild(form);
  
    // Add modal content to modal
    modal.appendChild(modalContent);
  
    // Add modal to the body
    document.body.appendChild(modal);
  
    // Close modal when clicking outside the modal content
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  
    // Handle form submission
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const deckName = deckNameInput.value.trim();
      if (deckName) {
        // Simulate the data to be contained for each deck
        const deckData = ["Card 1", "Card 2", "Card 3"]; // Sample deck
        const deck = {
          id: Date.now(),
          name: deckName,
          cards: deckData,
        };
        savedDecks.push(deck);
  
        // Save to localStorage
        localStorage.setItem("savedDecks", JSON.stringify(savedDecks));
        alert(`Deck "${deckName}" saved successfully!`);
  
        // Display the saved deck after saving
        showSavedDecksPanel();
  
        closeModal();
      } else {
        alert("Please enter a deck name.");
      }
    });
  
    // Function to close the modal
    function closeModal() {
      document.body.removeChild(modal);
    }
  }
  
  // Function to get saved decks from localStorage
  function getSavedDecks() {
    let savedDecks = localStorage.getItem("savedDecks");
  
    if (savedDecks) {
      savedDecks = JSON.parse(savedDecks);
      console.log("savedDecks", savedDecks); // Check if it's loading correctly
    }
    return savedDecks;
  }
  
  // Load saved decks on page load and run game
  document.addEventListener("DOMContentLoaded", loadGame);
  
  function loadGame() {
    savedDecks = JSON.parse(localStorage.getItem("savedDecks")) || []; // Load saved decks from localStorage
    makeCardsClickable();
    fetchGameState();
  }
  
  setInterval(fetchGameState, 5000);