import random
import json
import os
from game.card_deck import Deck
from agents.card_player_agent import CardPlayerAgent

LEADERBOARD_FILE = "leaderboard.json"

class GameManager:
    def start_game(self):
        """Starts a new game by dealing cards, allowing swaps, and determining the winner."""
        self.deal_cards()
        self.allow_swaps()
        self.determine_winner()

    def __init__(self, num_players=5, include_human=False):
        self.deck = Deck()
        self.players = []
        self.include_human = include_human
        strategies = ["aggressive", "defensive", "balanced", "strategic"]

        # Add AI Players
        for i in range(num_players - (1 if include_human else 0)):
            strategy = random.choice(strategies)
            self.players.append(CardPlayerAgent(f"Player {i+1}", strategy))

        # Add Human Player if included
        if include_human:
            self.players.append(CardPlayerAgent("Human Player", "human"))

        self.leaderboard = self.load_leaderboard()  # Load or create leaderboard
        self.game_state = {
            "state": "in_progress",
            "players": [],
            "leaderboard": [],
            "recentActions": [],
            "activeRuleShifts": []  # Track active rule shifts
        }

    def deal_cards(self):
        """Deals 5 cards to each player."""
        for player in self.players:
            player.receive_cards(self.deck.deal(5))

    def allow_swaps(self):
        """Allows AI players to swap cards based on their strategy."""
        print("\n🔄 AI Players Swapping Cards 🔄\n")
        for player in self.players:
            if player.strategy != "human":  # Human players don't swap cards automatically
                player.swap_card(self.deck)

    def display_scores(self):
        """Displays each player's hand and score."""
        print("\n🔹 GameManager: Players & Scores After Swaps 🔹\n")
        for player in self.players:
            print(player)

    def determine_winner(self):
        """Determines the winner and updates the leaderboard. MODIFIED."""
        # Helper function to calculate the highest score
        def calculate_highest_score(players):
            return max(player.calculate_score() for player in players)

        # Helper function to filter players by score
        def filter_players_by_score(players, score):
            return [player for player in players if player.calculate_score() == score]

        # Helper function to calculate the highest suit score
        def calculate_highest_suit_score(players):
            return max(player.calculate_suit_score() for player in players)

        # Helper function to filter players by suit score
        def filter_players_by_suit_score(players, suit_score):
            return [player for player in players if player.calculate_suit_score() == suit_score]

        # Calculate the highest score
        highest_score = calculate_highest_score(self.players)
        tied_players = filter_players_by_score(self.players, highest_score)

        if len(tied_players) == 1:
            # Single winner
            winner = tied_players[0]
            print(f"\n🏆 Winner: {winner.name} with Score: {winner.calculate_score()}\n")
            self.update_leaderboard(winner.name)
        else:
            # Tie-Breaker by Suit Score
            highest_suit_score = calculate_highest_suit_score(tied_players)
            final_winners = filter_players_by_suit_score(tied_players, highest_suit_score)

            if len(final_winners) == 1:
                # Winner after tie-break
                winner = final_winners[0]
                print(f"\n🏆 Winner after tie-break: {winner.name} with Suit Score: {winner.calculate_suit_score()}!\n")
                self.update_leaderboard(winner.name)
            else:
                # Multiple winners after tie-breaker
                print("\n⚖️ The game is a tie between:")
                for player in final_winners:
                    print(f"{player.name} - Score: {player.calculate_score()}, Suit Score: {player.calculate_suit_score()}")
                return  # No update to leaderboard if tied after tie-breaker

        self.save_leaderboard()  # Save leaderboard after updating

    def draw_card(self, player_name):
        """
        Draws a card from the deck and adds it to the specified player's hand.
        Args:
            player_name (str): The name of the player drawing the card.
        Returns:
            dict: The drawn card.
        Raises:
            ValueError: If the deck is empty or the player is not found.
        """
        if not self.deck.cards:
            raise ValueError("No cards left in the deck!")

        card = self.deck.cards.pop()  # Draw the top card from the deck

        # Use named expression to simplify assignment and conditional
        if player := next((p for p in self.players if p.name == player_name), None):
            player.hand.append(card)  # Add the card to the player's hand
        else:
            raise ValueError(f"Player '{player_name}' not found!")

        print(f"{player_name}'s hand after drawing: {[f'{c.rank} of {c.suit}' for c in player.hand]}")  # Debug print
        return card

    def play_card(self, player_name, card):
        """
        Plays a card from the specified player's hand.
        Args:
            player_name (str): The name of the player playing the card.
            card (str): The card to play (e.g., "Ace of Spades").
        Raises:
            ValueError: If the player is not found or the card is not in their hand.
        """
        player = next((p for p in self.players if p.name == player_name), None)

        if not player:
            raise ValueError(f"Player '{player_name}' not found!")

        # Find the card in the player's hand
        card_found = next((c for c in player.hand if f"{c.rank} of {c.suit}" == card), None)

        if not card_found:
            raise ValueError(f"Card '{card}' not found in {player_name}'s hand!")

        # Remove the card from the player's hand
        player.hand.remove(card_found)

        # Log the action and update game state
        self.game_state['recentActions'].append(f"{player_name} played {card}")
        print(f"{player_name} played {card}")  # Log the action to the terminal

    def load_leaderboard(self):
        """Loads the leaderboard from a file or creates a new one if missing."""
        if not os.path.exists(LEADERBOARD_FILE):
            return {}  # Return empty leaderboard if file doesn't exist

        with open(LEADERBOARD_FILE, "r") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return {}  # Reset leaderboard if file is corrupted

    def save_leaderboard(self):
        """Saves the leaderboard to a file."""
        with open(LEADERBOARD_FILE, "w") as file:
            json.dump(self.leaderboard, file, indent=4)

    def update_leaderboard(self, winner_name):
        """Updates the leaderboard with the winner's name."""
        if winner_name in self.leaderboard:
            self.leaderboard[winner_name] += 1
        else:
            self.leaderboard[winner_name] = 1

    def display_leaderboard(self):
        """Displays the leaderboard rankings."""
        print("\n🏆 Leaderboard Rankings 🏆\n")
        sorted_leaderboard = sorted(self.leaderboard.items(), key=lambda x: x[1], reverse=True)
        for rank, (player, wins) in enumerate(sorted_leaderboard, start=1):
            print(f"{rank}. {player} - {wins} wins")

    def get_leaderboard(self):
        """Returns a **sorted global leaderboard** for all past games."""
        sorted_leaderboard = sorted(self.leaderboard.items(), key=lambda x: x[1], reverse=True)
        return [{"name": player, "wins": wins} for player, wins in sorted_leaderboard]

    def get_game_state(self):
        """Returns the current state of the game."""
        return {
            "players": [
                {"name": player.name, "hand": [f"{card.rank} of {card.suit}" for card in player.hand]}
                for player in self.players
            ],
            "leaderboard": self.get_leaderboard(),
            "recentActions": self.game_state["recentActions"],
            "activeRuleShifts": self.game_state["activeRuleShifts"]  # Include active rule shifts
        }

    def apply_rule_shift(self, rule_shift):
        """
        Applies a rule shift to the game state.
        Args:
            rule_shift (dict): The rule shift to apply, containing `name`, `description`, `applyEffect`, and `removeEffect`.
        """
        rule_shift["applyEffect"](self.game_state)
        self.game_state["activeRuleShifts"].append(rule_shift)
        self.game_state["recentActions"].append(f"Rule Shift Applied: {rule_shift['name']}")

    def remove_rule_shift(self, rule_shift):
        """
        Removes a rule shift from the game state.
        Args:
            rule_shift (dict): The rule shift to remove.
        """
        rule_shift["removeEffect"](self.game_state)
        self.game_state["activeRuleShifts"] = [
            rs for rs in self.game_state["activeRuleShifts"] if rs["name"] != rule_shift["name"]
        ]
        self.game_state["recentActions"].append(f"Rule Shift Removed: {rule_shift['name']}")