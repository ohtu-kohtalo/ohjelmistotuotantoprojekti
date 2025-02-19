class Agent:
    """This class represents individual agents.

    Attributes:
        __info (dict):
            information about the agent, e.g. age and gender
    """

    def __init__(self, info: dict):
        """Creates an agent.

        Args:
            __info (dict): information about the agent, e.g. age and gender
        """
        self.__info = info

    def get_answer(self, question: str) -> str | None:
        """Returns the answer for the given question or **None**, if the given question does
        not exist.

        Args:
            question (str): A question in the dataset

        Returns:
            str/None: The answer given by the agent or None if the question does not exists.
        """
        try:
            return self.__info[question]
        except KeyError:
            return None
