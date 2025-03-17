import sys
import time
import colorama
from colorama import Fore, Style
from game.game_manager import GameManager

colorama.init(autoreset=True)

def print_colored(text, color=Fore.WHITE):
    """Print text in a specific color."""
    print(color + text + Style.RESET_ALL)

def main():
    """CLI interface for the ARISAN SIFISO card game."""
    while True:
        print_colored("\n🎴 Welcome to the ARISAN SIFISO Card Game 🎴", Fore.CYAN)
        print_colored("1. Play against AI", Fore.GREEN)
        print_colored("2. Watch AI battle each other", Fore.YELLOW)
        print_colored("3. View Leaderboard", Fore.MAGENTA)
        print_colored("4. Exit", Fore.RED)

        choice = input(f"{Fore.WHITE}Enter your choice (1, 2, 3, or 4): ").strip()

        if choice == "4":
            print_colored("\n👋 Thanks for playing! Goodbye!\n", Fore.MAGENTA)
            sys.exit(0)

        elif choice == "3":
            game_manager = GameManager()
            game_manager.display_leaderboard()
            continue

        elif choice == "1":
            print_colored("\n🃏 Starting game with Human Player vs AI...\n", Fore.BLUE)
            game_manager = GameManager(include_human=True)

        elif choice == "2":
            print_colored("\n🤖 AI-Only Mode: Watching AI battle each other...\n", Fore.BLUE)
            game_manager = GameManager(include_human=False)

        else:
            print_colored("\n❌ Invalid choice. Please enter 1, 2, 3, or 4.", Fore.RED)
            continue

        print_colored("\n🃏 Dealing cards...\n", Fore.CYAN)
        game_manager.deal_cards()
        time.sleep(1)  

        print_colored("\n🔄 Swapping phase...\n", Fore.YELLOW)
        game_manager.allow_swaps()
        time.sleep(1)

        print_colored("\n🔹 Final Scores & Winner 🔹\n", Fore.GREEN)
        game_manager.display_scores()
        game_manager.determine_winner()

        replay = input(Fore.WHITE + "\n🔄 Do you want to play again? (yes/no): ").strip().lower()
        if replay != "yes":
            print_colored("\n👋 Thanks for playing! See you next time!\n", Fore.MAGENTA)
            sys.exit(0)