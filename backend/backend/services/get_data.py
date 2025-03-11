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
                        if answer == "1":
                            q["answers"]["Strongly disagree"] += 1
                        if answer == "2":
                            q["answers"]["Disagree"] += 1
                        if answer == "3":
                            q["answers"]["Neutral"] += 1
                        if answer == "4":
                            q["answers"]["Agree"] += 1
                        if answer == "5":
                            q["answers"]["Strongly agree"] += 1

        return distributions
