from agents.agent import Agent
from config.utils import load_prompt

class PlanningAgent(Agent):
    """Planning Agent responsible for executing arithmetic operations."""

    def __init__(self, name):
        super().__init__(name)
        self.prompt = load_prompt("planning_prompt.txt")

    def execute_task(self, task):
        """Executes a basic arithmetic task without repeating the prompt."""
        try:
            result = eval(task)
            return f"Task: {task} → Result of '{task}' is {result}"
        except Exception as e:
            return f"Error executing task: {str(e)}"

# Example Usage
if __name__ == "__main__":
    planner = PlanningAgent("Planner")
    print(planner.prompt)  # Print prompt once
    tasks = ["5 + 3 * 2", "10 / 2", "7 - 4 + 8"]
    for task in tasks:
        print(planner.execute_task(task))
