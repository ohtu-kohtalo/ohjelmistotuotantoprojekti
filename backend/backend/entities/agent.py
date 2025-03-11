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

    def get_agent_info(self) -> dict:
        """Returns only the agent's basic information (age, gender, and latent variables)."""
        return self.__info

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
