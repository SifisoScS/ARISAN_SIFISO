from fastapi import FastAPI
from agents.task_manager import TaskManager

app = FastAPI()
task_manager = TaskManager()

@app.get("/")
def read_root():
    return {"message": "Welcome to ARISAN SIFISO API"}

@app.get("/calculate")
def calculate(expression: str):
    """Process a math expression using the Planning Agent."""
    result = task_manager.execute_workflow("math", expression)
    return {"expression": expression, "result": result}

@app.get("/extract_numbers")
def extract_numbers(text: str):
    """Extract numbers from a text input using the Data Processing Agent."""
    result = task_manager.execute_workflow("data_processing", text)
    return {"text": text, "extracted_numbers": result}

@app.get("/multi_agent_task")
def multi_agent_task(expression: str):
    """Execute a full multi-agent workflow."""
    result = task_manager.run_interaction(expression)
    return {"workflow_result": result}

# Run with: uvicorn api.server:app --reload
