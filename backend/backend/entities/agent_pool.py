from collections import Counter


class AgentPool:
    """This class represents the pool of all agents.

    Attributes:
        __agents (list):
            a list of all the agents
    """

    def __init__(self, agents: list):
        """Creates a pool of agents. The agents are saved in a list.

        Args:
            __agents (list): a list of all the agents
        """
        self.__agents = agents

    def get_answer_distribution(self, question: str) -> dict:
        """Get the distribution of the answers given by the agents.

        Args:
            str: A question that the agents have answered, e.g. age.

        Returns:
            dict: The distribution of the answers"""
        answers = []
        for agent in self.__agents:
            answers.append(agent.get_answer(question))

        distribution = Counter(answers)
        distribution = dict(distribution)
        return distribution
