from agents.agent import Agent
import random

class CardPlayerAgent(Agent):
    """Represents an AI player in the card game with different strategies."""

    def __init__(self, name, strategy="balanced"):
        super().__init__(name)
        self.hand = []  # AI gets 5 cards
        self.strategy = strategy  # AI's playstyle: aggressive, balanced, defensive
        self.swapped_card = None  # Track swapped card to prevent duplicate swaps

    def receive_cards(self, cards):
        """Assigns a hand of cards to the player."""
        self.hand = cards
        print(f"{self.name} ({self.strategy}) received hand: {self.hand}")

    def choose_worst_card(self):
        """Selects the worst card to swap based on AI strategy."""
        valid_cards = [card for card in self.hand if card != self.swapped_card]  # Avoid swapping same card

        if self.strategy == "aggressive":
            return min(valid_cards, key=lambda card: card.value, default=None)  # Lowest value
        elif self.strategy == "defensive":
            return min(valid_cards, key=lambda card: card.suit_value, default=None)  # Lowest suit value
        else:  # Balanced
            return min(valid_cards, key=lambda card: (card.value + card.suit_value), default=None)

    def swap_card(self, deck):
        """Swaps one card from the AI's hand."""
        if not self.hand or len(self.hand) < 5:  # Ensure hand is valid
            print(f"{self.name} ({self.strategy}) cannot swap cards (hand issue).")
            return

        worst_card = self.choose_worst_card()
        if worst_card is None:
            print(f"{self.name} ({self.strategy}) found no card to swap.")
            return

        new_card = deck.deal(1)[0]
        self.hand.remove(worst_card)
        self.hand.append(new_card)
        self.swapped_card = new_card  # Prevent swapping same card again

        print(f"{self.name} ({self.strategy}) swapped {worst_card} for {new_card}")

    def choose_best_cards(self):
        """Selects the best 3 cards based on AI strategy."""
        if self.strategy == "aggressive":
            return sorted(self.hand, key=lambda card: card.value, reverse=True)[:3]
        elif self.strategy == "defensive":
            return sorted(self.hand, key=lambda card: card.suit_value, reverse=True)[:3]
        else:  # Balanced
            return sorted(self.hand, key=lambda card: (card.value + card.suit_value), reverse=True)[:3]

    def calculate_score(self):
        """Computes the score based on the 3 best selected cards."""
        best_cards = self.choose_best_cards()
        return sum(card.value for card in best_cards)

    def calculate_suit_score(self):
        """Computes the tiebreaker score (sum of all 5 suit values)."""
        return sum(card.suit_value for card in self.hand)

    def execute_task(self, task):
        """Dummy implementation to satisfy abstract class."""
        return f"{self.name} is playing with strategy: {self.strategy}."

    def __repr__(self):
        return f"{self.name} ({self.strategy}) - Hand: {self.hand}, Score: {self.calculate_score()}, Suit Score: {self.calculate_suit_score()}"
