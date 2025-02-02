from game.game_manager import GameManager

# Initialize Game Manager
game_manager = GameManager()

# Deal cards, allow swaps, display hands, and determine the winner
game_manager.deal_cards()
game_manager.allow_swaps()
game_manager.display_scores()
game_manager.determine_winner()
