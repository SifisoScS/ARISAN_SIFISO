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

// Function to make cards clickable
function makeCardsClickable() {
    const cards = document.querySelectorAll('#human-player-hand .card-icon');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove the 'selected' class from all cards
            cards.forEach(c => c.classList.remove('selected'));

            // Add the 'selected' class to the clicked card
            card.classList.add('selected');

            // Play the selected card
            playCard(card);
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
async function playCard(cardElement) {
    try {
        showLoader();
        const cardValue = cardElement.textContent;

        console.log(`Playing card: ${cardValue}`); // Debug log

        // Highlight the selected card
        cardElement.classList.add('selected');

        // Add a short delay to allow the highlight to be visible
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay

        // Trigger the play animation
        cardElement.style.animation = 'playCard 0.5s ease-in-out forwards';

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
        cardElement.remove();

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

// Poll the backend for updates every 5 seconds
setInterval(fetchGameState, 5000);