from game.card_deck import Deck

# Initialize deck and deal one card for testing
deck = Deck()
test_card = deck.deal(1)[0]

print("\n🔹 Testing Card Handling 🔹")
print(f"Dealt card: {test_card}")
