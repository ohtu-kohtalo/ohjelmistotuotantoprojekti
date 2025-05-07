import os
from typing import Union
import google.generativeai as genai
from .services.gemini_service import Gemini
from .services.openai_service import OpenAI


def get_llm_connection() -> Union[Gemini, OpenAI]:
    """Returns an instance of class _Gemini_ or _OpenAI_. The returned class will be the LLM model, that
    the program uses. The used model is specified in the .env-file.

    Returns:
        Union(Gemini, OpenAI): The LLM model used by the program.

    Raises:
        ValueError: If the .env-file does not specify the LLM model correctly.
    """
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
