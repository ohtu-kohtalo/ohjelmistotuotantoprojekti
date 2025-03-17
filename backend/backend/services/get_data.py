class GetData:
    """
    GetData class provides methods to manipulate agents answer data.
    """

    def get_answer_distributions(self, agents: list) -> list:
        """Return the answer distributions

        Args:
            agents (list): A list of agents

        Returns:
            distributions (list): A list of dictionaries. For example with one
            dictionary the list could look like this:
            [{
                'question': 'Pasta is good',
                'answers': {
                    'Strongly agree': 10,
                    'Agree': 14,
                    'Neutral': 9,
                    'Disagree': 5,
                    'Strongly disagree': 3 }
                }]
        """
        distributions = []
        saved_questions = set()

        for agent in agents:
            for question, answer in agent.new_questions.items():

                # Add the question to distributions, if it has not been encountered
                if question not in saved_questions:
                    saved_questions.add(question)
                    distributions.append(
                        {
                            "question": question,
                            "answers": {
                                "Strongly agree": 0,
                                "Agree": 0,
                                "Neutral": 0,
                                "Disagree": 0,
                                "Strongly disagree": 0,
                            },
                        }
                    )

                # Add an agent's answer to the distributions
                for q in distributions:
                    if q["question"] == question:
                        if str(answer) == "1":
                            q["answers"]["Strongly disagree"] += 1
                        if str(answer) == "2":
                            q["answers"]["Disagree"] += 1
                        if str(answer) == "3":
                            q["answers"]["Neutral"] += 1
                        if str(answer) == "4":
                            q["answers"]["Agree"] += 1
                        if str(answer) == "5":
                            q["answers"]["Strongly agree"] += 1

        distributions = self._convert_to_correct_form(distributions)
        return distributions

    def _convert_to_correct_form(self, distributions: list) -> list:
        """Helper function for get_answer_distributions. This function converts the
        distributions to the form, that can be sent to frontend"""
        new_distributions = []

        for dist in distributions:
            new_dist = {}
            new_dist["question"] = dist["question"]
            new_dist["data"] = [
                {
                    "label": "Strongly Disagree",
                    "value": dist["answers"]["Strongly disagree"],
                },
                {"label": "Disagree", "value": dist["answers"]["Disagree"]},
                {"label": "Neutral", "value": dist["answers"]["Neutral"]},
                {"label": "Agree", "value": dist["answers"]["Agree"]},
                {
                    "label": "Strongly Agree",
                    "value": dist["answers"]["Strongly agree"],
                },
            ]
            new_distributions.append(new_dist)

        return new_distributions

    def add_statistics(self, distributions: list) -> list:
        """Adds statistics to the distributions. Statistics include median, mode and
        standard deviation.

        Args:
            distributions (list):
                The distributions in a list in the form they are sent
                to frontend.

        Returns:
            distributions (list):
                The distributions with the statistics added. With only one distribution,
                the return value looks like this:
                [
                    {
                        question: "I like pasta",
                        statistics: {
                            "median": "Neutral",
                            "mode": "Neutral",
                            "standard_deviation": 2,54,
                        }
                        data: [
                            {"label": "Strongly Disagree", "value": 1,}
                            {"label": "Disagree", "value": 2},
                            {"label": "Neutral", "value": 5},
                            {"label": "Agree", "value": 3},
                            {"label": "Strongly Agree","value": 2},
                        ]
                    }
                ]
        """
        # This method is not yet implemented
