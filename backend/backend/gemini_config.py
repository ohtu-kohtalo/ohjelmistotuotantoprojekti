import google.generativeai as genai


def get_gemini_connection(gemini_api_key):
    """Create an API connection to Gemini and return a generative model"""
    genai.configure(api_key=gemini_api_key)
    ai_model = genai.GenerativeModel("gemini-1.5-flash")
    return ai_model
