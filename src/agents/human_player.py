from game.card_deck import Deck
from agents.card_player_agent import CardPlayerAgent

class HumanPlayer(CardPlayerAgent):
    """Represents a human player in the game."""

    def __init__(self, name):
        super().__init__(name, strategy="human")

    def swap_card(self, deck, is_human=False):
        """Allows the human player to swap a card manually."""
        print(f"\n🃏 {self.name}, here is your current hand:\n{self.hand}")
        
        choice = input("Do you want to swap a card? (yes/no): ").strip().lower()
        if choice != "yes":
            print(f"{self.name} chose to keep their hand.")
            return

        print("Choose a card to swap by entering the index (1-5):")
        for i, card in enumerate(self.hand, 1):
            print(f"{i}. {card}")

        while True:
            try:
                index = int(input("Enter the number of the card to swap: ")) - 1
                if 0 <= index < len(self.hand):
                    break
                else:
                    print("Invalid choice. Please enter a number between 1 and 5.")
            except ValueError:
                print("Invalid input. Please enter a number.")

        # Perform the swap
        old_card = self.hand.pop(index)
        new_card = deck.deal(1)[0]
        self.hand.append(new_card)

        print(f"{self.name} swapped {old_card} for {new_card}")
