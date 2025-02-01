import os

def load_prompt(file_name):
    """Loads a prompt template from the prompts directory."""
    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts", file_name)
    try:
        with open(prompt_path, "r") as file:
            return file.read().strip()
    except FileNotFoundError:
        return "Prompt file not found."
