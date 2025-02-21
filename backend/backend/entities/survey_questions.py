class SurveyQuestions:
    """This class represents the questions a survey.

    Attributes:
            __questions (dict): A dictionary that contains the index, question and answer
            choices of each question.
    """

    def __init__(self):
        """Create an empty dictionary where questions can be added using the
        add_question method."""
        self.__questions = {}

    def add_question(self, index: str, question: str, answer_choices: dict):
        """Add a question into an instance of SurveyQuestions.

        Args:
            index (str):
                The index or id of the question, e.g. 'Q1'.
            question (str):
                The actual question in text form, e.g. 'What is your gender'.
            answer_choices (dict):
                The answer choices provided for the question, where the questions are
                numbered. E.g.
                **{1: 'female', 2: 'male', 3: 'other', 4: 'I do not want to answer'}**.

        Raises:
            RuntimeError: A question for the given index already existed."""
        if index not in self.__questions:
            self.__questions[index] = {}
            self.__questions[index]["question"] = question
            self.__questions[index]["answer_choices"] = answer_choices
        else:
            raise RuntimeError("A question for the given index already existed.")

    def questions(self) -> dict:
        """Return the questions"""
        return self.__questions
