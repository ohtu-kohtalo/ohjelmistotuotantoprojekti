class AgentPool:
    """This class represents the pool of all agents.

    Attributes:
        agents (list):
            a list of all the agents
    """

    def __init__(self, agents: list):
        """_summary_

        Args:
            agents (list): a list of all the agents
        """
        self.agents = agents

    def get_agents(self) -> str:
        """Returns all information of the agents in a string"""
        text = ""
        for agent in self.agents:
            text += "\n\n"
            text += str(agent.info)
        return text
