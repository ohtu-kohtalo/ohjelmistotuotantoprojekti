from ..llm_config import get_llm_connection


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

Respondet 1:
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

Respondet 2:
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

    def __init__(self, llm=get_llm_connection()):
        """Initializes the LLM connection.

        Args:
            llm: The LLM model. By default uses the model defined in the .env file."""
        self.__llm = llm

    def transform_agents_to_future(self, agents: list, future_scenario: str) -> bool:
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
        prompt = self.create_prompt(agents, future_scenario)
        print("\nPrompt:\n", prompt)

        response = self.__llm.get_response(prompt)
        print("\nresponse:\n", response)
        # new_latent_variables = self.parse_response(response)
        # self.save_new_variables_to_agents(new_latent_variables, agents)
        return True

    def create_prompt(self, agents: list, future_scenario: str) -> str:
        """Creates a prompt that will ask the LLM to transform the agents into the future.

        Args:
            agents (list): A list of agents
            future_scenario (str): The future scenario given by the user
        """
        prompt = self.INTRO_BEGINNING
        # The future scenario is currently hard coded into the prompt
        prompt += self.FUTURE_SCENARIO
        prompt += self.INTRO_END

        latent_variables = self._get_latent_variables(agents[0])

        ### For now, the latent variables are hard coded into the prompt (in INTRO_END)
        # prompt += self.add_latent_variables()

        prompt += self._add_agent_variable_values(agents, latent_variables)
        prompt += self.PROMPT_END

        return prompt

    def _get_latent_variables(self, agent) -> list:
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

    def _add_agent_variable_values(self, agents, latent_variables):
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
            prompt += f"Respondet {i+1}:\n"
            # prompt += f"Age: {agent_info['Age']}\n"
            # prompt += f"Gender: {agent_info['Gender']}\n"
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
