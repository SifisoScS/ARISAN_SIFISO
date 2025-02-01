import random

class Card:
    """Represents a playing card with a rank, suit, and value."""
    suit_values = {"Clubs": 1, "Diamonds": 2, "Hearts": 3, "Spades": 4}
    face_values = {"J": 11, "Q": 12, "K": 13, "A": 11}

    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit
        self.value = self.face_values[rank] if rank in self.face_values else int(rank)  # FIXED
        self.suit_value = self.suit_values[suit]

    def __repr__(self):
        return f"{self.rank} of {self.suit} (Value: {self.value}, Suit: {self.suit_value})"

class Deck:
    """Represents a deck of playing cards."""
    def __init__(self):
        self.cards = self.generate_deck() * 2  # Two decks
        self.shuffle()

    def generate_deck(self):
        """Generates a standard deck of 52 cards."""
        ranks = [str(n) for n in range(2, 11)] + ["J", "Q", "K", "A"]
        suits = ["Clubs", "Diamonds", "Hearts", "Spades"]
        return [Card(rank, suit) for rank in ranks for suit in suits]

    def shuffle(self):
        """Shuffles the deck."""
        random.shuffle(self.cards)

    def deal(self, num_cards=5):
        """Deals a hand of cards."""
        if len(self.cards) < num_cards:
            raise ValueError("Not enough cards left to deal.")
        return [self.cards.pop() for _ in range(num_cards)]
