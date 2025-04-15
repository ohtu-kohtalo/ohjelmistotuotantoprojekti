from ..llm_config import get_llm_connection
from token_count import TokenCount
from typing import List, Dict, Any
from ..entities.agent import Agent


class AgentTransformer:
    """This class provides methods to transform agents into the future. Call the method
    `transform_agents_to_future` to transform given agents into future based on a given future
    scenario.

    Attributes:
        __llm: The LLM model. By default uses the model defined in the .env file.
    """

    INTRO_BEGINNING = """
I have a survey about the views and opinions that young people have about food 
and food production. The questions of the survey concerned sustainability, technology and 
behaviour. 

Using latent factor analysis, I have made latent factors from the questions. 
The latent variables take values in the range of -3 to +3, where a value closer to 
+3 indicates a stronger agreement with a the latent variable and a value closer to 
-3 indicates a stronger disagreement. 

I will give you the latent factors of some of the survey's respondents. I will also
give you a scenario of the future. I then want you to transform the agents into the 
future: this means you should change the latent variables for each of the respondents 
and these changes should be based on the future scenario. I other words, you need to 
infer how the views and opinions of the respondents would change, if the given future 
scenario would actually take place.

This is the future scenario:
"""
    FUTURE_SCENARIO = """
In five years from now new technologies are developed to create cultured meat. This meat is grown 
synthetically in laboratories. It does not have the same ethical issues as traditional meat 
production. Its climate impact is small, although still a little more than using vegetarian 
choices. Its price is only a little above the price of traditionally produced meat. In a short time
it becomes a very popular product with good availability.
"""
    INTRO_END = """

These are the latent variables:
 - Future Awareness - Awareness of global agricultural challenges
 - Perceived Individual Efficiency - Belief in personal impact on sustainability
 - Perceived Collective Efficiency - Belief in societal changes for sustainability
 - Advocacy and Career Intentions - Interest in sustainability careers
 - Tech Orientation - Trust in food production technology
 - Unwillingness to Change - Resistance to dietary changes
 - Low Behavioral Activation - Perceived low impact of personal choices
 - Social Support - Influence of peers on food choices
 - Influencing Others - Encouraging sustainable choices
 - Belief About Consequences - Impact of food choices on environment & health
 - Emotions - Satisfaction and guilt related to sustainable food choices
 - Food Preparation Skills - Ability to cook sustainable meals
 - Green Purchase Intention - Commitment to buying sustainable food

Next I will give you the values of the respondents for the latent variables. The latent variables 
will be in the same order as in the previous listing.

"""
    PROMPT_END = """
Now create the new latent values for the respondents. Give the values in the same order as they 
were given previously. Before each respondent's values, include the text 'Respondent' and after that
the respondent's number. Here is an example, how the response could look like for the first two 
respondents.

Respondent 1
0.5
2.4
2.4
1.1
0.9
-0.4
-1.3
0.1
1.5
2.2
0.7
0.4
1.0

Respondent 2
0.9
-1.9
-1.4
-1.6
-1.9
0.1
1.5
-1.3
-2.1
-2.5
-0.5
-0.8
-1.1

Give the new latent values for all of the respondents like in the previous example. Do not output 
anything else.
"""

    def __init__(self, llm: Any = get_llm_connection()) -> None:
        """Initializes the LLM connection.

        Args:
            llm: The LLM model. By default uses the model defined in the .env file."""
        self.__llm = llm

    def transform_agents_to_future(
        self, agents: List[Agent], future_scenario: str
    ) -> bool:
        """Transforms agents to future. Takes a future scenario and a list of agent-objects as
        arguments. Then asks an LLM to create new info variables for the agents based on the future
        scenario and the original info variables of the agents. The new info varibles are then
        saved into the agents.

        Args:
            agents (list): A list of agent-objects.
            future_scenario (str): A scenario by the user of the future.

        Returns:
            bool: **True** if future transformation was successful for all agents and **False**
            otherwise.
        """
        length_in_tokens = self.count_token_length(future_scenario)
        print(f"Length of future scenario: {length_in_tokens} tokens", flush=True)
        if length_in_tokens > 10000:
            raise RuntimeError(
                f"Future scenario was too long. It was {length_in_tokens} tokens."
            )
        if future_scenario == "default":
            future_scenario = self.FUTURE_SCENARIO

        # Get the latent variables in a list
        latent_variables = self._get_latent_variables(agents[0])

        prompt = self.create_prompt(agents, future_scenario, latent_variables)
        print("\nPrompt:\n", prompt, flush=True)

        try:
            response = self.__llm.get_response(prompt)
        # print("\nLLM response:\n", response, flush=True)
        except Exception as exc:
            raise RuntimeError(
                "Something went wrong when LLM was creating an answer"
            ) from exc

        try:
            new_latent_variables = self._parse_response(
                response, len(agents), latent_variables
            )
        except Exception as exc:
            raise RuntimeError(
                "Something went wrong while parsing the LLM's answer"
            ) from exc

        # Delete old questions and the latent variables based on the previous future scenario
        self._delete_old_variables_and_questions(agents)
        self._save_new_variables_to_agents(new_latent_variables, agents)

        return True

    def create_prompt(
        self, agents: List[Agent], future_scenario: str, latent_variables: List[str]
    ) -> str:
        """Creates a prompt that will ask the LLM to transform the agents into the future.

        Args:
            agents (list): A list of agents
            future_scenario (str): The future scenario given by the user
            latent_variables (list): The latent variables
        """
        prompt = self.INTRO_BEGINNING
        # The future scenario is currently hard coded into the prompt
        prompt += future_scenario
        prompt += self.INTRO_END

        ### For now, the latent variables are hard coded into the prompt (in INTRO_END)
        # prompt += self._add_latent_variables()

        prompt += self._add_agent_variable_values(agents, latent_variables)
        prompt += self.PROMPT_END

        return prompt

    def _get_latent_variables(self, agent: Agent) -> List[str]:
        """
        Takes an agent as an argument, searches its latent variables and returns the latent
        variable names in a list.

        Args:
            agent (Agent): An Agent object.

        Returns:
            list: A list of latent variable names.
        """
        latent_variables = []
        latent_variables_dictionary = agent.get_agent_info().get("Answers", {})
        for variable in latent_variables_dictionary:
            latent_variables.append(variable)

        return latent_variables

    def _add_agent_variable_values(
        self, agents: List[Agent], latent_variables: List[str]
    ) -> str:
        """
        Lists the latent variable values of the agents.

        Args:
            agents (list): List of Agent objects.
            latent_variables (list): List of latent variable names.

        Returns:
            str: A string with the latent variable values of the agents.
        """
        prompt = ""
        for i, agent in enumerate(agents):
            agent_info = agent.get_agent_info()
            prompt += f"Respondent {i+1}:\n"
            prompt += "Latent variable values:\n"

            # Add the values of the latent variables always in the same order.
            # The order is set in the latent_variables -variable
            for var_name in latent_variables:
                value = agent_info["Answers"].get(var_name, "N/A")
                if isinstance(value, float):
                    value = round(value, 1)
                prompt += f"{value}\n"

            prompt += "\n"
        return prompt

    def _parse_response(
        self, response: str, number_of_agents: int, latent_variables: List[str]
    ) -> Dict[int, Dict[str, Any]]:
        """Parses the future transformation response by the LLM and stores the new latent variables
        into a dictionary.

        Args:
            response (str): Response by the LLM.
            number_of_agents (int): The number of agents that the program is using.
            latent_variables (list): The latent variables in a list.

        Returns:
            dict: A dictionary containing the latent variables for each agent. An example:
            {1: {"variable1": 2.2, "variable2": -0.3}, 2: {"variable1": 1.4, "variable2": 0.5}}
        """
        new_latent_values = {i: {} for i in range(1, number_of_agents + 1)}

        response = response.split("Respondent")
        response = [values.split("\n") for values in response]
        # print("\nParsed response:\n", response, flush=True)

        agent_id = 0
        for value_list in response:
            # Line breaks in the response can create lists with empty strings: ['', ''].
            # Skip these.
            if self._only_empty_strings_in_a_list(value_list):
                continue

            latent_value_number = 0
            first_value = True

            for entry in value_list:
                # Line breaks create empty strings: ''. Skip these.
                if entry == "":
                    continue

                # The first value should be the id number of the agent (respondent)
                if first_value:
                    if entry.find(str(agent_id)):
                        agent_id += 1
                        first_value = False
                        continue
                    # Raise error if the first value was not the expected agent id
                    raise RuntimeError(
                        "Agent id numbers did not match when parsing LLM response"
                    )

                # Check that the value is a real number
                try:
                    float(entry)
                except ValueError as exc:
                    raise TypeError(
                        f"A value for a latent variable was not a real number. The value was {entry}"
                    ) from exc

                # Check that the LLM did not give too many values. The number of values must not be
                # greater than the number of latent variables.
                if latent_value_number >= len(latent_variables):
                    raise RuntimeError("Too many new latent values were being added")
                latent_variable = latent_variables[latent_value_number]
                latent_value_number += 1

                # Add the latent variable into the dictionary
                new_latent_values[agent_id][latent_variable] = entry

            # Check that all latent variables got a value
            number_given = len(new_latent_values[agent_id])

            if number_given != len(latent_variables):
                raise RuntimeError(
                    f"Agent number {agent_id} got too few new latent variables. "
                    f"It got {number_given}."
                )

        # print("\nnew_latent_values:\n", flush=True)
        # for key, values in new_latent_values.items():
        #     print("\nAgent", key, flush=True)
        #     print(values, flush=True)

        # Check that all agents got the new latent values
        if agent_id != number_of_agents:
            error = (
                "An incorrect number of agents got new latent variables. There were ",
                f"{number_of_agents} agents, but {agent_id} got new values",
            )
            raise RuntimeError(error)

        return new_latent_values

    def _only_empty_strings_in_a_list(self, list_to_check: List[str]) -> bool:
        """Checks whether a list contains only empty string. Returns True if it does and False
        otherwise."""
        only_empty_strings = True
        for value in list_to_check:
            if value != "":
                only_empty_strings = False
                return only_empty_strings

        return only_empty_strings

    def future_variables_exist(self, agents: List[Agent]) -> bool:
        """Checks if the first agent in the list has future latent variable values already set."""
        if agents:
            return bool(agents[0].get_agent_future_info().get("Answers"))
        return False

    def _delete_old_variables_and_questions(self, agents: List[Agent]) -> None:
        """Deletes the all questions, anwers and future latent variables from the Agent-objects.
        Only the original latent variables and demographic information are left intact.
        """
        for agent in agents:
            agent.delete_future_info_and_questions()

    def _save_new_variables_to_agents(
        self, new_latent_variables: Dict[int, Dict[str, Any]], agents: List[Agent]
    ) -> None:
        """Saves the created latent variables into the Agent-objects.

        Args:
            new_latent_variables (dict): The new latent variables for the agents in a dictionary.
            agents (list): The Agent-objects in a list.
        """
        for i, agent in enumerate(agents):
            # In new_latent_variables the agents are numbered beginning from 1.
            agent.save_new_future_latent_variables(new_latent_variables[i + 1])

    def count_token_length(self, text: str) -> int:
        """Calculates the number of tokens in a given text.

        Args:
            text (str): Some text.

        Returns:
            int: The number of tokens"""
        tc = TokenCount(model_name="gpt-4o")
        tokens = tc.num_tokens_from_string(text)
        return tokens
