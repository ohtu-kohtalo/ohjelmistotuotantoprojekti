from collections import Counter


class AgentPool:
    """This class represents the pool of all agents.

    Attributes:
        __agents (list): A list of all the agents
        __selected_questions (list): The questions that the user can inspect
    """

    def __init__(self, agents: list):
        """Creates a pool of agents. The agents are saved in a list.

        Args:
            __agents (list): a list of all the agents
            __selected_questions (list):
                The questions that the user can inspect. The user can see the answer
                distributions of these questions.
        """
        self.__agents = agents
        self.__selected_questions = [
            "T1",
            "T2",
            "T3",
            "T4",
            "T5",
            "T5B",
            "T8",
            "T9",
            "T10",
            "T11",
            "T12",
            "T13",
            "T14",
            "bv1",
            "Q20",
            "Q17B",
            "Q17C",
            "Q17D",
        ]

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

    def get_all_distributions(self) -> dict:
        """Creates the answer distributions for all questions.

        Returns:
            dict: A dictionary where the keys are the question IDs and the values are the
            answer distributions. E.g.
            **{'Q1': {'Ans1': 2, 'Ans2': 3}, 'Q2': {'Ans1': 1, 'Ans2': 4}}**"""
        distributions = {}
        for question in self.__selected_questions:
            distributions[question] = self.get_answer_distribution(question)

        return distributions
