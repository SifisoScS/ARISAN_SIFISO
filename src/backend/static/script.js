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

// Update updateHumanPlayerHand to use the helper
function updateHumanPlayerHand(hand) {
    const humanPlayerHandElement = document.getElementById('human-player-hand');
    humanPlayerHandElement.innerHTML = hand
      .map((cardText) => {
        const parts = cardText.split(' ');
        const rank = parts[0];
        const suit = parts[parts.length - 1];
        return `
          <div class="card-icon">
              <span class="rank">${rank}</span>
              <span class="suit">${suit}</span>
          </div>
        `;
      })
      .join('');
  
    // Attach click listeners to new cards
    const newCards = document.querySelectorAll('#human-player-hand .card-icon');
    newCards.forEach(card => {
      attachCardClickListener(card, (selectedCard) => {
        selectedCard = selectedCard.textContent; // Store the selected card
        console.log('Selected Card:', selectedCard);
      });
    });
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
function startGame() {
    showLoader();
    fetch('/start_game', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById('game-results').innerHTML = data.message;
            document.getElementById('game-results').classList.add('show');
            fetchGameState(); // Fetch game state after starting
        })
        .catch(error => console.error("Error:", error))
        .finally(() => hideLoader());
}

// Function to reset the game
function resetGame() {
    showLoader();
    fetch('/reset_game', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById("success-message").classList.add("show");
            setTimeout(() => {
                document.getElementById("success-message").classList.remove("show");
            }, 2000);
            document.getElementById('game-results').classList.remove('show');
        })
        .catch(error => console.error("Error:", error))
        .finally(() => hideLoader());
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
      playerTable.className = 'players-table'; // Add class for styling

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
async function showLeaderboard() {
  try {
    showLoader();
    const response = await fetch('/leaderboard');
    const leaderboard = await response.json();

    const resultsContainer = document.getElementById('game-results');
    resultsContainer.innerHTML = '';

    if (leaderboard.length > 0) {
      const leaderboardTable = document.createElement('table');
      leaderboardTable.className = 'leaderboard-table'; // Add class for styling

      // Create table header
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>Rank</th>
          <th>Player</th>
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
        console.log('Fetching game state...');
        const response = await fetch('http://127.0.0.1:5000/game_state'); // Full URL
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const gameState = await response.json();
        console.log('Game state data:', gameState);

        // Update the game state display
        updateGameState(gameState.state);

        // Update player hands
        updatePlayerHands(gameState.players);

        // Update leaderboard preview
        updateLeaderboardPreview(gameState.leaderboard);

        // Log recent actions
        updateRecentActions(gameState.recentActions);

        // Add or remove glowing effect based on game state
        setGameActive(gameState.state === 'in_progress');
    } catch (error) {
        console.error('Error fetching game state:', error);
    }
}

// Helper function to attach card click listeners
function attachCardClickListener(card, onClick) {
  card.addEventListener('click', () => {
    // Remove 'selected' class from all cards
    document.querySelectorAll('#human-player-hand .card-icon').forEach(c => c.classList.remove('selected'));
    // Add 'selected' class to the clicked card
    card.classList.add('selected');
    // Call the provided onClick handler
    onClick(card);
  });
}

// Update makeCardsClickable to use the helper
// Function to make cards clickable
function makeCardsClickable() {
    const cards = document.querySelectorAll('#human-player-hand .card-icon');
    cards.forEach(card => {
      attachCardClickListener(card, (selectedCard) => {
        selectedCard = selectedCard.textContent; // Store the selected card
        console.log('Selected Card:', selectedCard);
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
        const humanPlayerHand = document.getElementById('human-player-hand');

        // Create a new card element
        const newCard = document.createElement('div');
        newCard.className = 'card-icon';
        newCard.textContent = data.card;

        // Add the new card to the hand
        humanPlayerHand.appendChild(newCard);

        // Trigger the draw animation
        newCard.style.animation = 'drawCard 0.5s ease-in-out';

        // Play sound effect for drawing a card
        playSoundEffect('sounds/draw_card.mp3');

        // Make the new card clickable
        makeCardsClickable();
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
        const humanPlayerHand = document.getElementById('human-player-hand');
        const selectedCard = humanPlayerHand.querySelector('.card-icon.selected');

        // Check if a card is selected
        if (!selectedCard) {
            alert('Please select a card to play!');
            return;
        }

        const cardValue = selectedCard.textContent;

        // Highlight the selected card
        selectedCard.classList.add('selected');

        // Add a short delay to allow the highlight to be visible
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay

        // Trigger the play animation
        selectedCard.style.animation = 'playCard 0.5s ease-in-out forwards';

        // Play sound effect for playing a card
        playSoundEffect('sounds/play_card.mp3');

        // Wait for the animation to complete
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

        // Send a request to the server to play the card
        const response = await fetch('/play_card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player_name: 'Human Player', card: cardValue }),
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug log

        // Remove the card from the hand
        selectedCard.remove();

        // Log the action
        logRecentAction(data.message);
    } catch (error) {
        console.error('Error playing card:', error);
        alert(error.message); // Show an error message to the user
    } finally {
        hideLoader();
    }
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

    // Utility function to create a modal
function createModal({ titleText, contentElement, onClose }) {
    const modal = document.createElement('div');
    modal.id = 'modal';
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000',
    });
  
    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      maxWidth: '500px',
      width: '100%',
    });
  
    const title = document.createElement('h2');
    title.textContent = titleText;
    title.style.marginBottom = '20px';
    modalContent.appendChild(title);
    modalContent.appendChild(contentElement);
    modal.appendChild(modalContent);
  
    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        onClose && onClose();
        document.body.removeChild(modal);
      }
    });
  
    document.body.appendChild(modal);
    return modal;
  }
  
  // Update openDeckBuilder to use the modal utility
function openDeckBuilder() {
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
  
    // Handle form submission
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const deckName = deckNameInput.value.trim();
      if (deckName) {
        const deck = {
          name: deckName,
          cards: ['Card 1', 'Card 2', 'Card 3'], // Example cards
        };
        savedDecks.push(deck);
        alert(`Deck "${deckName}" saved successfully!`);
        displaySavedDecks();
        document.body.removeChild(modal);
      } else {
        alert('Please enter a deck name.');
      }
    });
  
    // Create the modal
    const modal = createModal({
      titleText: 'Deck Builder',
      contentElement: form,
      onClose: () => {
        console.log('Modal closed');
      },
    });
  }

    // Function to close the modal
        const closeModal = () => {
            document.body.removeChild(modal);
        };
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

// Poll the backend for updates every 5 seconds
setInterval(fetchGameState, 5000);