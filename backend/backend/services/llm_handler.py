from ..llm_config import get_llm_connection
from ..entities.agent import Agent


class LlmHandler:
    def __init__(self):
        """Initializes the LLM connection using `llm_config.py`."""
        self.llm = get_llm_connection()

    def _list_survey_questions(self, agent: Agent) -> list:
        """Helper function for `create_prompt`. Makes a list out the survey questions or
        latent factors if they are used instead.

        Args:
            agent (Agent):
                An agent object. The survey questions are taken form one
                agent instance. This means all agents must have the same questions for the
                program to work correctly.

        Returns:
            list:
                A list of questions. The questions are in the order they appeared in
                the agent argument.
        """
        latent_factors = ["Age", "Gender"]

        latent_factors_dictionary = agent.get_agent_info()["Answers"]
        for factor in latent_factors_dictionary:
            latent_factors.append(factor)

        return latent_factors

    def create_prompt(self, agents, questions):
        """
        Creates a prompt for all agents and all questions.

        Args:
            agent (Agent): List of Agent objects.
            question (str): The user's question.

        Returns:
            str: The generated prompt.
        """
        prompt = (
            "I have made an latent factor analysis for survey respondents on a food and "
            "food production related survey. "
            "The latent variables take values in the range of approximately -2.4 to +2.4. "
            "Negative values indicate weaker or less favorable attitudes toward the associated concept, \n"
            "while positive values indicate stronger or more favorable attitudes.\n"
            "These values represent underlying factors that influence consumer behavior. "
            "The magnitude of the value represents the strength of the attitude or belief.\n"
            "For example a value closer to +2.4 indicates a stronger agreement with a positive statement,\n"
            "while a value closer to -2.4 indicates a stronger disagreement.\n"
            "A value of 0 represents a neutral stance, indicating no strong opinion either way.\n"
            "Each agent represents a unique consumer.\n"
            "Here are age, gender and the latent factors for each respondent in a list :\n\n"
        )

        latent_factors_list = self._list_survey_questions(agents[0])
        prompt += str(latent_factors_list) + "\n\n"

        prompt += (
            "And here are the agents' age, gender and values for the latent factors in lists. The "
            "values are in the same order as in the previous list:\n\n"
        )

        for i, agent in enumerate(agents):
            agent_info = agent.get_agent_info()
            prompt += f"Agent {i+1}:\n"
            agent_answers = []
            agent_answers.append(agent_info["Age"])
            agent_answers.append(agent_info["Gender"])
            for _, value in agent_info["Answers"].items():
                agent_answers.append(value)

            prompt += f"{agent_answers}\n\n"

        prompt += (
            "Each agent should answer the questions on a Likert scale from 1-5:\n"
            "1. Strongly disagree\n"
            "2. Disagree\n"
            "3. Neither agree nor disagree\n"
            "4. Agree\n"
            "5. Strongly agree\n"
            "Here are the questions:\n"
        )
        for question in questions:
            prompt += f"- {question}\n"

        prompt += (
            "\n IMPORTANT: Each agent must provide exactly one numerical response per question.\n"
            "The number of responses must match the number of questions given above.\n"
            "Responses should be given in a single line per agent, separated by commas.\n"
            "Do not provide any additional explanation or text.\n"
            "The output must only include the agents' responses and nothing else.\n"
            "For example, if there are two questions:\n"
            "Agent 1: 3, 5\n"
            "Agent 2: 4, 5\n"
            "Agent 3: 2, 3\n"
            "...\n"
            "Nothing else should be included in the response, such as explanations or extra details."
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
            # print("[DEBUG] LLM response received:", response, flush=True)

            if not response:
                print("[ERROR] LLM returned an empty response!", flush=True)
                return None

            agent_responses = {}
            lines = response.strip().split("\n")
            print("[DEBUG] Splitting LLM response into lines:", lines, flush=True)

            if len(lines) < len(agents):
                print(
                    f"[ERROR] Expected {len(agents)} agents in response, but got {len(lines)}.",
                    flush=True,
                )
                return None

            for i, line in enumerate(lines):
                if i >= len(agents):
                    print(
                        f"[ERROR] Skipping response line {i+1} because there are only {len(agents)} agents.",
                        flush=True,
                    )
                    continue

                if line.startswith(f"Agent {i+1}:"):
                    parts = line.split(":")
                    if len(parts) < 2:
                        print(
                            f"[ERROR] Invalid response format at line {i+1}: {line}",
                            flush=True,
                        )
                        continue

                    try:
                        answers = [
                            int(x.strip())
                            for x in parts[1].split(",")
                            if x.strip().isdigit()
                        ]
                        if len(answers) != len(questions):
                            print(
                                f"[ERROR] Mismatch in responses for Agent {i+1}: Expected {len(questions)}, got {len(answers)}.",
                                flush=True,
                            )
                            continue

                        agent_responses[agents[i]] = dict(zip(questions, answers))

                    except ValueError:
                        print(
                            f"[ERROR] Failed to convert responses to integers at line {i+1}: {line}",
                            flush=True,
                        )
                        continue
            print("\n[DEBUG] Storing responses in agent objects...")

            new_agent_responses = {}

            for i, (agent, responses) in enumerate(agent_responses.items()):
                # print(f"[DEBUG] Agent {i+1} before update: {agent.new_questions}")
                for question, answer in responses.items():
                    if question not in agent.new_questions:
                        agent.new_questions[question] = answer
                    else:
                        print(
                            f"[DEBUG] Agent {i+1}: Question '{question}' already exists, keeping old answer."
                        )

                # print(f"[DEBUG] Agent {i+1} after update: {agent.new_questions}")
                new_agent_responses[f"Agent_{i+1}"] = responses

            # print("\n[DEBUG] Final agent responses", new_agent_responses, flush=True)

            return new_agent_responses

        except Exception as e:
            print(f"[ERROR] LLM call failed: {e}", flush=True)
            return None
