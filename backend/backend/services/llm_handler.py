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
            agents (list): List of Agent objects.
            questions (list): List of statements to be answered.

        Returns:
            str: The generated prompt.
        """
        prompt = self.create_intro()

        latent_variables = self._get_latent_variables(agents[0])
        prompt += self.add_latent_variables_to_prompt(latent_variables)
        prompt += self.add_agents_info(agents, latent_variables)
        prompt += self.add_questions_and_instructions(questions)

        return prompt

    def create_intro(self):
        """
        Creates the introductory part of the prompt explaining latent variables.

        Returns:
            str: The introductory part of the prompt.
        """
        return (
            "You are simulating multiple consumer agents based on latent factor analysis.\n"
            "Latent variables take values in the range of approximately -2.4 to +2.4.\n"
            "These values represent underlying factors that influence consumer behavior, \n"
            "and the agents' responses will be generated accordingly. \n"
            "The model should take this range into account when providing Likert-scale responses to statements.\n"
            "Negative values indicate weaker or less favorable attitudes toward the associated concept, \n"
            "while positive values indicate stronger or more favorable attitudes.\n"
            "The magnitude of the value represents the strength of the attitude or belief.\n"
            "For example, a value closer to +2.4 indicates a stronger agreement with a positive statement,\n"
            "while a value closer to -2.4 indicates a stronger disagreement.\n"
            "A value of 0 represents a neutral stance, indicating no strong opinion either way.\n"
            "Each agent represents a unique consumer with different demographic and consumer behavior.\n\n"
        )

    def _get_latent_variables(self, agent: Agent) -> list:
        """
        Extracts a unique list of latent variable names from the agents' data.

        Args:
            agents (list): List of Agent objects.

        Returns:
            list: List of latent variable names.
        """
        latent_variables = []
        latent_variables_dictionary = agent.get_agent_info().get("Answers", {})
        for variable in latent_variables_dictionary:
            latent_variables.append(variable)

        return latent_variables

    def add_latent_variables_to_prompt(self, latent_variables):
        """
        Adds the list of latent variables to the prompt.

        Args:
            latent_variables (list): List of latent variable names.

        Returns:
            str: A string with the latent variable names added to the prompt.
        """
        prompt = "Latent variables:\n"
        for var_name in latent_variables:
            prompt += f"- {var_name}\n"
        return prompt

    def add_agents_info(self, agents, latent_variables):
        """
        Adds the agent-specific data to the prompt, including their latent variable values.

        Args:
            agents (list): List of Agent objects.
            latent_variables (list): List of latent variable names.

        Returns:
            str: A string with agent information and latent variable values.
        """
        prompt = ""
        for i, agent in enumerate(agents):
            agent_info = agent.get_agent_info()
            prompt += f"Agent {i+1}:\n"
            # prompt += f"Age: {agent_info['Age']}\n"
            # prompt += f"Gender: {agent_info['Gender']}\n"
            prompt += "Latent variable values:\n"

            # Only include the values of latent variables in order
            for var_name in latent_variables:
                prompt += f"{agent_info['Answers'].get(var_name, 'N/A')}\n"

            prompt += "\n"
        return prompt

    def add_questions_and_instructions(self, questions):
        """
        Adds the questions and response format instructions to the prompt.

        Args:
            questions (list): List of statements to be answered.

        Returns:
            str: A string with the questions and instructions for the responses.
        """
        prompt = (
            "The Likert scale is as follows:\n"
            "1 = Strongly Disagree\n"
            "2 = Disagree\n"
            "3 = Neutral\n"
            "4 = Agree\n"
            "5 = Strongly Agree\n\n"
        )

        if len(questions) == 1:
            prompt += "The statement to be answered by each agent on a Likert scale:\n"
        else:
            prompt += "The following are the statements to be answered by each agent on a Likert scale:\n"

        for question in questions:
            prompt += f"- {question}\n"

        prompt += f"\nThere are {len(questions)} statements to answer.\n"

        prompt += (
            "\nIMPORTANT: Each agent must provide exactly one numerical response per statement.\n"
            "The number of responses must match the number of statements given above.\n"
            "Responses should be given in a single line per agent, separated by commas.\n"
            "Each agent's response should begin with 'Agent X:', where X is the agent's number.\n"
            "Do not provide any additional explanation or text.\n"
            "The output must only include the agents' responses and nothing else.\n"
            "For example:\n"
            "Agent 1: 3, 2, 5, 4\n"
            "Agent 2: 4, 1, 3, 2\n"
            "Agent 3: 2, 5, 4, 3\n"
            "...\n"
            "Nothing else should be included in the response, such as explanations or extra details."
        )
        return prompt

    def get_agents_responses(self, agents, questions):
        """
        Sends a single request to the LLM with all agents and all questions,
        and then stores the responses in each agent's `questions` dictionary.

        Args:
            agents (list): List of Agent objects.
            questions (list): List of questions.

        Returns:
            dict: Each agent's responses.
        """
        #### Lots of TODO
        #### Check whether future latent variables exist
        # future_variables_exist = Transformer().check_future_variables()

        #### Make the prompts and get the answers
        # if future_variables_exist:
        #     original_prompt = self.create_prompt(agents, questions, "future")
        #     future_prompt = self.create_prompt(agents, questions, "original")
        #     responses = llm.get_parallel_responses([original_prompt, future_prompt])
        # else:
        #     original_prompt = self.create_prompt(agents, questions, "original")
        #     response = self.llm.get_response(prompt)

        ### Parse and save the answers by the LLM

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

            new_agent_responses = self.save_responses_to_agents(agent_responses)

            return new_agent_responses

        except Exception as e:
            print(f"[ERROR] LLM call failed: {e}", flush=True)
            return None

    def save_responses_to_agents(self, agent_responses):
        """
        Stores the responses in each agent's `questions` dictionary. Checks if question already exists,
        if not, creates a list with the first response and if yes, adds the new response to the existing list.

        Args:
            agent_responses (dict): A dictionary of agents responses.

        Returns:
            dict: Each agent's responses.
        """

        new_agent_responses = {}

        for i, (agent, responses) in enumerate(agent_responses.items()):
            # print(f"[DEBUG] Agent {i+1} before update: {agent.questions}")
            for question, answer in responses.items():
                if question not in agent.questions:
                    agent.questions[question] = [answer]
                else:
                    agent.questions[question].append(answer)

            print(
                f"[DEBUG] Agent {i+1} after update: {agent.questions}",
                flush=True,
            )
            new_agent_responses[f"Agent_{i+1}"] = responses

        # Test the questions dictionary for each agent
        # for i, agent in enumerate(agents):
        #    print(f"[DEBUG] Agent {i+1} final questions:", agent.questions)

        # print( "\n[DEBUG] Final agent responses", new_agent_responses, flush=True)

        return new_agent_responses
