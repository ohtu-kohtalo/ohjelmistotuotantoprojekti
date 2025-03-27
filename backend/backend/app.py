import os
import io
import csv
import pandas as pd
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

from .key_config import (
    CSV_FILE_PATH,
)

from .llm_config import get_llm_connection
from .entities.agent import Agent
from .services.get_data import GetData
from .services.gemini_service import Gemini
from .services.llm_handler import LlmHandler
from .services.csv_service import extract_questions_from_csv

app = Flask(__name__)
CORS(app)
ai_model = get_llm_connection()
gemini = Gemini(ai_model)
csv_file = CSV_FILE_PATH
llm_handler = LlmHandler()

# Set a default value for the global variable agents
agents = []


@app.route("/", methods=["GET"])
def create_agents():
    """
    Creates 50 agents based on the CSV-data in backend.

    For each row in the backend-CSV (limited to 50 rows):
      - The agent’s info contains the "Age", "Gender" and "Answers" fields. Answers is a dictionary with backend CSV-file question-text as key and the answer-value as value.
      - The questions-dictionary will be filled with agents' answers based on user-inputted question(s).

    Sets up the initial agents based on the CSV-file in the backend to be used later in the application.
    Backend CSV-file can be thought of as sort of a training data for the agents and is used to provide LLM with the necessary data to generate responses.

    Returns:
        JSON response indicating whether initial agent creation from backend CSV-file was successful along with the agents' info for display purposes.
    """

    try:
        # Declare the list of agents to be a global variable, so that other functions can access it
        global agents

        df = pd.read_csv(csv_file)

        # Select random 50 rows
        df = df.sample(50)

        # Convert integer columns to strings
        int_cols = df.select_dtypes(include=["int"]).columns
        df[int_cols] = df[int_cols].astype(str)

        agents = []

        # Create Agent objects: info includes Age, Gender, and Answers.
        for record in df.to_dict(orient="records"):

            # Create agents
            info = {
                "Age": record.get("Age"),
                "Gender": record.get("Gender"),
                "Answers": {
                    question_text: answer_value
                    for question_text, answer_value in record.items()
                    if question_text not in ["Age", "Gender"]
                },
            }

            agent = Agent(info)
            agents.append(agent)
            # Example Agent-object now: Agent(Age=24, Answers={'Q1': 1, 'Q2': 3}, Gender=Male)

        # Convert agents to a list of dicts matching the frontend structure
        agent_dicts = []

        for agent in agents:

            agent_info = agent.get_agent_info()
            answers = agent_info.get("Answers", {})
            first_response = next(iter(answers.values()), None)

            # Prepare the final dict with keys matching the desired format
            agent_dict = {
                "id": agent.get_id(),
                "age": agent_info.get("Age"),
                "gender": agent_info.get("Gender"),
                "response": first_response,
            }

            agent_dicts.append(agent_dict)

        return jsonify(agent_dicts), 200

    except Exception as error:
        return (
            jsonify(
                {
                    "status": "Error during initial agent-creation from CSV-file",
                    "message": str(error),
                }
            ),
            500,
        )


@app.route("/receive_user_csv", methods=["POST"])
def receive_user_csv():
    """Receives the user's questions and returns answer distributions and statistics
    for those questions.

    Returns:
        JSON:
            A list of answer distributions and statistics for each distribution. An
            example with one distribution:
                {
                    response: "success"
                    distributions:
                        [
                            {
                                question: "I like pasta",
                                data: [
                                    {"label": "Strongly Disagree", "value": 1,}
                                    {"label": "Disagree", "value": 2},
                                    {"label": "Neutral", "value": 5},
                                    {"label": "Agree", "value": 3},
                                    {"label": "Strongly Agree","value": 2},
                                    ]
                                statistics: {
                                    "median": 3,
                                    "mode": 2,
                                    "variation ratio": 0.7
                                    }
                            }
                        ]
                }
    """

    global agents

    data = request.get_json()
    print(data, flush=True)

    if not data:
        print("No data provided")
        return jsonify({"error": "No data provided"}), 400

    if len(data) == 0:
        print("Empty agent data")
        return jsonify({"error": "Empty agent data"}), 400

    if "questions" not in data:
        print("Missing 'questions' field in payload")
        return jsonify({"error": "Missing 'questions' field in payload"}), 400

    questions = extract_questions_from_csv(data)

    if not isinstance(questions, list):
        print("'questions' must be an object (list)")
        return jsonify({"error": "'questions' must be an object (list)"}), 400

    responses = llm_handler.get_agents_responses(agents, questions)

    distributions = GetData().get_answer_distributions(
        0, agents
    )  # This now returns the first distribution of the first responses

    return jsonify(
        {
            "status": "success",
            "distributions": distributions,
        }
    )


@app.route("/receive_future_scenario", methods=["POST"])
def receive_future_scenario():
    """Receives the user's future scenario. Transforms the agents to the future and
    saves the new agent variables into the agent object

    Returns:
        JSON:
            A status message if the transformation was successfull and an error message
            if something went wrong.
    """

    global agents

    data = request.get_json()
    print("\nFuture scenario:\n", data, flush=True)
    print("\nFuture scenario:\n", type(data), flush=True)

    if not data:
        print("No data provided")
        return jsonify({"error": "No data provided"}), 400

    if not isinstance(data, dict):
        print("Payload must be a dictionary")
        return jsonify({"error": "Payload must be a dictionary"}), 400

    if len(data) == 0:
        print("Empty payload")
        return jsonify({"error": "Empty payload"}), 400

    if "scenario" not in data:
        print("Missing 'scenario' field in payload")
        return jsonify({"error": "Missing 'scenario' field in payload"}), 400

    scenario = data["scenario"]

    if not isinstance(scenario, str):
        print("'scenario' must be an string")
        return jsonify({"error": "'scenario' must be an string"}), 400

    return jsonify(
        {
            "status": "success",
        }
    )


@app.route("/download_agent_response_csv", methods=["POST"])
def download_agent_response_csv():
    """
    Endpoint to generate and download a CSV file containing agent responses.
    The CSV will have one row per agent, where the first column is the agent identifier,
    and subsequent columns correspond to each question.

    AGE AND GENDER TODO
    """
    data = request.get_json()
    print("[DEBUG] Received data for CSV download:", data, flush=True)

    if not data:
        print("[ERROR] No data provided", flush=True)
        return jsonify({"error": "No data provided"}), 400

    if len(data) == 0:
        print("[ERROR] Empty agent data", flush=True)
        return jsonify({"error": "Empty agent data"}), 400

    if "questions" not in data:
        print("[ERROR] Missing 'questions' field in payload", flush=True)
        return jsonify({"error": "Missing 'questions' field in payload"}), 400

    questions_payload = data["questions"]

    # If questions_payload is empty, use the keys from the first agent's questions
    if not questions_payload:
        if agents and hasattr(agents[0], "questions") and agents[0].questions:
            # Preserve the original order by using the keys from the first agent's questions dictionary.
            ordered_keys = list(agents[0].questions.keys())
            questions_payload = {key: None for key in ordered_keys}
            print(
                "[DEBUG] Using first agent's questions keys in original order:",
                ordered_keys,
                flush=True,
            )
        else:
            print("[ERROR] No questions available from agents", flush=True)
            return jsonify({"error": "No questions available from agents"}), 400
    else:
        print(
            "[DEBUG] Questions for CSV from payload:",
            list(questions_payload.keys()),
            flush=True,
        )

    # Build the CSV header: "Agent" plus each question key.
    header = ["Agent"] + list(questions_payload.keys())
    print("[DEBUG] CSV Header:", header, flush=True)

    # Create an in-memory CSV file.
    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(header)
    print("[DEBUG] Header written to CSV", flush=True)

    # Iterate over agents to build each row.
    for i, agent in enumerate(agents, start=1):
        row = [f"Agent {i}"]
        if hasattr(agent, "questions"):
            print(f"[DEBUG] Agent {i} questions:", agent.questions, flush=True)
            # Retrieve answer for each question in the header
            for question in header[1:]:
                value = agent.questions.get(question, "")
                row.append(value)
        else:
            print(f"[DEBUG] Agent {i} does not have 'questions' attribute", flush=True)
            # If the agent has no questions, fill with empty strings
            row.extend(["" for _ in header[1:]])
        print(f"[DEBUG] Writing row for Agent {i}: {row}", flush=True)
        writer.writerow(row)

    # Get full CSV from in-memory buffer
    csv_content = si.getvalue()
    print("[DEBUG] Final CSV content:", csv_content, flush=True)

    # Create HTTP response with CSV file
    output = make_response(csv_content)
    # Set correct headers
    output.headers["Content-Disposition"] = "attachment; filename=agent_responses.csv"
    output.headers["Content-Type"] = "text/csv"
    return output


@app.route("/health", methods=["GET"])
def health_check():
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500, debug=True)
