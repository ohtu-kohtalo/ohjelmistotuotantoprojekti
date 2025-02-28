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
from .gemini_config import get_gemini_connection
from .services.create_agent_pool import create_agent_pool
from .services.create_questions import create_questions
from .services.get_data import GetData
from .services.gemini import Gemini


app = Flask(__name__)
CORS(app)

dataset = load_dataset(CSV_FILE_PATH)
agent_pool = create_agent_pool(dataset)
survey = create_questions(QUESTIONS_FILE_PATH, ANSWERS_FILE_PATH)
get_data = GetData(survey, agent_pool)
ai_model = get_gemini_connection(GEMINI_API_KEY)
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

# Should be rerouted to /create_agent_response
# @app.route("/create_agent_response", methods=["POST"])
@app.route("/create_agent", methods=["POST"])
def create_agent():
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
    answers = gemini.get_parallel_responses(prompts)
    response = f"# Answers by the mock agents\n {answers}"
    response = {"message": response}
    response = jsonify(response)
    return response


@app.route("/health", methods=["GET"])
def health_check():
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500, debug=True)
