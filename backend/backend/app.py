import os
import io
import csv
import zipfile
import pandas as pd
from flask import Flask, request, jsonify, make_response, Response
from flask_cors import CORS
from typing import Tuple

from .key_config import (
    CSV_FILE_PATH,
)

from .llm_config import get_llm_connection
from .entities.agent import Agent
from .services.get_data import GetData
from .services.gemini_service import Gemini
from .services.llm_handler import LlmHandler
from .services.csv_service import extract_questions_from_csv
from .services.agent_transformer import AgentTransformer

app = Flask(__name__)
CORS(app)
ai_model = get_llm_connection()
gemini = Gemini(ai_model)
csv_file = CSV_FILE_PATH
llm_handler = LlmHandler()

# Set a default value for the global variable agents
agents = []


@app.route("/", methods=["GET"])
def create_agents() -> Tuple[Response, int]:
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
def receive_user_csv() -> Tuple[Response, int]:
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

    get_data = GetData()
    current_distributions, future_distributions = get_data.get_all_distributions(agents)
    print("[DEBUG] Current distributions:", current_distributions, flush=True)
    print("[DEBUG] Future distributions:", future_distributions, flush=True)

    return jsonify(
        {
            "status": "success",
            "distributions": current_distributions,
            "future_distributions": future_distributions,
        }
    )


@app.route("/receive_future_scenario", methods=["POST"])
def receive_future_scenario() -> Tuple[Response, int]:
    """Receives the user's future scenario. Transforms the agents to the future and
    saves the new agent variables into the agent object

    Returns:
        JSON:
            A status message if the transformation was successfull and an error message
            if something went wrong.
    """

    global agents

    data = request.get_json()
    # print("\nFuture scenario:\n  ", data, flush=True)

    if not data:
        print("No data provided")
        return jsonify({"error": "No data (future scenario) provided"}), 400

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

    agents_transformed = AgentTransformer().transform_agents_to_future(agents, scenario)
    if agents_transformed:
        print("Agent transformation succeeded\n", flush=True)
    else:
        print("Agent transformation failed\n", flush=True)

    return jsonify(
        {
            "status": "success",
        }
    )


@app.route("/download_agent_response_csv", methods=["POST"])
def download_agent_response_csv() -> Response:
    """
    Endpoint to generate and download a CSV files containing current and future agent responses
    along with the agent's age and gender.
    The CSVs will have one row per agent, where the first columns are the agent identifier, age, gender,
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
            # Preserve the original order by using the keys from the first agent's questions dictionary
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

    # Create headers
    header_current = ["Agent", "Age", "Gender"] + list(questions_payload.keys())
    # In-memory CSV
    si_current = io.StringIO()
    writer_current = csv.writer(si_current)
    writer_current.writerow(header_current)

    # Iterate over agents and write responses
    for i, agent in enumerate(agents, start=1):
        agent_info = agent.get_agent_info()
        row = [f"Agent {i}", agent_info.get("Age", ""), agent_info.get("Gender", "")]
        if hasattr(agent, "questions"):
            for question in header_current[3:]:
                value = agent.questions.get(question, "")
                row.append(value)
        else:
            # Replace empty questions with empty strings
            row.extend(["" for _ in header_current[3:]])
        writer_current.writerow(row)
    # Retrieve CSV content
    csv_content_current = si_current.getvalue()

    # Build CSV for future agent responses
    future_questions_payload = data.get("future_questions")
    if not future_questions_payload:
        if (
            agents
            and hasattr(agents[0], "future_questions")
            and agents[0].future_questions
        ):
            # Preserve the original order by using the keys from the first agent's questions dictionary
            ordered_keys = list(agents[0].future_questions.keys())
            future_questions_payload = {key: None for key in ordered_keys}
            print(
                "[DEBUG] Using first agent's future_questions keys in original order:",
                ordered_keys,
                flush=True,
            )
        else:
            # If no future questions exist, only create agent column
            future_questions_payload = {}
            print(
                "[DEBUG] No future questions available from agents. Creating empty CSV for future responses.",
                flush=True,
            )

    # Create headers
    header_future = ["Agent"] + list(future_questions_payload.keys())
    si_future = io.StringIO()
    writer_future = csv.writer(si_future)
    writer_future.writerow(header_future)

    # Iterate over agents and write responses
    for i, agent in enumerate(agents, start=1):
        agent_info = agent.get_agent_info()
        row = [f"Agent {i}", agent_info.get("Age", ""), agent_info.get("Gender", "")]
        if hasattr(agent, "future_questions"):
            for question in header_future[3:]:
                value = agent.future_questions.get(question, "")
                row.append(value)
        else:
            # Replace empty questions with empty strings
            row.extend(["" for _ in header_future[3:]])
        writer_future.writerow(row)
    # Retrieve CSV content
    csv_content_future = si_future.getvalue()

    # Add CSVs to zip file
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr("agent_responses.csv", csv_content_current)
        zip_file.writestr("agent_future_responses.csv", csv_content_future)
    # Reset buffer
    zip_buffer.seek(0)

    # Create HTTP response with zip payload
    output = make_response(zip_buffer.read())
    output.headers["Content-Disposition"] = "attachment; filename=agent_responses.zip"
    output.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
    output.headers["Content-Type"] = "application/zip"
    return output


@app.route("/health", methods=["GET"])
def health_check() -> Tuple[str, int]:
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500, debug=True)
