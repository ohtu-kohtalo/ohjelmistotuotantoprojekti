import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .key_config import (
    CSV_FILE_PATH,
    QUESTIONS_FILE_PATH,
    ANSWERS_FILE_PATH,
    GEMINI_API_KEY,
)
from .load_dataset import load_dataset
from .llm_config import get_llm_connection
from .services.create_agent_pool import create_agent_pool
from .services.create_questions import create_questions
from .services.get_data import GetData
from .services.gemini_service import Gemini


app = Flask(__name__)
CORS(app)

dataset = load_dataset(CSV_FILE_PATH)
agent_pool = create_agent_pool(dataset)
survey = create_questions(QUESTIONS_FILE_PATH, ANSWERS_FILE_PATH)
get_data = GetData(survey, agent_pool)
ai_model = get_llm_connection()
gemini = Gemini(ai_model)

mock_dataset = load_dataset("./data/15_mock_agents.csv")
mock_agent_pool = create_agent_pool(mock_dataset)
get_mock_data = GetData(survey, mock_agent_pool)


@app.route("/", methods=["GET"])
def index():
    """Returns a JSON response containing the answer distributions of all questions."""
    distributions = get_data.get_all_distributions()
    distributions = jsonify(distributions)
    return distributions


@app.route("/create_agent_response", methods=["POST"])
def create_agent_response():
    """
    Current solution creates 15 agent responses based on pre-determined answer data and a user inputted question.

    This function:
    Retrieves JSON data from the request (user question),
    Extracts question information,
    Uses question information and pre-determined agents to generate a response via LLM,

    Generated agent response is then returned as a JSON response.

    Returns:
        Response: A JSON response containing the generated answers
    """

    data = request.get_json()
    question = data.get("question")
    prompts = get_mock_data.get_prompts(question)
    answers = ai_model.get_parallel_responses(prompts)
    response = f"# Answers by the mock agents\n {answers}"
    response = {"message": response}
    response = jsonify(response)
    return response


# IMPORTANT!: Not fully finished until the agent response format is finalized
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
