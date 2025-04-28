from ..llm_config import get_llm_connection
from ..entities.agent import Agent
from ..services.agent_transformer import AgentTransformer
from typing import List, Dict, Any, Optional


class LlmHandler:
    def __init__(self) -> None:
        """Initializes the LLM connection using `llm_config.py`."""
        self.llm = get_llm_connection()

        self.transformer = AgentTransformer()

    def create_prompt(self, agents: List[Agent], questions: List[str], future: bool = False) -> str:
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
        prompt += self.add_agents_info(agents, latent_variables, future)
        prompt += self.add_questions_and_instructions(questions)

        return prompt

    def create_intro(self) -> str:
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

    def _get_latent_variables(self, agent: Agent) -> List[str]:
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

    def add_latent_variables_to_prompt(self, latent_variables: List[str]) -> str:
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

    def add_agents_info(self, agents: List[Agent], latent_variables: List[str], future: bool = False) -> str:
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
            info = agent.get_agent_future_info() if future else agent.get_agent_info()
            prompt += f"Agent {i+1}:\n"
            # prompt += f"Age: {agent_info['Age']}\n"
            # prompt += f"Gender: {agent_info['Gender']}\n"
            prompt += "Latent variable values:\n"

            # Only include the values of latent variables in order
            for var_name in latent_variables:
                prompt += f"{info['Answers'].get(var_name, 'N/A')}\n"
            prompt += "\n"
        return prompt

    def add_questions_and_instructions(self, questions: List[str]) -> str:
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

    def get_agents_responses(
        self, agents: List[Agent], questions: List[str]
    ) -> Optional[Dict[str, Dict[Any, Dict[str, int]]]]:
        """Retrieves and processes responses from a language model."""

        future_variables_exists = self.transformer.future_variables_exist(agents)

        if future_variables_exists:
            # Create two prompts: one for original latent values, one for updated values
            prompts = [
                self.create_prompt(agents, questions, future=False),
                self.create_prompt(agents, questions, future=True),
            ]
            responses = self.llm.get_parallel_responses(prompts)
            print("[DEBUG] Content of responses:", responses)

            # If response is a single string, split it manually into two parts
            if isinstance(responses, str):
                responses = responses.split("## Answer")
                responses = [r.strip() for r in responses if r.strip()]

            if not responses or len(responses) != 2:
                print(
                    "[ERROR] Expected 2 responses from LLM, got:",
                    len(responses),
                    flush=True,
                )
                return None

            original_response = responses[0]
            future_response = responses[1]

            # Parse both responses
            original_parsed = self.parse_responses(original_response, agents, questions)
            future_parsed = self.parse_responses(future_response, agents, questions)

            if original_parsed is None or future_parsed is None:
                print("[ERROR] Parsing failed for one or both responses", flush=True)
                return None

            self.save_responses_to_agents(original_parsed, future=False)
            self.save_responses_to_agents(future_parsed, future=True)

            return {
                "original": original_parsed,
                "future": future_parsed,
            }

        else:
            # No future scenario: only one prompt
            prompt = self.create_prompt(agents, questions, future=False)
            response = self.llm.get_response(prompt)

            parsed = self.parse_responses(response, agents, questions)
            if parsed is None:
                return None

            self.save_responses_to_agents(parsed, future=False)
            return {"original": parsed}

    def parse_responses(
        self, response: str, agents: List[Agent], questions: List[str]
    ) -> Optional[Dict[Agent, Dict[str, int]]]:
        """Extracts and parses the responses from the LLM into structured data."""
        if not response:
            print("[ERROR] LLM returned an empty response!", flush=True)
            return None

        lines = response.strip().split("\n")
        print("[DEBUG] Splitting LLM response into lines:", lines, flush=True)
        return self.process_lines(lines, agents, questions)

    def process_lines(self, lines: List[str], agents: List[Agent], questions: List[str]) -> Dict[Agent, Dict[str, int]]:
        """Processes each line of the LLM's response, assigning each parsed line to the corresponding agent."""
        agent_responses = {}
        for i, line in enumerate(lines):
            if i >= len(agents):
                print(
                    f"[ERROR] Skipping response line {i+1} due to insufficient agent count.",
                    flush=True,
                )
                continue
            agent_response = self.parse_line(line, i, questions)
            if agent_response:
                agent_responses[agents[i]] = agent_response
        return agent_responses

    def parse_line(self, line: str, index: int, questions: List[str]) -> Dict[str, int]:
        """Parses an individual line from the LLM response and constructs a dictionary of answers."""
        if not line.startswith(f"Agent {index+1}:"):
            return None

        parts = line.split(":")
        if len(parts) < 2:
            print(
                f"[ERROR] Invalid response format at line {index+1}: {line}", flush=True
            )
            return None

        try:
            answers = [
                int(x.strip()) for x in parts[1].split(",") if x.strip().isdigit()
            ]
            return dict(zip(questions, answers))
        except ValueError:
            print(
                f"[ERROR] Conversion to integer failed at line {index+1}: {line}",
                flush=True,
            )
            return None

    def save_responses_to_agents(
        self, agent_responses: Dict[Agent, Dict[str, int]], future: bool = False
    ) -> Dict[str, Dict[str, int]]:
        """
        Stores the responses in each agent's `questions` or `future_questions` dictionary.

        Args:
            agent_responses (dict): A dictionary of agents responses.
            future (bool): Whether to save to future_questions (True) or questions (False).

        Returns:
            dict: Each agent's responses.
        """
        new_agent_responses = {}

        for i, (agent, responses) in enumerate(agent_responses.items()):
            target = agent.future_questions if future else agent.questions

            for question, answer in responses.items():
                if question not in target:
                    target[question] = [answer]
                else:
                    target[question].append(answer)

            print(
                f"[DEBUG] Agent {i+1} {'future_' if future else ''}questions updated:",
                target,
                flush=True,
            )
            new_agent_responses[f"Agent_{i+1}"] = responses

        return new_agent_responses
