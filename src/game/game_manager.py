import random
from game.card_deck import Deck
from agents.card_player_agent import CardPlayerAgent

class GameManager:
    """Manages the multiplayer card game, including dealing and scoring."""

    def __init__(self, num_players=5):
        self.deck = Deck()
        strategies = ["aggressive", "balanced", "defensive"]
        self.players = [
            CardPlayerAgent(f"Player {i+1}", strategy=random.choice(strategies))
            for i in range(num_players)
        ]

    def deal_cards(self):
        """Deals 5 cards to each player."""
        for player in self.players:
            player.receive_cards(self.deck.deal(5))

    def allow_swaps(self):
        """Allows players to swap one card."""
        print("\n🔄 AI Players Swapping Cards 🔄\n")
        for player in self.players:
            player.swap_card(self.deck)

    def display_scores(self):
        """Displays each player's hand and score."""
        print("\n🔹 GameManager: Players & Scores After Swaps 🔹\n")
        for player in self.players:
            print(player)

    def determine_winner(self):
        """Determines the winner based on the highest score, with tie-breaking."""
        highest_score = max(player.calculate_score() for player in self.players)
        tied_players = [player for player in self.players if player.calculate_score() == highest_score]

        if len(tied_players) == 1:
            winner = tied_players[0]
            print(f"\n🏆 Winner: {winner.name} ({winner.strategy}) with Score: {winner.calculate_score()}\n")
        else:
            highest_suit_score = max(player.calculate_suit_score() for player in tied_players)
            final_winners = [player for player in tied_players if player.calculate_suit_score() == highest_suit_score]

            if len(final_winners) == 1:
                winner = final_winners[0]
                print(f"\n🏆 Winner after tie-break: {winner.name} ({winner.strategy}) with Suit Score: {winner.calculate_suit_score()}\n")
            else:
                print("\n⚖️ The game is a tie between:")
                for player in final_winners:
                    print(f"{player.name} ({player.strategy}) - Score: {player.calculate_score()}, Suit Score: {player.calculate_suit_score()}")

# Example Usage
if __name__ == "__main__":
    game_manager = GameManager()
    game_manager.deal_cards()
    game_manager.allow_swaps()
    game_manager.display_scores()
    game_manager.determine_winner()
