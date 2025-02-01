from abc import ABC, abstractmethod

class Agent(ABC):
    """Base class for all agents in ARISAN SIFISO."""

    def __init__(self, name):
        self.name = name

    @abstractmethod
    def execute_task(self, task):
        """Execute a given task. This must be implemented in child classes."""
        pass

    def send_message(self, recipient, message):
        """Send a message to another agent."""
        print(f"{self.name} -> {recipient.name}: {message}")
        recipient.receive_message(self, message)

    def receive_message(self, sender, message):
        """Handle received messages."""
        print(f"{self.name} received message from {sender.name}: {message}")
