class GameUI {
    constructor() {
        this.init();
    }

    init() {
        // Initialize event listeners or other setup
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    }

    updateGameState(state) {
        const gameStateElement = document.getElementById('game-state');
        gameStateElement.textContent = state;
    }

    renderCard(card) {
        return `<div class="card-icon">${card}</div>`;
    }

    renderPlayer(player) {
        return `
            <div>
                <strong>${player.name}:</strong>
                ${player.hand.map(this.renderCard).join('')}
            </div>
        `;
    }

    updatePlayerHands(players) {
        const playerHandsElement = document.getElementById('player-hands');
        playerHandsElement.innerHTML = players.map(this.renderPlayer).join('');
    }

    renderLeaderboardEntry(entry, rank) {
        return `
            <div>
                <strong>${rank}. ${entry.name}:</strong> ${entry.score}
            </div>
        `;
    }

    updateLeaderboardPreview(leaderboard) {
        const leaderboardPreviewElement = document.getElementById('leaderboard-preview');
        if (!leaderboard || leaderboard.length === 0) {
            leaderboardPreviewElement.innerHTML = `<div>No leaderboard entries available</div>`;
            return;
        }
        const maxEntries = 3;
        let displayedEntries = leaderboard.slice(0, maxEntries).map((entry, index) =>
            this.renderLeaderboardEntry(entry, index + 1)
        );
        if (leaderboard.length < maxEntries) {
            displayedEntries.push(`<div>Only ${leaderboard.length} entr${leaderboard.length === 1 ? 'y' : 'ies'} available</div>`);
        }
        leaderboardPreviewElement.innerHTML = displayedEntries.join('');
    }

    logRecentAction(action) {
        const recentActionsElement = document.getElementById('recent-actions');
        const actionElement = document.createElement('div');
        actionElement.textContent = action;
        recentActionsElement.appendChild(actionElement);
        recentActionsElement.scrollTop = recentActionsElement.scrollHeight;
    }

    showLoader() {
        document.getElementById('loader').style.display = 'block';
    }

    hideLoader() {
        document.getElementById('loader').style.display = 'none';
    }

    async fetchGameState() {
        try {
            console.log('Fetching game state...');
            const response = await fetch('/game_state');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const gameState = await response.json();
            console.log('Game state data:', gameState);

            this.updateGameState(gameState.state);
            this.updatePlayerHands(gameState.players);
            this.updateLeaderboardPreview(gameState.leaderboard);
            gameState.recentActions.forEach(action => this.logRecentAction(action));
            this.setGameActive(gameState.state === 'in_progress');
        } catch (error) {
            console.error('Error fetching game state:', error);
        }
    }

    setGameActive(isActive) {
        const buttons = document.querySelectorAll('.button-container button');
        buttons.forEach(button => {
            if (isActive) {
                button.classList.add('glow');
            } else {
                button.classList.remove('glow');
            }
        });
    }

    async startGame() {
        this.showLoader();
        fetch('/start_game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                document.getElementById('game-results').innerHTML = data.message;
                document.getElementById('game-results').classList.add('show');
                this.setGameActive(true);
            })
            .catch(error => console.error("Error:", error))
            .finally(() => this.hideLoader());
    }

    async resetGame() {
        this.showLoader();
        fetch('/reset_game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                document.getElementById("success-message").classList.add("show");
                setTimeout(() => {
                    document.getElementById("success-message").classList.remove("show");
                }, 2000);
                document.getElementById('game-results').classList.remove('show');
                this.setGameActive(false);
            })
            .catch(error => console.error("Error:", error))
            .finally(() => this.hideLoader());
    }

    async viewPlayers() {
        try {
            this.showLoader();
            const response = await fetch('/view_players');
            const players = await response.json();

            const resultsContainer = document.getElementById('game-results');
            resultsContainer.innerHTML = ''; // Clear previous content

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
            this.hideLoader();
        }
    }

    async showLeaderboard() {
        try {
            this.showLoader();
            const response = await fetch('/leaderboard');
            const leaderboard = await response.json();

            const resultsContainer = document.getElementById('game-results');
            resultsContainer.innerHTML = ''; // Clear previous content

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
            this.hideLoader();
        }
    }
}

// Initialize the GameUI
const gameUI = new GameUI();

// Poll the backend for updates every 5 seconds
setInterval(() => gameUI.fetchGameState(), 5000);