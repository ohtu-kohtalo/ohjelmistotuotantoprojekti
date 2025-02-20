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
        self.gender = info.get("T1")
        self.age_group = info.get("T2")
        self.residence_size = info.get("T3")
        self.region = info.get("T4")
        self.employer = info.get("T5")
        self.currently_working = info.get("T5B")
        self.basic_education = info.get("T8")
        self.occupational_education = info.get("T9")
        self.occupational_group = info.get("T10")
        self.industry = info.get("T11")
        self.trade_union_membership = info.get("T12")
        self.political_party = info.get("T13")
        self.social_class = info.get("T14")
        self.household_income = info.get("bv1")

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
