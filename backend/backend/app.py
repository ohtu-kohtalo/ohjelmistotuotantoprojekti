from flask import Flask, request, jsonify
from flask_cors import CORS
from generator import Generator

app = Flask(__name__)
CORS(app)
generate = Generator()


@app.route("/create_agent", methods=["POST"])
def create_agent():
    data = request.get_json()
    company = data.get("query")
    industry = data.get("industry")
    # website = data.get("website")
    response = generate.create_agents(company, industry, "3")
    response = {"message": response}
    response = jsonify(response)
    return response


if __name__ == "__main__":
    app.run(debug=True)
