from flask import Flask, request, jsonify
from flask_cors import CORS
from generator import Generator

app = Flask(__name__)
CORS(app)
generate = Generator()


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
    company = data.get("query")
    industry = data.get("industry")
    # website = data.get("website") // Not used in the current implementation, needs to be specified what data is retrieved from the website
    agent_count = data.get("agentCount")
    response = generate.create_agents(company, industry, agent_count)
    response = {"message": response}
    response = jsonify(response)
    return response


if __name__ == "__main__":
    app.run(debug=True)
