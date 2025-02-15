document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("success-message").classList.remove("show");
});

function startGame() {
    showLoader();
    fetch('/start_game', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById('game-results').innerHTML = data.message;
            document.getElementById('game-results').classList.add('show');
        })
        .catch(error => console.error("Error:", error))
        .finally(() => hideLoader());
}

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

function viewPlayers() {
    showLoader();
    fetch('/view_players')
        .then(response => response.json())
        .then(data => alert(JSON.stringify(data, null, 2)))
        .catch(error => console.error("Error:", error))
        .finally(() => hideLoader());
}

function showLeaderboard() {
    showLoader();
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => alert(JSON.stringify(data, null, 2)))
        .catch(error => console.error("Error:", error))
        .finally(() => hideLoader());
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}
