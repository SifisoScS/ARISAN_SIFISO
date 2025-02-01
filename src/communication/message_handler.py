class MessageHandler:
    """Handles inter-agent communication using message passing."""

    @staticmethod
    def send_message(sender, recipient, message):
        """Send a message from one agent to another."""
        print(f"{sender.name} -> {recipient.name}: {message}")
        recipient.receive_message(sender, message)
