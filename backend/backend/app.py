import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .key_config import CSV_FILE_PATH
from .services.create_agent_pool import create_agent_pool
from .load_dataset import load_dataset

app = Flask(__name__)
CORS(app)

if not CSV_FILE_PATH or not os.path.exists(CSV_FILE_PATH):
    raise FileNotFoundError("CSV_FILE_PATH is missing or the file does not exist.")

dataset = load_dataset(CSV_FILE_PATH)
agent_pool = create_agent_pool(dataset)


@app.route("/create_agent", methods=["POST"])
def create_agent():
    """
    Create an agent based on the provided company and industry information.
    This function retrieves JSON data from the request, extracts the company and industry
    information, and uses these to generate agents. The generated agents are then returned
    in a JSON response.

    Returns:
        Response: A JSON response containing the generated agents.
    """

    data = request.get_json()
    question = data.get("query")
    # Other user inputs are not used for anything right now.
    # company = data.get("query")
    # industry = data.get("industry")
    # agent_count = data.get("agentCount")
    age_distribution = agent_pool.get_answer_distribution(question)
    response = (
        "# Backend is being reworked"
        f"\n\n## Answer distribution of the agents:\n {age_distribution}"
    )
    response = {"message": response}
    response = jsonify(response)
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500, debug=True)
