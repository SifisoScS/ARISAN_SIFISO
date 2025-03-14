from flask import Flask, render_template, jsonify, request
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from game.game_manager import GameManager  

app = Flask(__name__, template_folder="templates", static_folder="static")

# Initialize the game manager
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
    try:
        card = game_manager.draw_card(player_name)
        # Added suit mappings
        suit_symbols = {"Clubs": "♣", "Diamonds": "♦", "Hearts": "♥", "Spades": "♠"}
        suit_symbol = suit_symbols.get(card.suit, card.suit)  # Use the symbol or default to the name

        return jsonify({"card": f"{card.rank} {suit_symbol}"})  # Return the card as a string
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route('/play_card', methods=['POST'])
def play_card():
    data = request.get_json()
    player_name = data.get('player_name')
    card = data.get('card')

    if not player_name or not card:
        return jsonify({'error': 'Invalid request'}), 400

    # Add logic to play the card (e.g., update game state)
    print(f"Player {player_name} played card: {card}")

    return jsonify({'message': f'Card {card} played successfully'}), 200

@app.route('/apply_rule_shift', methods=['POST'])
def apply_rule_shift():
    rule_shift = request.json
    try:
        # Apply the rule shift to the game state
        game_manager.apply_rule_shift(rule_shift)
        return jsonify({
            "message": f"Rule Shift Applied: {rule_shift['name']}",
            "gameState": game_manager.game_state
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)