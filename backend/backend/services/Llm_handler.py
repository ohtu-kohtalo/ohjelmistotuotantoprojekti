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

        for i, agent in enumerate(agents):
            agent_info = agent.get_agent_info()
            prompt += f"Agent {i+1}:\n{agent_info}\n\n"

        prompt += "Each agent should answer the following questions:\n"
        for question in questions:
            prompt += f"- {question}\n"

        prompt += (
            "\nPlease respond in the exact format:\n"
            "Agent 1: 3, 2\n"
            "Agent 2: 4, 5\n"
            "Agent 3: 2, 1\n"
            "...\n"
            "and nothing else."
        )

        return prompt
    
    def get_agents_responses(self, agents, questions):
        """
        Sends a single request to the LLM with all agents and all questions,
        and then stores the responses in each agent's `new_questions` dictionary.

        Args:
            agents (list): List of Agent objects.
            questions (list): List of questions.

        Returns:
            dict: Each agent's responses.
        """
        print("[DEBUG] Generating a single prompt for all agents...")

        prompt = self.create_prompt(agents, questions)

        print("[DEBUG] Full prompt to LLM:\n", prompt, flush=True)

        try:
            response = self.llm.get_response(prompt)
            print("[DEBUG] LLM response received:", response, flush=True)

            if not response:
                print("[ERROR] LLM returned an empty response!", flush=True)
                return None

            # Parse response and store in JSON format
            agent_responses = {}
            lines = response.strip().split("\n")
            print("[DEBUG] Splitting LLM response into lines:", lines, flush=True)

            for i, line in enumerate(lines):
                if line.startswith(f"Agent {i+1}:"):
                    answers = [int(x.strip()) for x in line.split(":")[1].split(",") if x.strip().isdigit()]
                    agent_responses[agents[i]] = dict(zip(questions, answers))

            return agent_responses

        except Exception as e:
            print(f"[ERROR] LLM call failed: {e}", flush=True)
            return None