import sys
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

# Fix Python path issue
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Now import game logic
from game.game_manager import GameManager

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

game_manager = GameManager(num_players=5, include_human=True)

@app.route("/")
def home():
    return render_template("index.html")  # Serve FastUI page

@app.route("/start_game", methods=["POST"])
def start_game():
    game_manager.deal_cards()
    game_manager.allow_swaps()
    game_manager.display_scores()
    game_manager.determine_winner()
    return jsonify({"message": "Game started!"})

if __name__ == "__main__":
    app.run(debug=True)
