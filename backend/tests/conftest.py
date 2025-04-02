import os
import tempfile

os.environ["OPENAI_API_KEY"] = "dummykey"
os.environ["GEMINI_API_KEY"] = "dummykey"
os.environ["LLM_PROVIDER"] = "gemini"

with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".csv") as tmp:
    tmp.write("q1\nq2")
    dummy_csv_path = tmp.name

os.environ["CSV_FILE_PATH"] = dummy_csv_path
