import random
import json
import os
from game.card_deck import Deck
from agents.card_player_agent import CardPlayerAgent

LEADERBOARD_FILE = "leaderboard.json"

class GameManager:
    """Manages the multiplayer card game, including AI players and leaderboard tracking."""

    def __init__(self, num_players=5, include_human=False):
        self.deck = Deck()
        self.players = []
        strategies = ["aggressive", "defensive", "balanced", "strategic"]

        # Add AI Players
        for i in range(num_players - (1 if include_human else 0)):
            strategy = random.choice(strategies)
            self.players.append(CardPlayerAgent(f"Player {i+1}", strategy))

        self.leaderboard = self.load_leaderboard()  # Load or create leaderboard

    def deal_cards(self):
        """Deals 5 cards to each player."""
        for player in self.players:
            player.receive_cards(self.deck.deal(5))

    def allow_swaps(self):
        """Allows AI players to swap cards based on their strategy."""
        print("\n🔄 AI Players Swapping Cards 🔄\n")
        for player in self.players:
            player.swap_card(self.deck)

    def display_scores(self):
        """Displays each player's hand and score."""
        print("\n🔹 GameManager: Players & Scores After Swaps 🔹\n")
        for player in self.players:
            print(player)

    def determine_winner(self):
        """Determines the winner and updates the leaderboard."""
        highest_score = max(player.calculate_score() for player in self.players)
        tied_players = [player for player in self.players if player.calculate_score() == highest_score]

        if len(tied_players) == 1:
            winner = tied_players[0]
            print(f"\n🏆 Winner: {winner.name} with Score: {winner.calculate_score()}\n")
            self.update_leaderboard(winner.name)
        else:
            # Handle Tie-Breaker by Suit Score
            highest_suit_score = max(player.calculate_suit_score() for player in tied_players)
            final_winners = [player for player in tied_players if player.calculate_suit_score() == highest_suit_score]

            if len(final_winners) == 1:
                winner = final_winners[0]
                print(f"\n🏆 Winner after tie-break: {winner.name} with Suit Score: {winner.calculate_suit_score()}!\n")
                self.update_leaderboard(winner.name)
            else:
                print("\n⚖️ The game is a tie between:")
                for player in final_winners:
                    print(f"{player.name} - Score: {player.calculate_score()}, Suit Score: {player.calculate_suit_score()}")
                return  # No update to leaderboard if tied after tie-breaker

        self.save_leaderboard()  # Save leaderboard after updating

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
