import click
from agents.task_manager import TaskManager

task_manager = TaskManager()

@click.group()
def cli():
    """ARISAN SIFISO Command Line Interface."""
    pass

@cli.command()
@click.argument("expression")
def calculate(expression):
    """Perform a mathematical calculation using the Planning Agent."""
    result = task_manager.execute_workflow("math", expression)
    click.echo(f"Calculation Result: {result}")

@cli.command()
@click.argument("text")
def extract(text):
    """Extract numbers from text using the Data Processing Agent."""
    result = task_manager.execute_workflow("data_processing", text)
    click.echo(f"Extracted Numbers: {result}")

@cli.command()
@click.argument("expression")
def multi_agent(expression):
    """Run a full multi-agent task workflow."""
    task_manager.run_interaction(expression)

if __name__ == "__main__":
    cli()
