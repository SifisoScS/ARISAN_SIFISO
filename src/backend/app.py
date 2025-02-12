import sys
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

# ✅ Fix Python path issue
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ✅ Now import game logic
from game.game_manager import GameManager

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# Initialize Game Manager
game_manager = GameManager(num_players=5, include_human=True)

@app.route("/")
def home():
    return render_template("index.html")  # Serve FastUI page

@app.route("/start_game", methods=["POST"])
def start_game():
    """Starts the game and returns the winner."""
    game_manager.deal_cards()
    game_manager.allow_swaps()
    game_manager.display_scores()
    game_manager.determine_winner()
    return jsonify({"message": "Game started! Check leaderboard."})

@app.route("/leaderboard")
def leaderboard():
    """Returns the game leaderboard."""
    return jsonify({"leaderboard": game_manager.get_leaderboard()})

@app.route("/players")
def players():
    """Returns the current players and their hands."""
    player_data = [str(player) for player in game_manager.players]
    return jsonify({"players": player_data})

@app.route("/reset_game", methods=["POST"])
def reset_game():
    """Resets the game state."""
    global game_manager
    game_manager = GameManager(num_players=5, include_human=True)
    return jsonify({"message": "Game reset successfully!"})

@app.route("/view_players", methods=["GET"])
def view_players():
    """Returns all players' details: name, score, and strategy."""
    players_data = [
        {
            "name": player.name,
            "score": player.calculate_score(),
            "suit_score": player.calculate_suit_score(),
            "strategy": player.strategy
        }
        for player in game_manager.players
    ]
    return jsonify({"players": players_data})

if __name__ == "__main__":
    app.run(debug=True)
