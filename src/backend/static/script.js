// Global variables
const audioCache = {};
let savedDecks = [];
let playerHand = []; // Tracks the human player's cards
let selectedCard = null; // Tracks the currently selected card
let playedCard = null; // Tracks the last played card

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
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Function to update the game state
function updateGameState(state) {
    const gameStateElement = document.getElementById('game-state');
    gameStateElement.textContent = state;
}

// Function to update player hands
function updatePlayerHands(players) {
    const playerHandsElement = document.getElementById('player-hands');
    playerHandsElement.innerHTML = players.map((player, index) => `
        <div class="player-hand-container">
            <strong class="player-name">${player.name}:</strong>
            <div class="other-player-hand">
                ${player.hand.map(card => `<div class="card-icon">${card}</div>`).join('')}
            </div>
        </div>
        ${index < players.length - 1 ? '<hr class="player-separator">' : ''}  <!-- Add HR except after the last player -->
    `).join('');
}

// Function to update the leaderboard preview
function updateLeaderboardPreview(leaderboard) {
    const leaderboardPreviewElement = document.getElementById('leaderboard-preview');
    if (!leaderboard || leaderboard.length === 0) {
        leaderboardPreviewElement.innerHTML = `<div>No leaderboard entries available</div>`;
        return;
    }
    const maxEntries = 3;
    let displayedEntries = leaderboard.slice(0, maxEntries).map((entry, index) => `
        <div>
            <strong>${index + 1}. ${entry.name}:</strong> ${entry.wins} wins
        </div>
    `);
    if (leaderboard.length < maxEntries) {
        displayedEntries.push(`<div>Only ${leaderboard.length} entr${leaderboard.length === 1 ? 'y' : 'ies'} available</div>`);
    }
    leaderboardPreviewElement.innerHTML = displayedEntries.join('');
}

// Function to log recent actions
function logRecentAction(action) {
    const recentActionsElement = document.getElementById('recent-actions');
    const actionElement = document.createElement('div');
    actionElement.textContent = action;
    recentActionsElement.appendChild(actionElement);
    recentActionsElement.scrollTop = recentActionsElement.scrollHeight; // Auto-scroll to the latest action
}

// Function to show the loader
function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

// Function to hide the loader
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// Function to start the game
async function startGame() {
    try {
        showLoader();
        const response = await fetch('/start_game', { method: 'POST' });
        const data = await response.json();
        document.getElementById('game-results').innerHTML = data.message;
        document.getElementById('game-results').classList.add('show');
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
        const response = await fetch('/reset_game', { method: 'POST' });
        const data = await response.json();
        document.getElementById("success-message").classList.add("show");
        setTimeout(() => {
            document.getElementById("success-message").classList.remove("show");
        }, 2000);
        document.getElementById('game-results').classList.remove('show');
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
        const response = await fetch('/view_players');
        const players = await response.json();

        const resultsContainer = document.getElementById('game-results');
        resultsContainer.innerHTML = '';

        if (players.length > 0) {
            const playerTable = document.createElement('table');
            playerTable.className = 'player-table';

            // Create table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
            `;
            playerTable.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            players.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.score}</td>
                `;
                tbody.appendChild(row);
            });
            playerTable.appendChild(tbody);

            resultsContainer.appendChild(playerTable);
        } else {
            resultsContainer.textContent = 'No players found.';
        }

        resultsContainer.classList.add('show');
    } catch (error) {
        console.error('Error fetching players:', error);
    } finally {
        hideLoader();
    }
}

// Function to fetch and display the leaderboard
async function showLeaderboardPanel() {
    try {
        showLoader();
        const response = await fetch('/leaderboard');
        const leaderboard = await response.json();

        const resultsContainer = document.getElementById('game-results');
        resultsContainer.innerHTML = '';

        if (leaderboard.length > 0) {
            const leaderboardTable = document.createElement('table');
            leaderboardTable.className = 'leaderboard-table'; // Add a class for styling

            // Create table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Wins</th>
                </tr>
            `;
            leaderboardTable.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            leaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
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
            resultsContainer.textContent = 'No leaderboard data available.';
        }

        resultsContainer.classList.add('show');
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    } finally {
        hideLoader();
    }
}

// Function to fetch and display the game state
async function fetchGameState() {
    try {
        const response = await fetch('/game_state');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const gameState = await response.json();

        console.log('Fetched game state:', gameState);

        // Update the game state display
        updateGameState(gameState.state);

        // Update player hands
        updatePlayerHands(gameState.players);

        // Update the human player's hand
        const humanPlayer = gameState.players.find(player => player.name === 'Human Player');
        if (humanPlayer) {
            playerHand = humanPlayer.hand;
            updateHumanPlayerHand();
        }

        // Update leaderboard preview
        updateLeaderboardPreview(gameState.leaderboard);

        // Log recent actions
        updateRecentActions(gameState.recentActions);
    } catch (error) {
        console.error('Error fetching game state:', error);
    }
}

// Function to update the human player's hand
function updateHumanPlayerHand() {
    const humanPlayerHandElement = document.getElementById('human-player-hand');
    humanPlayerHandElement.innerHTML = playerHand.map(card => `
        <div class="card-icon" onclick="selectCard('${card}')">
            <span class="rank">${card.split(' ')[0]}</span>
            <span class="suit">${card.split(' ')[1]}</span>
        </div>
    `).join('');
    makeCardsClickable(); // Make the new cards clickable
}

// Function to update the played card section
function updatePlayedCard(card) {
    const playedCardElement = document.getElementById('played-card');
    if (playedCardElement) {
        if (card) {
            const parts = card.split(' '); // Assuming format is "Rank Suit"
            const rank = parts[0];
            const suit = parts[parts.length - 1];

            playedCardElement.innerHTML = `
                <div class="card-icon">
                    <span class="rank">${rank}</span>
                    <span class="suit">${suit}</span>
                </div>
            `;
        } else {
            playedCardElement.innerHTML = `<p>No card played yet.</p>`;
        }
    }
}

// Function to update the played card section
function updatePlayedCard(card) {
    const playedCardElement = document.getElementById('played-card');
    if (playedCardElement) {
        if (card) {
            const parts = card.split(' '); // Assuming format is "Rank Suit"
            const rank = parts[0];
            const suit = parts[parts.length - 1];

            playedCardElement.innerHTML = `
                <div class="card-icon">
                    <span class="rank">${rank}</span>
                    <span class="suit">${suit}</span>
                </div>
            `;
        } else {
            playedCardElement.innerHTML = `<p>No card played yet.</p>`;
        }
    }
}

function updateActiveRules(rules) {
    const activeRulesElement = document.getElementById('active-rules');
    if (activeRulesElement) {
        activeRulesElement.innerHTML = '';

        if (rules && rules.length > 0) {
            const ul = document.createElement('ul');

            // Style for if 'no rules are active
            rules.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = `${rule.name}: ${rule.description}`;
                ul.appendChild(li);
            });

            activeRulesElement.appendChild(ul);
        } else {
            activeRulesElement.textContent = 'No rules active';
        }
    }
}

// Function to select a card
function selectCard(cardElement) {
    const cardValue = cardElement.textContent;

    // Store references
    selectedCard = cardValue;
    selectedCardElement = cardElement;

    // Perform the actual selection
    selectCardAction();
}

function selectCardAction() {
    const cards = document.querySelectorAll('#human-player-hand .card-icon');

    // Clear other cards if they're not the card selected
    cards.forEach(card => {
        card.classList.remove('selected');
    });

    // Add a select style if it has been selected
    if (selectedCardElement) {
        selectedCardElement.classList.add('selected');
    }
}

// Function to draw a card
async function drawCard() {
    try {
        showLoader();
        const response = await fetch('/draw_card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player_name: 'Human Player' }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to draw card');
        }

        const data = await response.json();

        // Add the drawn card to the player's hand
        playerHand.push(data.card);
        updateHumanPlayerHand(); // Refresh the "Your Hand" section

        // Log the action
        logRecentAction(`Drew Card: ${data.card}`);
    } catch (error) {
        console.error('Error drawing card:', error);
        alert(error.message);
    } finally {
        hideLoader();
    }
}

// Function to play a card
// This is the final function for now, we can add here.
async function playCard() {
    try {
        showLoader();

        // 1. Select the Card
        const humanPlayerHand = document.getElementById('human-player-hand');
        const selectedCardElement = humanPlayerHand.querySelector('.card-icon.selected');

        // 2. Check if a card is selected
        if (!selectedCardElement) {
            alert('Please select a card to play!');
            return;
        }

        const selectedCard = selectedCardElement.textContent;
         // Extract card details before any manipulation
        const [rank, suit] = selectedCard.split(' ');

        // 3. Trigger the Play Animation
        selectedCardElement.classList.add('playing'); // Add "playing" class for animation
        playSoundEffect('sounds/play_card.mp3');

        // Add a short delay to allow the highlight to be visible
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay

         //4. Make API call of the card that is to be played.
        const response = await fetch('/play_card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player_name: 'Human Player', card: selectedCard }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to play card');
        }

        const data = await response.json();
        logRecentAction(`Played Card: ${rank} of ${getSuitIcon(suit)}`);
        updatePlayedCard(selectedCard); // Update the played card section
        //4. Remove Element after API Call.
        selectedCardElement.remove();
        await fetchGameState();
        this.selectedCard = null;
    } catch (error) {
        console.error('Error playing card:', error);
        alert(error.message);
    } finally {
        hideLoader();
    }
}

// Function to update the played card section
function updatePlayedCard(card) {
    const playedCardElement = document.getElementById('played-card');
    if (playedCardElement) {
        if (card) {
            const parts = card.split(' '); // Assuming format is "Rank Suit"
            const rank = parts[0];
            const suit = parts[parts.length - 1];

            playedCardElement.innerHTML = `
                <div class="card-icon">
                    <span class="rank">${rank}</span>
                    <span class="suit">${suit}</span>
                </div>
            `;
        } else {
            playedCardElement.innerHTML = `<p>No card played yet.</p>`;
        }
    }
}

function getSuitIcon(suit) {
    switch (suit) {
        case 'Hearts': return '♥';
        case 'Diamonds': return '♦';
        case 'Clubs': return '♣';
        case 'Spades': return '♠';
        default: return suit; // If the suit does not match a result, just return the suit.
    }
}

// Function to make cards clickable
function makeCardsClickable() {
    const cards = document.querySelectorAll('#human-player-hand .card-icon');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove the 'selected' class from all cards
            cards.forEach(c => c.classList.remove('selected'));

            // Add the 'selected' class to the clicked card
            card.classList.add('selected');
            selectedCard = card.textContent;
        });
    });
}

// Load saved decks on page load and run game
document.addEventListener('DOMContentLoaded', loadGame);

function loadGame() {
    savedDecks = JSON.parse(localStorage.getItem('savedDecks')) || []; // Load saved decks from localStorage
    makeCardsClickable();
    fetchGameState();
}

// Function to open the Deck Builder modal
function openDeckBuilder() {
    console.log('Deck Builder button clicked');

    // Create a modal container
    const modal = document.createElement('div');
    modal.id = 'deck-builder-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '100%';

    // Add a title to the modal
    const title = document.createElement('h2');
    title.textContent = 'Deck Builder';
    title.style.marginBottom = '20px';
    modalContent.appendChild(title);

    // Add a form for deck-building
    const form = document.createElement('form');
    form.id = 'deck-builder-form';

    // Input for deck name
    const deckNameLabel = document.createElement('label');
    deckNameLabel.textContent = 'Deck Name:';
    deckNameLabel.style.display = 'block';
    deckNameLabel.style.marginBottom = '10px';
    const deckNameInput = document.createElement('input');
    deckNameInput.type = 'text';
    deckNameInput.name = 'deckName';
    deckNameInput.required = true;
    deckNameInput.style.width = '100%';
    deckNameInput.style.padding = '8px';
    deckNameInput.style.marginBottom = '20px';
    form.appendChild(deckNameLabel);
    form.appendChild(deckNameInput);

    // Button to submit the form
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Save Deck';
    submitButton.style.padding = '10px 20px';
    submitButton.style.backgroundColor = '#007BFF';
    submitButton.style.color = '#fff';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.cursor = 'pointer';
    form.appendChild(submitButton);

    // Add form to modal content
    modalContent.appendChild(form);

    // Add modal content to modal
    modal.appendChild(modalContent);

    // Add modal to the body
    document.body.appendChild(modal);

    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const deckName = deckNameInput.value.trim();
        if (deckName) {
            // Simulate the data to be contained for each deck
            const deckData = [
                'Card 1', 'Card 2', 'Card 3' // Sample deck
            ]
            const deck = {
                id: Date.now(),
                name: deckName,
                cards: deckData
            };
            savedDecks.push(deck);

            // Save to localStorage
            localStorage.setItem('savedDecks', JSON.stringify(savedDecks));
            alert(`Deck "${deckName}" saved successfully!`);

            // Display the saved deck after saving
            showSavedDecksPanel();

            closeModal();
        } else {
            alert('Please enter a deck name.');
        }
    });

    // Function to close the modal
    function closeModal() {
        document.body.removeChild(modal);
    }
}

// Function to use a saved deck
function useDeck(deckId) {
    const selectedDeck = savedDecks.find(deck => deck.id === deckId); // Find deck by ID
    if (selectedDeck) {
        alert(`Using deck: ${selectedDeck.name}`);
        loadDeckIntoGame(selectedDeck);
    } else {
        console.warn(`Deck with id ${deckId} not found.`);
        showNotification(`Deck with id ${deckId} not found.`);  // Use notification system
    }
}

// Function to delete a saved deck
function deleteDeck(deckId) {
    if (confirm('Are you sure you want to delete this deck?')) {
        const index = savedDecks.findIndex(deck => deck.id === deckId); // Find index by ID
        if (index > -1) {
            savedDecks.splice(index, 1);
            localStorage.setItem('savedDecks', JSON.stringify(savedDecks));
            showSavedDecksPanel(); // Refresh the saved decks list
        } else {
            console.warn(`Deck with id ${deckId} not found for deletion.`);
            showNotification(`Deck with id ${deckId} not found for deletion.`); // Use notification system
        }
    }
}

// Function to load a deck into the game
function loadDeckIntoGame(deck) {
    // Clear the current hand
    const humanPlayerHand = document.getElementById('human-player-hand');
    humanPlayerHand.innerHTML = '';

    // Add cards from the deck to the player's hand
    deck.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-icon';
        cardElement.textContent = card;
        humanPlayerHand.appendChild(cardElement);
    });

    // Make the new cards clickable
    makeCardsClickable();
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
        savedDecks = JSON.parse(localStorage.getItem('savedDecks')) || [];
        const resultsContainer = document.getElementById('game-results');
        resultsContainer.innerHTML = '';

        if (savedDecks.length > 0) {
            const deckList = document.createElement('ul');
            deckList.className = 'saved-decks-list';

            savedDecks.forEach((deck) => { // Removed index
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="deck-name">${deck.name}</span>
                    <button onclick="useDeck(${deck.id})">Use</button>
                    <button onclick="deleteDeck(${deck.id})">Delete</button>
                `;
                deckList.appendChild(listItem);
            });

            resultsContainer.appendChild(deckList);
        } else {
            resultsContainer.textContent = 'No saved decks available.';
        }

        resultsContainer.classList.add('show');
    } catch (error) {
        console.error('Error fetching saved decks:', error);
    } finally {
        hideLoader();
    }
}

// Function to get saved decks from localStorage
function getSavedDecks() {
    let savedDecks = localStorage.getItem('savedDecks');

    if (savedDecks) {
        savedDecks = JSON.parse(savedDecks)
        console.log("savedDecks", savedDecks); // Check if it's loading correctly
    }
    return savedDecks;
}

// Load saved decks on page load and run game
document.addEventListener('DOMContentLoaded', loadGame);

function loadGame() {
    savedDecks = JSON.parse(localStorage.getItem('savedDecks')) || []; // Load saved decks from localStorage
    makeCardsClickable();
    fetchGameState();
}

setInterval(fetchGameState, 5000);