import unittest
from game.card_deck import Deck
from game.game_manager import GameManager
from agents.card_player_agent import CardPlayerAgent



class TestCardGame(unittest.TestCase):
    def setUp(self):
        self.manager = GameManager(num_players=2, include_human=True)
        self.manager.start_game()

    def test_draw_and_play_card(self):
        player_name = "Human Player"
        drawn_card = self.manager.draw_card(player_name)
        self.assertIn(drawn_card, self.manager.players[1].hand, "The drawn card should be in the player's hand.")

        # Attempt to play the drawn card
        card_to_play = f"{drawn_card.rank} of {drawn_card.suit}"
        self.manager.play_card(player_name, card_to_play)

        # Check if the card has been removed from the player's hand
        self.assertNotIn(drawn_card, self.manager.players[1].hand, "The card should be removed from the player's hand after playing.")

if __name__ == "__main__":
    unittest.main()
