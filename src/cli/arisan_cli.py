import sys
from game.game_manager import GameManager

def main():
    """CLI interface for the ARISAN SIFISO card game."""
    print("\n🎴 Welcome to the ARISAN SIFISO Card Game 🎴")
    print("1. Play against AI")
    print("2. Watch AI battle each other")
    choice = input("Enter your choice (1 or 2): ").strip()

    if choice == "1":
        game_manager = GameManager(include_human=True)
    else:
        game_manager = GameManager(include_human=False)

    print("\n🃏 Dealing cards...\n")
    game_manager.deal_cards()

    print("\n🔄 Swapping phase...\n")
    game_manager.allow_swaps()

    print("\n🔹 Final Scores & Winner 🔹\n")
    game_manager.display_scores()
    game_manager.determine_winner()

if __name__ == "__main__":
    main()
