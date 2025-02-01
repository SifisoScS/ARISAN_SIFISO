# Arisan AI System 🚀

An AI-powered system with multi-agent collaboration for planning, data processing, and external integration via API & CLI.

📌 Features
Planning Agent 🤖: Performs mathematical calculations.

Data Processing Agent 📊: Extracts numerical values from text.

Inter-Agent Communication 🔄: Agents can send messages to each other.

API & CLI Support ⚡: Interact with the system through a web API or command-line interface.

Prompt Engineering 🎯: Optimized responses for task execution.

📂 Project Structure
├── src
│   ├── agents
│   │   ├── __init__.py
│   │   ├── planning_agent.py
│   │   ├── data_processing_agent.py
│   │
│   ├── communication
│   │   ├── __init__.py
│   │   ├── message_handler.py
│   │
│   ├── api
│   │   ├── __init__.py
│   │   ├── server.py
│   │
│   ├── cli
│   │   ├── __init__.py
│   │   ├── arisan_cli.py
│   │
│   ├── main.py
│
├── tests
│   ├── test_agents.py
│   ├── test_api.py
│
├── README.md
├── requirements.txt

🛠️ Installation & Setup

1️⃣ Install Python Dependencies
Ensure you have Python installed (>=3.8), then install dependencies:

sh
pip install -r requirements.txt
2️⃣ Run the API Server
sh
python src/api/server.py
After running, visit:

🌐 Swagger UI: <http://127.0.0.1:8000/docs>

📜 Redoc API Docs: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

🚀 Usage
1️⃣ Using the CLI

Run calculations directly from the command line:

sh
python src/cli/arisan_cli.py calculate "5 + 3 * 2"

Expected Output:

Result of '5 + 3 * 2' is 11

Extract numbers from text:

sh
python src/cli/arisan_cli.py extract_numbers "The price is 100 dollars with a discount of 20%"

Expected Output:

Extracted numbers: 100, 20
2️⃣ Using the API
📌 Make API Requests

Perform Calculation

sh
curl "<http://127.0.0.1:8000/calculate?expression=5+3*2>"

Expected Response:

json
{"result": "Result of '5 + 3 * 2' is 11"}
Extract Numbers

sh
`curl "<http://127.0.0.1:8000/extract_numbers?text=Temperature readings: 25°C, 30°C, 22°C>"`

Expected Response:

json
{"numbers": [25, 30, 22]}
Multi-Agent Communication

sh
curl "<http://127.0.0.1:8000/multi_agent_task?data=Process%20the%20following%20data:%2025C,%2050percent%20humidity.>"

Expected Response:

json
{"message": "DataProcessor received message from Planner: Process the following data: 25C, 50percent humidity."}
🧪 Running Tests
To ensure everything works correctly, run:

sh
pytest tests/
📌 Next Steps
✅ Implement Agent Collaboration

✅ Add API & CLI Support

🔜 Improve Natural Language Processing (NLP)

🔜 Deploy to Cloud for Public Access

🤝 Contributors
Your Name - Lead Developer

Other Contributors - Additional Support
