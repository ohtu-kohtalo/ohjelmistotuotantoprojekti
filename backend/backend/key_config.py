import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CSV_FILE_PATH = os.getenv("CSV_FILE_PATH")

if not GEMINI_API_KEY and not OPENAI_API_KEY:
    raise FileNotFoundError(
        "GEMINI_API_KEY or OPENAI_API_KEY is missing from the .env file."
    )
if not CSV_FILE_PATH or not os.path.exists(CSV_FILE_PATH):
    raise FileNotFoundError("CSV_FILE_PATH is missing or the file does not exist.")
