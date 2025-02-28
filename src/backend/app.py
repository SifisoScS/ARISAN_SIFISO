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
    game_manager.start_game()  # Start a new game
    return jsonify({"message": "Game has started! Check the results section."})

@app.route('/reset_game', methods=['POST'])
def reset_game():
    global game_manager
    game_manager = GameManager()
    return jsonify({"message": "Game reset successfully!"})

@app.route('/view_players', methods=['GET'])
def view_players():
    players = game_manager.players  # Fetch players from the GameManager instance
    player_data = [{"name": player.name, "score": player.calculate_score()} for player in players]
    return jsonify(player_data)

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    leaderboard_data = game_manager.get_leaderboard()  # Fetch leaderboard from the GameManager instance
    return jsonify(leaderboard_data)

if __name__ == '__main__':
    app.run(debug=True)
