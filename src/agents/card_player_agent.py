from agents.agent import Agent

class CardPlayerAgent(Agent):
    """Represents an AI player in the card game."""

    def __init__(self, name):
        super().__init__(name)
        self.hand = []  # Each agent gets 5 cards

    def receive_cards(self, cards):
        """Assigns a hand of cards to the player."""
        self.hand = cards
        print(f"{self.name} received hand: {self.hand}")

    def calculate_score(self):
        """Computes the score based on the 3 highest card values."""
        sorted_cards = sorted(self.hand, key=lambda card: card.value, reverse=True)
        top_three = sorted_cards[:3]  # Select highest 3 cards
        score = sum(card.value for card in top_three)
        return score

    def calculate_suit_score(self):
        """Computes the tiebreaker score (sum of all 5 suit values)."""
        return sum(card.suit_value for card in self.hand)

    def execute_task(self, task):
        """Dummy implementation to satisfy the abstract class requirement."""
        return f"{self.name} is playing a card game and received task: {task}"

    def __repr__(self):
        return f"{self.name} - Hand: {self.hand}, Score: {self.calculate_score()}, Suit Score: {self.calculate_suit_score()}"
