import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from .key_config import (
    CSV_FILE_PATH,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
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
    Creates 15 agents based on the CSV-data in backend.

    For each row in the backend-CSV (limited to 15 rows):
      - The agent’s info contains the "Age", "Gender" and "Answers" fields. Answers is a dictionary with backend CSV-file question-text as key and the answer-value as value.
      - The new_questions-dictionary will be filled with agents' answers based on user-inputted question(s).

    Sets up the initial agents based on the CSV-file in the backend to be used later in the application.
    Backend CSV-file can be thought of as sort of a training data for the agents and is used to provide LLM with the necessary data to generate responses.

    Returns:
        JSON response indicating whether initial agent creation from backend CSV-file was successful.
    """

    try:
        # Declare the list of agents to be a global variable, so that other functions can access it
        global agents

        df = pd.read_csv(csv_file)

        # Limit to the first 15 rows
        df = df.head(15)

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

        # Return JSON-output to frontend. For debugging purposes mostly.
        return (
            jsonify(
                {
                    "status": "Initial agent-creation from backend CSV-file was successful"
                }
            ),
            200,
        )

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

    distributions = GetData().get_answer_distributions(agents)

    return jsonify(
        {
            "status": "success",
            "data": {"responses": responses, "distributions": distributions},
        }
    )


# IMPORTANT!: Not fully finished, cannot finish until output format is defined
@app.route("/download_agent_response_csv", methods=["POST"])
def download_agent_response_csv():
    """
    Endpoint to generate and download a CSV file from frontend-provided questions data.
    Expects a JSON payload with a "questions" object containing question-answer pairs.

    Example:
    {
        "questions": {
            "kysymys1": lickert_vastaus,
            "kysymys2": lickert_vastaus,
            "kysymys3": lickert_vastaus
        }
    }

    Returns:
        Failure: Error-messages if the payload is missing or empty, or if the "questions" key is missing.
        Success: A CSV file download if the payload is valid.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    if len(data) == 0:
        return jsonify({"error": "Empty agent data"}), 400

    # Check if the 'questions' key is present in the payload.
    if "questions" not in data:
        return jsonify({"error": "Missing 'questions' field in payload"}), 400

    questions = data["questions"]
    agent = agents[0]
    question = questions[0]
    response = llm_handler.get_agent_response(agent, question)

    # Validate that questions is a dictionary.
    if not isinstance(questions, dict):
        return jsonify({"error": "'questions' must be an object (dictionary)"}), 400

    # Create an in-memory CSV file using StringIO.
    # Requires modules that need to be added

    # si = io.StringIO()
    # # Use the keys of the questions dictionary as the CSV header.
    # fieldnames = list(questions.keys())
    # writer = csv.DictWriter(si, fieldnames=fieldnames)
    # writer.writeheader()
    # # Write a single row with the answers.
    # writer.writerow(questions)

    # # Prepare the CSV file for download.
    # output = make_response(si.getvalue())
    # output.headers["Content-Disposition"] = "attachment; filename=questions_data.csv"
    # output.headers["Content-Type"] = "text/csv"
    # return output


@app.route("/health", methods=["GET"])
def health_check():
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500, debug=True)
