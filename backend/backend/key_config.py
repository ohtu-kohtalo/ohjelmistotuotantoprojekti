import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CSV_FILE_PATH = os.getenv("CSV_FILE_PATH")
SAV_FILE_PATH = os.getenv("SAV_FILE_PATH")
