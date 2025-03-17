import tkinter as tk
from tkinter import messagebox
from game.game_manager import GameManager

class CardGameGUI:
    """Graphical User Interface for ARISAN SIFISO Card Game."""

    def __init__(self, root):
        self.root = root
        self.root.title("ARISAN SIFISO - AI Card Game")

        # Title Label
        self.title_label = tk.Label(root, text="🎴 ARISAN SIFISO Card Game 🎴", font=("Arial", 16, "bold"))
        self.title_label.pack(pady=10)

        # Buttons
        self.play_ai_button = tk.Button(root, text="Play Against AI", command=self.play_vs_ai, width=20, height=2)
        self.play_ai_button.pack(pady=5)

        self.watch_ai_button = tk.Button(root, text="Watch AI Battle", command=self.watch_ai, width=20, height=2)
        self.watch_ai_button.pack(pady=5)

        self.exit_button = tk.Button(root, text="Exit", command=root.quit, width=20, height=2)
        self.exit_button.pack(pady=5)

    def play_vs_ai(self):
        """Starts a game with a human player vs AI."""
        self.game_manager = GameManager(include_human=True)
        self.start_game()

    def watch_ai(self):
        """Starts an AI-only game."""
        self.game_manager = GameManager(include_human=False)
        self.start_game()

    def start_game(self):
        """Runs the game and displays results in a popup."""
        self.game_manager.deal_cards()
        self.game_manager.allow_swaps()
        self.game_manager.display_scores()
        
        # Get winner and display results
        winner_text = self.get_winner_text()
        messagebox.showinfo("Game Results", winner_text)

    def get_winner_text(self):
        """Retrieves the winner and final scores for the UI."""
        highest_score = max(player.calculate_score() for player in self.game_manager.players)
        tied_players = [player for player in self.game_manager.players if player.calculate_score() == highest_score]

        result_text = "\n🔹 Final Scores 🔹\n"
        for player in self.game_manager.players:
            result_text += f"{player.name} - Score: {player.calculate_score()}, Suit Score: {player.calculate_suit_score()}\n"

        if len(tied_players) == 1:
            result_text += f"\n🏆 Winner: {tied_players[0].name} with Score: {highest_score}!"
        else:
            highest_suit_score = max(player.calculate_suit_score() for player in tied_players)
            final_winners = [player for player in tied_players if player.calculate_suit_score() == highest_suit_score]

            if len(final_winners) == 1:
                result_text += f"\n🏆 Winner after tie-break: {final_winners[0].name} with Suit Score: {final_winners[0].calculate_suit_score()}!"
            else:
                result_text += "\n⚖️ The game is a tie between:\n"
                for player in final_winners:
                    result_text += f"{player.name} - Score: {player.calculate_score()}, Suit Score: {player.calculate_suit_score()}\n"
        
        return result_text

# Run the GUI
if __name__ == "__main__":
    root = tk.Tk()
    app = CardGameGUI(root)
    root.mainloop()