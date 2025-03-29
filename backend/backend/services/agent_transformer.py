from ..llm_config import get_llm_connection


class AgentTransformer:
    """This class provides methods to transform agents into the future. Call the method
    `transform_agents_to_future` to transform given agents into future based on a given future
    scenario.

    Attributes:
        __llm: The LLM model. By default uses the model defined in the .env file.


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

        Returns:
            bool: **True** if future transformation was successfull for all agents and **False**
            otherwise.
        """
        return True
