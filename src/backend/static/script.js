const audioCache = {};

// Function to play sound effects
function playSoundEffect(sound) {
    let audio = audioCache[sound];
    if (!audio) {
        audio = new Audio(sound);
        audio.load();
        audioCache[sound] = audio;
    } else {
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
    playerHandsElement.innerHTML = players.map(player => `
        <div>
            <strong>${player.name}:</strong>
            ${player.hand.map(card => `<div class="card-icon">${card}</div>`).join('')}
        </div>
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
            const playerList = document.createElement('ul');
            players.forEach(player => {
                const playerItem = document.createElement('li');
                playerItem.textContent = `Player: ${player.name}, Score: ${player.score}`;
                playerList.appendChild(playerItem);
            });
            resultsContainer.appendChild(playerList);
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
async function showLeaderboard() {
    try {
        showLoader();
        const response = await fetch('/leaderboard');
        const leaderboard = await response.json();

        const resultsContainer = document.getElementById('game-results');
        resultsContainer.innerHTML = '';

        if (leaderboard.length > 0) {
            const leaderboardTable = document.createElement('table');
            leaderboardTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Wins</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard.map((entry, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${entry.name}</td>
                            <td>${entry.wins}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
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
// Function to update recent actions
function updateRecentActions(actions) {
    const recentActionsElement = document.getElementById('recent-actions');
    recentActionsElement.innerHTML = actions.map(action => `<div>${action}</div>`).join('');
    recentActionsElement.scrollTop = recentActionsElement.scrollHeight; // Auto-scroll to the latest action
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

        // Refresh the game state to reflect the new card in the hand
        await fetchGameState();
    } catch (error) {
        console.error('Error drawing card:', error);
        alert(error.message); // Show an error message to the user
    } finally {
        hideLoader();
    }
}

// Function to play a specific card
async function playCard() {
    try {
        showLoader();
        // Check if a card is selected
        if (!selectedCard) {
            alert('Please select a card to play!');
            return;
        }

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

        // Refresh the game state to reflect the played card
        await fetchGameState();

        // Clear selected card after playing
        selectedCard = null;
    } catch (error) {
        console.error('Error playing card:', error);
        alert(error.message); // Show an error message to the user
    } finally {
        hideLoader();
    }
}

// Function to update the Human Player's hand
function updateHumanPlayerHand(hand) {
    const humanPlayerHandElement = document.getElementById('human-player-hand');
    humanPlayerHandElement.innerHTML = hand.map(cardText => {
        const parts = cardText.split(' '); // Assuming card is in the format "Rank Suit"
        const rank = parts[0]; // The rank is the first part
        const suit = parts[parts.length - 1]; // The suit is the last part
        return `
            <div class="card-icon">
                <span class="rank">${rank}</span>
                <span class="suit">${suit}</span>
            </div>
        `;
    }).join('');
    makeCardsClickable();
}

// Function to fetch and display the game state
async function fetchGameState() {
    try {
        const response = await fetch('/game_state');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const gameState = await response.json();

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
            updateHumanPlayerHand(gameState.players.find(player => player.name === "Human Player")?.hand || []);
            previousGameState = gameState;
        }
            document.getElementById('player-turn').textContent = gameState.currentPlayerTurn;
            document.getElementById('deck-size').textContent = gameState.deckSize;
            document.getElementById('played-cards').textContent = gameState.playedCards;
        } catch (error) {
                console.error('Error fetching game state:', error);
            }
        
    }

function areGameStatesEqual(gameState1, gameState2) {
    // If either game state is null or undefined, consider them not equal
    if (!gameState1 || !gameState2) {
        return false;
    }

    // Compare the state property
    if (gameState1.state !== gameState2.state) {
        return false;
    }

    // Compare the recentActions array
    if (gameState1.recentActions.length !== gameState2.recentActions.length) {
        return false;
    }
    for (let i = 0; i < gameState1.recentActions.length; i++) {
        if (gameState1.recentActions[i] !== gameState2.recentActions[i]) {
            return false;
        }
    }

    // Compare the leaderboard array
    if (gameState1.leaderboard.length !== gameState2.leaderboard.length) {
        return false;
    }
    for (let i = 0; i < gameState1.leaderboard.length; i++) {
        if (gameState1.leaderboard[i].name !== gameState2.leaderboard[i].name ||
            gameState1.leaderboard[i].wins !== gameState2.leaderboard[i].wins) {
            return false;
        }
    }

    // Compare the players array
    if (gameState1.players.length !== gameState2.players.length) {
        return false;
    }
    for (let i = 0; i < gameState1.players.length; i++) {
        if (gameState1.players[i].name !== gameState2.players[i].name ||
            gameState1.players[i].hand.length !== gameState2.players[i].hand.length) {
            return false;
        }
        for (let j = 0; j < gameState1.players[i].hand.length; j++) {
            if (gameState1.players[i].hand[j] !== gameState2.players[i].hand[j]) {
                return false;
            }
        }
    }

    // If all checks pass, consider the game states equal
    return true;
}

// Function to handle winning the game
function handleWin() {
    const gameStateElement = document.getElementById('game-state');
    gameStateElement.classList.add('win-animation');

    // Play sound effect for winning the game
    playSoundEffect('sounds/win_game.mp3');

    // Remove the animation after it completes
    setTimeout(() => {
        gameStateElement.classList.remove('win-animation');
    }, 1000);
}

let savedDecks = []; // Array to store saved decks

function openDeckBuilder() {
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
            // Save the deck with its name and cards
            const deck = {
                name: deckName,
                cards: ['Card 1', 'Card 2', 'Card 3'] // Example cards, replace with actual cards
            };
            savedDecks.push(deck);
            alert(`Deck "${deckName}" saved successfully!`);
            closeModal();
            displaySavedDecks(); // Update the UI to show saved decks
        } else {
            alert('Please enter a deck name.');
        }
    });

    // Function to close the modal
    function closeModal() {
        document.body.removeChild(modal);
    }
}

// Function to display saved decks in the UI
function displaySavedDecks() {
    const savedDecksContainer = document.getElementById('saved-decks');
    if (savedDecksContainer) {
        savedDecksContainer.innerHTML = savedDecks.map((deck, index) => `
            <div class="saved-deck" onclick="useDeck(${index})">
                <strong>${deck.name}</strong>
                <div class="deck-actions">
                    <button onclick="useDeck(${index})">Use</button>
                    <button onclick="deleteDeck(${index})">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Function to use a saved deck
async function useDeck(index) {
    const selectedDeck = savedDecks[index];
    alert(`Using deck: ${selectedDeck.name}`);

    // Load the deck into the player's hand
    loadDeckIntoGame(selectedDeck);

    // Send the deck's cards to the backend
    try {
        const response = await fetch('/play_deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                player_name: 'Human Player',
                deck: selectedDeck.cards,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to play deck');
        }

        const data = await response.json();
        console.log('Server response:', data); // Debug log
    } catch (error) {
        console.error('Error playing deck:', error);
        alert(error.message); // Show an error message to the user
    }
}

// Function to delete a saved deck
function deleteDeck(index) {
    if (confirm('Are you sure you want to delete this deck?')) {
        savedDecks.splice(index, 1);
        displaySavedDecks(); // Refresh the saved decks list
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

// Fetch the initial game state on page load
document.addEventListener('DOMContentLoaded', loadGame);

function loadGame() {
    makeCardsClickable();
};

setInterval(fetchGameState, 5000);
let previousGameState = null;

function areGameStatesEqual(gameState1, gameState2) {
    // If either game state is null or undefined, consider them not equal
    if (!gameState1 || !gameState2) {
        return false;
    }

    // Compare the state property
    if (gameState1.state !== gameState2.state) {
        return false;
    }

    // Compare the recentActions array
    if (gameState1.recentActions.length !== gameState2.recentActions.length) {
        return false;
    }
    for (let i = 0; i < gameState1.recentActions.length; i++) {
        if (gameState1.recentActions[i] !== gameState2.recentActions[i]) {
            return false;
        }
    }

    // Compare the leaderboard array
    if (gameState1.leaderboard.length !== gameState2.leaderboard.length) {
        return false;
    }
    for (let i = 0; i < gameState1.leaderboard.length; i++) {
        if (gameState1.leaderboard[i].name !== gameState2.leaderboard[i].name ||
            gameState1.leaderboard[i].wins !== gameState2.leaderboard[i].wins) {
            return false;
        }
    }

    // Compare the players array
    if (gameState1.players.length !== gameState2.players.length) {
        return false;
    }
    for (let i = 0; i < gameState1.players.length; i++) {
        if (gameState1.players[i].name !== gameState2.players[i].name ||
            gameState1.players[i].hand.length !== gameState2.players[i].hand.length) {
            return false;
        }
        for (let j = 0; j < gameState1.players[i].hand.length; j++) {
            if (gameState1.players[i].hand[j] !== gameState2.players[i].hand[j]) {
                return false;
            }
        }
    }

    // If all checks pass, consider the game states equal
    return true;
}