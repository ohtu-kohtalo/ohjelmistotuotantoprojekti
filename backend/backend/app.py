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

app = Flask(__name__)
CORS(app)
ai_model = get_llm_connection()
gemini = Gemini(ai_model)
csv_file = CSV_FILE_PATH


@app.route("/", methods=["GET"])
def create_agents():
    """
    Creates 15 agents based on the CSV data.
    
    For each row in the CSV (limited to 15 rows):
      - The agent’s info contains the "Age" and "Gender" fields.
      - The rest of the columns (latent variables) are stored in new_questions.
    
    Returns a JSON response:
      {
          "status": "success",
          "created_agents": <number>,
          "agents": [
              {
                  "info": {"Age": "24", "Gender": "Male"},
                  "new_questions": { 
                    "Q1": ANSWER,
                    "Q2": ANSWER,
                  }
              },
              ...
          ]
      }
    """
    
    try:
        df = pd.read_csv(csv_file)
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error reading CSV file: {str(e)}"}), 500

    # Limit to the first 15 rows
    df = df.head(15)
    
    # Convert integer columns to strings
    int_cols = df.select_dtypes(include=["int"]).columns
    df[int_cols] = df[int_cols].astype(str)

    # Identify the latent variables in the dataset to be scaled into Likert-scale
    latent_variables = [col for col in df.columns if col not in ["Age", "Gender"]]

    # Create Agent objects: info only includes Age and Gender, rest goes to new_questions.
    agents = []
    
    for record in df.to_dict(orient="records"):
        
        # Rescale the latent variables to Likert-scale for each agent
        rescaled_record = GetData.rescale_to_likert(record, latent_variables)
        
        info = {"Age": record.get("Age"), "Gender": record.get("Gender")}
        
        new_questions = {k: v for k, v in record.items() if k not in ["Age", "Gender"]}
        agent = Agent(info)
        agent.new_questions = new_questions
        agents.append(agent)

    # Build the output using the private attribute via name mangling.
    agents_output = [{"info": agent._Agent__info, "new_questions": agent.new_questions} for agent in agents]
    return jsonify({
        "status": "success",
        "created_agents": len(agents),
        "agents": agents_output
    })

# IMPORTANT!: Not fully finished
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
