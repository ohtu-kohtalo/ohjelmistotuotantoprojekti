import google.generativeai as genai
from key_config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
ai_model = genai.GenerativeModel("gemini-1.5-flash")


def get_gemini_connection():
    return ai_model
