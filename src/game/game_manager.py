from game.card_deck import Deck

class GameManager:
    """Manages the multiplayer card game, including dealing and scoring."""

    def __init__(self):
        self.deck = Deck()
        self.players = {}

    def deal_cards(self, num_players=5, num_cards=5):
        """Deals cards to each player."""
        for i in range(1, num_players + 1):
            self.players[f"Player {i}"] = self.deck.deal(num_cards)

    def display_hands(self):
        """Displays each player's hand."""
        print("\n🔹 GameManager: Dealt Cards to Players 🔹\n")
        for player, hand in self.players.items():
            print(f"{player}: {hand}")

# Example Usage
if __name__ == "__main__":
    game_manager = GameManager()
    game_manager.deal_cards()
    game_manager.display_hands()
