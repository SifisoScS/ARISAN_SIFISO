from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from game.game_manager import GameManager

app = Flask(__name__)
# Allow CORS only for your frontend domain (replace with your actual frontend URL)
CORS(app, origins=["http://localhost:8080"])  # Example for Vue.js dev server

# Initialize the game manager
game_manager = GameManager(num_players=5, include_human=True)

@app.route("/")
def home():
    return jsonify({"message": "Welcome to ARISAN SIFISO API!"})

@app.route("/start_game", methods=["POST"])
def start_game():
    """Start a new game session."""
    try:
        game_manager.deal_cards()
        game_manager.allow_swaps()
        game_manager.display_scores()
        game_manager.determine_winner()
        return jsonify({"message": "Game started!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    """Retrieve the current leaderboard."""
    try:
        return jsonify(game_manager.leaderboard)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)