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

// Function to update played cards
function updatePlayedCard(card) {
    const playedCardElement = document.getElementById('played-card');
    if (playedCardElement) {
        playedCardElement.innerHTML = `
            <div class="card">
                ${card}
            </div>
        `;
    }
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
let playedCard = [];
let previousGameState = null;

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

            // Update active rule shifts
            updateActiveRules(gameState.activeRuleShifts);

            previousGameState = gameState;
        }

        document.getElementById('player-turn').textContent = gameState.currentPlayerTurn;
        document.getElementById('deck-size').textContent = gameState.deckSize;
        updatePlayedCard(playedCard);
    } catch (error) {
        console.error('Error fetching game state:', error);
    }
}

// Function to update active rule shifts
function updateActiveRules(rules) {
    const activeRulesElement = document.getElementById('active-rules');
    if (activeRulesElement) {
        activeRulesElement.innerHTML = rules.map(rule => `
            <div>
                <strong>${rule.name}:</strong> ${rule.description}
            </div>
        `).join('');
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
        if (gameState1.leaderboard[i].name !== gameState2.leaderboard[i].name ||
            gameState1.leaderboard[i].wins !== gameState2.leaderboard[i].wins) {
            return false;
        }
    }
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
    return true;
}

// Function to handle winning the game
function handleWin() {
    const gameStateElement = document.getElementById('game-state');
    gameStateElement.classList.add('win-animation');
    playSoundEffect('sounds/win_game.mp3');
    setTimeout(() => {
        gameStateElement.classList.remove('win-animation');
    }, 1000);
}

// Function to generate rule shifts
function generateRuleShift() {
    const ruleShifts = [
        {
            name: "Double Risk Mode",
            description: "All card values are doubled for this turn! Take risks but beware!",
            applyEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.hand.forEach(card => {
                        card.value *= 2; // Double card values
                    });
                });
            },
            removeEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.hand.forEach(card => {
                        card.value /= 2; // Revert card values
                    });
                });
            },
            target: 'All Cards'
        },
        {
            name: "Sudden Swap",
            description: "All players randomly swap hands! Adapt quickly!",
            applyEffect: (gameState) => {
                const hands = gameState.players.map(player => player.hand);
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
            target: 'All Hands'
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
            target: 'Play Order'
        },
        {
            name: "Wildcard Round",
            description: "All cards are considered wildcards for this turn!",
            applyEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.hand.forEach(card => {
                        card.isWildcard = true; // Mark cards as wildcards
                    });
                });
            },
            removeEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.hand.forEach(card => {
                        card.isWildcard = false; // Revert wildcard status
                    });
                });
            },
            target: 'All Cards'
        },
        {
            name: "Steal a Card",
            description: "Each player steals a random card from another player's hand!",
            applyEffect: (gameState) => {
                gameState.players.forEach(player => {
                    const otherPlayers = gameState.players.filter(p => p !== player);
                    const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                    const randomCard = randomPlayer.hand.splice(Math.floor(Math.random() * randomPlayer.hand.length), 1)[0];
                    player.hand.push(randomCard);
                });
            },
            removeEffect: (gameState) => {
                // No need to revert; the swap is permanent for the turn
            },
            target: 'All Hands'
        },
        {
            name: "Double Draw",
            description: "Players draw two cards instead of one this turn!",
            applyEffect: (gameState) => {
                gameState.players.forEach(player => {
                    const drawnCards = gameState.deck.splice(0, 2); // Draw two cards
                    player.hand.push(...drawnCards);
                });
            },
            removeEffect: (gameState) => {
                // No need to revert; the cards remain in players' hands
            },
            target: 'Deck'
        },
        {
            name: "Freeze Hand",
            description: "Players cannot play cards this turn!",
            applyEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.canPlay = false; // Disable playing cards
                });
            },
            removeEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.canPlay = true; // Re-enable playing cards
                });
            },
            target: 'All Players'
        },
        {
            name: "Power Surge",
            description: "All face cards (Jack, Queen, King) gain double value this turn!",
            applyEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.hand.forEach(card => {
                        if (['Jack', 'Queen', 'King'].includes(card.rank)) {
                            card.value *= 2; // Double value for face cards
                        }
                    });
                });
            },
            removeEffect: (gameState) => {
                gameState.players.forEach(player => {
                    player.hand.forEach(card => {
                        if (['Jack', 'Queen', 'King'].includes(card.rank)) {
                            card.value /= 2; // Revert value for face cards
                        }
                    });
                });
            },
            target: 'Face Cards'
        },
        {
            name: "Chaos Mode",
            description: "All cards are shuffled back into the deck, and players are dealt new hands!",
            applyEffect: (gameState) => {
                // Reshuffle all cards back into the deck
                gameState.deck = [];
                gameState.players.forEach(player => {
                    gameState.deck.push(...player.hand);
                    player.hand = [];
                });
                gameState.deck = shuffleArray(gameState.deck); // Shuffle the deck

                // Redeal cards to players
                gameState.players.forEach(player => {
                    player.hand = gameState.deck.splice(0, 5); // Deal 5 cards
                });
            },
            removeEffect: (gameState) => {
                // No need to revert; the new hands are permanent
            },
            target: 'Deck and Hands'
        }
    ];

    // Randomly select a rule shift
    const randomIndex = Math.floor(Math.random() * ruleShifts.length);
    return ruleShifts[randomIndex];
}

// Function to use a saved deck
function useDeck(index) {
    const selectedDeck = savedDecks[index];
    alert(`Using deck: ${selectedDeck.name}`);

    // Load the deck into the player's hand
    loadDeckIntoGame(selectedDeck);
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

// Function to display saved decks
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

// Function to show notifications
function showNotification(message) {
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    notificationElement.textContent = message;

    const notificationsContainer = document.getElementById('notifications');
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
        const response = await fetch('/apply_rule_shift', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ruleShift),
        });

        if (!response.ok) {
            throw new Error('Failed to apply rule shift');
        }

        const data = await response.json();
        logRecentAction(`Rule Shift Applied: ${ruleShift.name} - ${ruleShift.description}`);
        updateGameState(data.gameState);

        // Show a notification
        showNotification(`Rule Shift: ${ruleShift.name} - ${ruleShift.description}`);
    } catch (error) {
        console.error('Error applying rule shift:', error);
        alert(error.message);
    }
}

// Trigger rule shifts every 3 turns
let turnCount = 0;

async function playCard() {
    try {
        showLoader();
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
        logRecentAction(`Played Card: ${selectedCard}`);
        updatePlayedCard(selectedCard); // Update the played card section
        await fetchGameState();
        selectedCard = null;
    } catch (error) {
        console.error('Error playing card:', error);
        alert(error.message);
    } finally {
        hideLoader();
    }
}

let savedDecks = []; // Array to store saved decks

function openDeckBuilder() {
    console.log('Deck Builder button clicked'); // Debug log

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

// Fetch the initial game state on page load
document.addEventListener('DOMContentLoaded', loadGame);

function loadGame() {
    makeCardsClickable();
}

setInterval(fetchGameState, 5000);