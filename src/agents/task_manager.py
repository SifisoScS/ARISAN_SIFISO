from agents.planning_agent import PlanningAgent
from agents.data_processing_agent import DataProcessingAgent
from communication.message_handler import MessageHandler

class TaskManager:
    """Coordinates task execution between agents."""

    def __init__(self):
        self.planner = PlanningAgent("Planner")
        self.data_processor = DataProcessingAgent("DataProcessor")

    def execute_workflow(self, task_type, task_data):
        """Determines which agent should handle the task and manages execution."""
        if task_type == "math":
            print("\n🔹 Task Manager: Sending math task to Planning Agent 🔹")
            return self.planner.execute_task(task_data)
        elif task_type == "data_processing":
            print("\n🔹 Task Manager: Sending data extraction task to Data Processing Agent 🔹")
            return self.data_processor.execute_task(task_data)
        else:
            return "Error: Unsupported task type."

    def run_interaction(self, task_data):
        """Simulates inter-agent task execution using message passing."""
        print("\n🔹 Task Manager: Initiating Multi-Agent Workflow 🔹\n")

        # Planning Agent processes the math task
        math_result = self.execute_workflow("math", task_data)
        print(math_result)

        # Message-based task delegation
        MessageHandler.send_message(self.planner, self.data_processor, "Extract numbers from result.")
        extracted_data = self.execute_workflow("data_processing", math_result)
        print(extracted_data)

        print("\n✅ Multi-Agent Workflow Completed Successfully ✅\n")

# Example Usage
if __name__ == "__main__":
    manager = TaskManager()
    manager.run_interaction("50 + 25 - 10 * 2")
