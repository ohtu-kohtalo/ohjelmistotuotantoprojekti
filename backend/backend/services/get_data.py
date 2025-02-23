class GetData:
    """This class provides methods to get data about agents.

    Attributes:
        survey (SurveyQuestions):
            A SurveyQuestions object that has the questions and answer choices.
        agent_pool (AgentPool):
            An AgentPool object that has the agents and their data."""

    def __init__(self, survey, agent_pool):
        self.survey = survey
        self.agent_pool = agent_pool

    def get_all_distributions(self):
        """Returns the answer distributions of all questions. The question names and
        answer choices are converted to a readable form."""
        distributions = self.agent_pool.all_distributions()
        distributions = self.make_distributions_readable(distributions)
        return distributions

    def make_distributions_readable(self, distributions):
        """Converts the question names and answer choices to a readable form.

        Returns:
            dict: The distributions in a dictionary."""
        new_dist = {}
        for index, answers in distributions.items():

            question_dict = self.survey.question(index)
            question_text = question_dict["question"]
            answer_choices = question_dict["answer_choices"]

            new_answers = {}
            for number, number_of_answers in answers.items():
                if number == " ":
                    new_answers["Tieto puuttuu"] = number_of_answers
                else:
                    try:
                        new_answers[answer_choices[number]] = number_of_answers
                    except KeyError:
                        new_answers[number] = number_of_answers

            new_dist[question_text] = new_answers

        return new_dist
