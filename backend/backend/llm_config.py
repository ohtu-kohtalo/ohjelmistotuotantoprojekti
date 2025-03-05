import os

import google.generativeai as genai

from .services.gemini_service import Gemini
from .services.openai_service import OpenAI


def get_llm_connection():
    llm_provider = os.getenv("LLM_PROVIDER")

    if llm_provider == "gemini":
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("No GEMINI_API_KEY found in environment")
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        return Gemini(model)
    
    elif llm_provider == "openai":
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("No OPENAI_API_KEY found in environment")
        return OpenAI(openai_api_key)
    
    else:
        raise ValueError("Invalid LLM_PROVIDER. Must be 'openai' or 'gemini'")