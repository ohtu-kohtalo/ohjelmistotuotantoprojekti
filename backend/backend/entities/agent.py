class Agent:
    """This class represents individual agents.

    Attributes:
        __id (int): Unique identifier for the agent, assigned automatically in ascending order
        __info (dict): Information about the agent, e.g. age and gender
        new_questions (dict): Holds information about variable data for the agent
    """

    _id_counter = 0  # Class variable to keep track of the last assigned ID

    def __init__(self, info: dict):
        """Creates an agent with automatically assigned ID.

        Args:
            info (dict): Information about the agent, e.g. age and gender, answers to questions
        """
        self.__id = Agent._id_counter
        Agent._id_counter += 1
        self.__info = info
        self.new_questions = {}

    def get_id(self) -> int:
        """Returns the unique identifier of the agent."""
        return self.__id

    def get_agent_info(self) -> dict:
        """Returns only the agent's basic information (age, gender, and latent variables)."""
        return self.__info

    def get_answer(self, question: str) -> str | None:
        """Returns the answer for the given question or **None**, if the given question does
        not exist.

        Args:
            question (str): A question in the dataset

        Returns:
            str/None: The answer given by the agent or None if the question does not exist.
        """
        return self.__info.get(question, None)

    # NO FUNCTIONALITY YET
    def get_all_answers(self) -> dict:
        """Returns all of the questions and answers."""
        return self.__info
