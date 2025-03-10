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

            agent_responses = {}
            lines = response.strip().split("\n")
            print("[DEBUG] Splitting LLM response into lines:", lines, flush=True)

            for i, line in enumerate(lines):
                if line.startswith(f"Agent {i+1}:"):
                    parts = line.split(":")
                    if len(parts) < 2:
                        print(f"[ERROR] Invalid response format at line {i+1}: {line}", flush=True)
                        continue 

                    try:
                        answers = [int(x.strip()) for x in parts[1].split(",") if x.strip().isdigit()]
                        if len(answers) != len(questions):
                            print(f"[ERROR] Mismatch in responses for Agent {i+1}: Expected {len(questions)}, got {len(answers)}.", flush=True)
                            continue 

                        agent_responses[agents[i]] = dict(zip(questions, answers))

                    except ValueError:
                        print(f"[ERROR] Failed to convert responses to integers at line {i+1}: {line}", flush=True)
                        continue
            print("\n[DEBUG] Storing responses in agent objects...")

            for i, (agent, responses) in enumerate(agent_responses.items()):
                print(f"[DEBUG] Agent {i+1} before update: {agent.new_questions}")

                for question, answer in responses.items():
                    if question not in agent.new_questions:
                        agent.new_questions[question] = answer 
                    else:
                        print(f"[DEBUG] Agent {i+1}: Question '{question}' already exists, keeping old answer.")

                print(f"[DEBUG] Agent {i+1} after update: {agent.new_questions}")


            return agent_responses

        except Exception as e:
            print(f"[ERROR] LLM call failed: {e}", flush=True)
            return None