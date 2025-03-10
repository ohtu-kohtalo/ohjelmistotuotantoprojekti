from ..llm_config import get_llm_connection
from ..entities.agent import Agent


class LlmHandler:
    def __init__(self):
        """Initializes the LLM connection using `llm_config.py`."""
        self.llm = get_llm_connection()

    def create_prompt(self, agents, questions):
        """
        Creates a prompt for all agents and all questions.

        Args:
            agent (Agent): List of Agenr objects.
            question (str): The user's question.

        Returns:
            str: The generated prompt.
        """
        prompt = (
            "You are simulating multiple consumer agents based on latent factor analysis.\n"
            "Each agent represents a unique consumer with different demographic and psychological traits.\n"
            "They will answer the following questions on a Likert scale (1 = Strongly Disagree, 5 = Strongly Agree).\n\n"
        )

        #Lisää agenttien tiedot
        for i, agent in enumerate(agents):
            agent_info = agent.get_agent_info()
            prompt += f"Agent {i+1}:\n{agent_info}\n\n"

        # Lisää kysymykset
        prompt += "Each agent should answer the following questions:\n"
        for question in questions:
            prompt += f"- {question}\n"

        # Selkeä vastausohje
        prompt += (
            "\nPlease respond in the exact format:\n"
            "Agent 1: 3, 2\n"
            "Agent 2: 4, 5\n"
            "Agent 3: 2, 1\n"
            "...\n"
            "and nothing else."
        )

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