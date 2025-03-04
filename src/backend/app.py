from flask import Flask, render_template, jsonify, request
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from game.game_manager import GameManager  

app = Flask(__name__)

# Update to include the human player
game_manager = GameManager(include_human=True)

@app.route("/")
def home():
    return render_template("index.html")  # This will serve an actual webpage

@app.route('/game_state', methods=['GET'])
def get_game_state():
    # Update the game state with player hands and leaderboard
    game_manager.game_state['players'] = [
        {"name": player.name, "hand": [f"{card.rank} of {card.suit}" for card in player.hand]}
        for player in game_manager.players
    ]
    game_manager.game_state['leaderboard'] = game_manager.get_leaderboard()
    return jsonify(game_manager.game_state)  # Return the updated game state

@app.route('/start_game', methods=['POST'])
def start_game():
    game_manager.start_game()  # Start a new game
    return jsonify({"message": "Game has started! Check the results section."})

@app.route('/reset_game', methods=['POST'])
def reset_game():
    global game_manager
    game_manager = GameManager(include_human=True)
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

@app.route('/draw_card', methods=['POST'])
def draw_card():
    player_name = request.json.get('player_name')
    print(f"Received request to draw a card for: {player_name}")  # Added debug print
    try:
        card = game_manager.draw_card(player_name)
        return jsonify({"card": f"{card.rank} of {card.suit}"})  # Return the card as a string
    except ValueError as e:
        print(f"Error occurred: {str(e)}")  # Added logging for errors
        return jsonify({"error": str(e)}), 400  # Return an error message if something goes wrong

@app.route('/play_card', methods=['POST'])
def play_card():
    player_name = request.json.get('player_name')
    card = request.json.get('card')

    try:
        game_manager.play_card(player_name, card)
        return jsonify({"message": f"{player_name} played {card}"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400  # Return an error message if something goes wrong

if __name__ == '__main__':
    app.run(debug=True)