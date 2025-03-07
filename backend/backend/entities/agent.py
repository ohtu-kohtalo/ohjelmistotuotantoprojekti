class Agent:
    """This class represents individual agents.

    Attributes:
        __info (dict):
            information about the agent, e.g. age and gender
        new_questions (dict):
            holds information about variable data for the agent
    """

    def __init__(self, info: dict):
        """Creates an agent.

        Args:
            __info (dict): information about the agent, e.g. age and gender, answers to questions
        """
        self.__info = info
        self.new_questions = {}

    # NO FUNCTIONALITY YET!
    def get_answer(self, question: str) -> str | None:
        """Returns the answer for the given question or **None**, if the given question does
        not exist.

        Args:
            question (str): A question in the dataset

        Returns:
            str/None: The answer given by the agent or None if the question does not exists.
        """
        return self.__info.get(question, None)

    # NO FUNCTIONALITY YET!
    def get_all_answers(self) -> dict:
        """Returns all of the questions and answers."""
        return self.__info

    # IMPORTANT, TRANSFERRED FROM AGENTPOOL
    # TODO! These methods are not complete, need to be finished.
    # def answer_distribution(self, question: str) -> dict:
    #     """Get the distribution of the answers given by the agents.

    #     Args:
    #         str: A question that the agents have answered, e.g. age.

    #     Returns:
    #         dict: The distribution of the answers"""
    #     answers = []
    #     for agent in self.__agents:
    #         answers.append(agent.get_answer(question))

    #     distribution = Counter(answers)
    #     distribution = dict(distribution)
    #     return distribution

    # def all_distributions(self) -> dict:
    #     """Get the distributions of the answers for all questions.

    #     Returns:
    #         dict: A dictionary where the keys are the question IDs and the values are the
    #         answer distributions. E.g.
    #         **{'Q1': {'Ans1': 2, 'Ans2': 3}, 'Q2': {'Ans1': 1, 'Ans2': 4}}**"""
    #     distributions = {}
    #     for question in self.__selected_questions:
    #         distributions[question] = self.answer_distribution(question)

    #     return distributions
