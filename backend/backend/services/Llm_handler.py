from ..llm_config import get_llm_connection
from ..entities.agent import Agent


class LlmHandler:
    def __init__(self):
        """Initializes the LLM connection using `llm_config.py`."""
        self.llm = get_llm_connection()

    def create_prompt(self, agent, question):
        """
        Creates a detailed prompt for a single agent and a single question.

        Args:
            agent (Agent): The agent receiving the question.
            question (str): The user's question.

        Returns:
            str: The generated prompt.
        """
        agent_info = agent.get_agent_info()

        prompt = f"""
        You are simulating a consumer agent based on latent factor analysis.
        The agent has the following attributes:

        {agent_info}

        Answer the following question on a Likert scale (1 = Strongly Disagree, 5 = Strongly Agree):

        **Question:** "{question}"

        Respond with only a single number (1, 2, 3, 4, or 5) and nothing else.
        """
        return prompt

    def get_agent_response(self, agent, question):
        """
        Sends a single question to an agent and stores the response on a Likert scale.

        Args:
            agent (Agent): The agent answering the question.
            question (str): The question being asked.

        Returns:
            int: The LLM-generated response on a Likert scale (1-5).
        """
        print("[DEBUG] Generating prompts for agents...")

        prompt = self.create_prompt(agent, question)

        try:
            print("[DEBUG] Sending prompt to LLM...", flush=True)
            response = self.llm.get_response(prompt)  # LLM response
            print("[DEBUG] LLM response received:", response, flush=True)

            if not response:
                print("[ERROR] LLM returned an empty response!", flush=True)
                return None

            # Store the question and response
            agent.new_questions[question] = response

            return response

        except Exception as e:
            print(f"[ERROR] LLM call failed: {e}", flush=True)
            return None
