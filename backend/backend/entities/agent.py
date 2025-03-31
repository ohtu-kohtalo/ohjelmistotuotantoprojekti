class Agent:
    """This class represents individual agents.

    Attributes:
        __id (int): Unique identifier for the agent, assigned automatically in ascending order
        __info (dict): Information about the agent, e.g. age and gender
        __future_info (dict): The latent variables and answers after the agent has been transformed to the future
        questions (dict): Holds the questions and the agent's likert-scale answers to them
        future_questions (dict): Holds the questions and the transformed agent's likert-scale answers to them
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
        self.__future_info = {"Answers": {}}
        self.questions = {}
        self.future_questions = {}

    def get_id(self) -> int:
        """Returns the unique identifier of the agent."""
        return self.__id

    def get_agent_info(self) -> dict:
        """Returns only the agent's basic information (age, gender, and latent variables)."""
        return self.__info

    def get_agent_future_info(self) -> dict:
        """Returns the latent varibles and answers for the agent, after it has been transformed
        to the future."""
        return self.__future_info

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

    def delete_future_info_and_questions(self):
        """Overwrites the `future_info`, `questions` and future `future_questions` attributes
        with empty dictionaries. Returns `None`."""
        self.__future_info = {"Anwers": {}}
        self.questions = {}
        self.future_questions = {}

    def save_new_future_latent_variables(self, new_variables: dict):
        """Save new future latent variables into the __future_into argument.

        Args:
            new_variables (dict):
                The new variables in a dictionary, where the keys are the latent variable names and
                the values are the new values for the latent variables."""
        self.__future_info = {"Answers": new_variables}
