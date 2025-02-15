from flask import Flask, render_template, jsonify
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from game.game_manager import GameManager  

app = Flask(__name__)

game_manager = GameManager()

@app.route("/")
def home():
    return render_template("index.html")  # This will serve an actual webpage

@app.route('/start_game', methods=['POST'])
def start_game():
    game_manager.deal_cards()
    game_manager.allow_swaps()
    game_manager.determine_winner()
    return jsonify({"message": "Game has started! Check the results section."})

@app.route('/reset_game', methods=['POST'])
def reset_game():
    global game_manager
    game_manager = GameManager()
    return jsonify({"message": "Game reset successfully!"})

@app.route('/view_players', methods=['GET'])
def view_players():
    players = [{"name": p.name, "strategy": p.strategy} for p in game_manager.players]
    return jsonify(players)

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    return jsonify({"leaderboard": game_manager.get_leaderboard()})

if __name__ == '__main__':
    app.run(debug=True)
