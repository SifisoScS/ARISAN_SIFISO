import tkinter as tk
from game.game_manager import GameManager
from gui.arisan_gui import CardGameGUI
from cli.arisan_cli import main

def start_game():
    """Ask user whether to launch CLI or GUI."""
    print("\n🎴 Welcome to ARISAN SIFISO 🎴")
    print("1. Play with CLI (Command Line)")
    print("2. Play with GUI (Graphical Interface)")
    
    choice = input("Enter your choice (1 or 2): ").strip()

    if choice == "1":
        main()  # Start CLI version
    elif choice == "2":
        root = tk.Tk()
        app = CardGameGUI(root)  # Start GUI version
        root.mainloop()
    else:
        print("❌ Invalid choice. Please enter 1 or 2.")
        start_game()

if __name__ == "__main__":
    start_game()
