import random
from game.card_deck import Deck
from agents.card_player_agent import CardPlayerAgent
from agents.human_player import HumanPlayer  # ✅ FIX: Import HumanPlayer

class GameManager:
    """Manages the multiplayer card game, including AI and human players."""

    def __init__(self, num_players=5, include_human=False):
        self.deck = Deck()
        self.players = []

        strategies = ["aggressive", "balanced", "defensive"]

        # Add AI Players
        for i in range(num_players - (1 if include_human else 0)):
            strategy = random.choice(strategies)
            self.players.append(CardPlayerAgent(f"Player {i+1}", strategy))

        # Add Human Player
        if include_human:
            self.human_player = HumanPlayer("You")  # Create a human player
            self.players.append(self.human_player)

    def deal_cards(self):
        """Deals 5 cards to each player."""
        for player in self.players:
            player.receive_cards(self.deck.deal(5))

    def allow_swaps(self):
        """Allows players to swap one card."""
        print("\n🔄 Players Swapping Cards 🔄\n")
        for player in self.players:
            if isinstance(player, HumanPlayer):  # ✅ Now HumanPlayer is recognized
                player.swap_card(self.deck, is_human=True)  # Human decision
            else:
                player.swap_card(self.deck)  # AI swap

    def display_scores(self):
        """Displays each player's hand and score."""
        print("\n🔹 Final Player Scores 🔹\n")
        for player in self.players:
            print(player)

    def determine_winner(self):
        """Determines the winner based on the highest score."""
        highest_score = max(player.calculate_score() for player in self.players)
        tied_players = [player for player in self.players if player.calculate_score() == highest_score]

        if len(tied_players) == 1:
            winner = tied_players[0]
            print(f"\n🏆 Winner: {winner.name} with Score: {winner.calculate_score()}\n")
        else:
            highest_suit_score = max(player.calculate_suit_score() for player in tied_players)
            final_winners = [player for player in tied_players if player.calculate_suit_score() == highest_suit_score]

            if len(final_winners) == 1:
                winner = final_winners[0]
                print(f"\n🏆 Winner after tie-break: {winner.name} with Suit Score: {winner.calculate_suit_score()}\n")
            else:
                print("\n⚖️ The game is a tie between:")
                for player in final_winners:
                    print(f"{player.name} - Score: {player.calculate_score()}, Suit Score: {player.calculate_suit_score()}")
