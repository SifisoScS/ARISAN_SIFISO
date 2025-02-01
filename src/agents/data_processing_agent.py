import re
from agents.agent import Agent
from config.utils import load_prompt

class DataProcessingAgent(Agent):
    """Agent for extracting numerical data from text."""

    def __init__(self, name):
        super().__init__(name)
        self.prompt = load_prompt("data_processing_prompt.txt")

    def execute_task(self, data):
        """Extract numbers from input text without repeating the prompt."""
        numbers = re.findall(r'\d+', data)
        extracted = f"Extracted numbers: {', '.join(numbers)}" if numbers else "No numbers found."
        return f"Input: '{data}' → {extracted}"

# Example Usage
if __name__ == "__main__":
    processor = DataProcessingAgent("DataProcessor")
    print(processor.prompt)  # Print prompt once
    inputs = [
        "The price is 100 dollars with a discount of 20%",
        "Temperature readings: 25°C, 30°C, 22°C",
        "No numbers here!"
    ]
    for text in inputs:
        print(processor.execute_task(text))
