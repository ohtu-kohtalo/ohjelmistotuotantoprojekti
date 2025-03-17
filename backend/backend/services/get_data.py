from statistics import mode, median


class GetData:
    """
    GetData class provides methods to manipulate agents answer data.
    """

    def get_answer_distributions(self, agents: list) -> list:
        """Return the answer distributions

        Args:
            agents (list): A list of agents

        Returns:
            distributions (list): A list of dictionaries.
        """
        distributions = []
        saved_questions = set()
        agent = agents[0]

        for question, _ in agent.new_questions.items():
            # Add the question to distributions, if it has not been encountered
            if question not in saved_questions:
                saved_questions.add(question)
                dist = self.get_single_answer_distribution(question, agents)
                distributions.append(dist)

        distributions = self._convert_to_frontend_form(distributions)
        return distributions

    def get_single_answer_distribution(self, question, agents: list) -> list:
        """Returns answer distribution for a given question in dictionary form"""
        distribution = {
            "question": question,
            "answers": {
                "Strongly disagree": 0,
                "Disagree": 0,
                "Neutral": 0,
                "Agree": 0,
                "Strongly agree": 0,
            },
            "statistics": {"median": 0, "mode": 0, "variation ratio": 0},
        }
        # Add an agent's answer to the distribution
        for agent in agents:
            for q, answer in agent.new_questions.items():
                if q == question:
                    if str(answer) == "1":
                        distribution["answers"]["Strongly disagree"] += 1
                    if str(answer) == "2":
                        distribution["answers"]["Disagree"] += 1
                    if str(answer) == "3":
                        distribution["answers"]["Neutral"] += 1
                    if str(answer) == "4":
                        distribution["answers"]["Agree"] += 1
                    if str(answer) == "5":
                        distribution["answers"]["Strongly agree"] += 1
        # Add distribution statistics to the distribution
        distribution = add_statistics(distribution)
        return distribution

    def _convert_to_frontend_form(self, distributions: list) -> list:
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
            new_dist["statistics"] = dist["statistics"]
            new_distributions.append(new_dist)

        return new_distributions


def add_statistics(data):
    """Adds statistics to the distribution. Statistics include median, mode and
    variation ratio

    Args:
        data:
            The distribution.

    Returns:
        distributions:
            The distribution with the statistics added.
    """

    list_data = convert_dictionary_values_to_list(data)
    data["statistics"]["mode"] = calculate_mode(list_data)
    data["statistics"]["median"] = calculate_median(list_data)
    data["statistics"]["variation ratio"] = calculate_variation_ratio(list_data)
    return data


def convert_dictionary_values_to_list(data):
    """Converts distribution dictionary values to a list"""
    answers = data["answers"]
    values = []
    for answer, count in answers.items():
        answer = map_likert_str_to_numbers(answer)
        values.extend([answer] * count)
    return values


def map_likert_str_to_numbers(data):
    """Maps likert-scale str to numbers"""
    answer_map = {
        "Strongly disagree": 1,
        "Disagree": 2,
        "Neutral": 3,
        "Agree": 4,
        "Strongly agree": 5,
    }
    return answer_map[data]


def calculate_mode(data):
    """Returns mode for given list of data"""
    return mode(data)


def calculate_median(data):
    """Returns median for given list of data"""
    return median(data)


def calculate_variation_ratio(data):
    """Returns variation ratio for given list of data"""
    moodi = calculate_mode(data)
    mode_observations = data.count(moodi)
    total_observations = len(data)
    return 1 - (mode_observations / total_observations)
