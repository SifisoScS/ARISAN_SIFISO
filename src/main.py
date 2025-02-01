from communication.message_handler import MessageHandler
from agents.planning_agent import PlanningAgent
from agents.data_processing_agent import DataProcessingAgent
from agents.task_manager import TaskManager

# Initialize agents
planner = PlanningAgent("Planner")
data_processor = DataProcessingAgent("DataProcessor")

# Initialize Task Manager
manager = TaskManager()

# Print prompts only once
print("\n🔹 Testing Planning Agent with Prompt Engineering 🔹\n")
print(planner.prompt)
tasks = ["5 + 3 * 2", "10 / 2", "7 - 4 + 8"]
for task in tasks:
    print(planner.execute_task(task))

print("\n🔹 Testing Data Processing Agent with Prompt Engineering 🔹\n")
print(data_processor.prompt)
inputs = [
    "The price is 100 dollars with a discount of 20%",
    "Temperature readings: 25°C, 30°C, 22°C",
    "No numbers here!"
]
for text in inputs:
    print(data_processor.execute_task(text))

# Testing agent communication
print("\n🔹 Testing Agent Communication 🔹\n")
MessageHandler.send_message(planner, data_processor, "Process the following data: 25°C, 50% humidity.")

# Running full multi-agent workflow
print("\n🔹 Running Multi-Agent Integrated Workflow 🔹\n")
manager.run_interaction("50 + 25 - 10 * 2")
