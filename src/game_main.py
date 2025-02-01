from game.game_manager import GameManager

# Initialize Game Manager
game_manager = GameManager()

# Deal cards to AI players
game_manager.deal_cards()
game_manager.display_scores()
game_manager.determine_winner()