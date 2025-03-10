class GetData:
    """
    GetData class provides methods to manipulate and rescale data.

    Methods:

        rescale_to_likert(agent_data, latent_variable_columns, min_likert=1, max_likert=5):
        Returns:
            dict: Updated agent_data with rescaled latent variables into Lickert-scale.


    """

    def rescale_to_likert(
        agent_data, latent_variable_columns, min_likert=1, max_likert=5
    ):
        """
        Rescale the latent variables of an agent to a 1-5 Likert scale.

        Parameters:
            agent_data (dict): Dictionary with all fields including Age, Gender, and latent variables.
            latent_variable_columns (list): List of latent variable column names.
            min_likert (int): Minimum value of Likert scale.
            max_likert (int): Maximum value of Likert scale.

        Returns:
            dict: Updated agent_data with rescaled latent variables into Lickert-scale.
        """
        # Extract only the latent variable values
        latent_values = [float(agent_data[col]) for col in latent_variable_columns]

        # Calculate min and max across all agents (for normalization)
        global_min = min(latent_values)
        global_max = max(latent_values)

        # Handle case where all values are identical (no spread)
        if global_min == global_max:
            midpoint = (min_likert + max_likert) / 2
            for col in latent_variable_columns:
                agent_data[col] = round(midpoint)
        else:
            # Rescale each latent variable
            for col in latent_variable_columns:
                original_value = float(agent_data[col])
                rescaled_value = min_likert + (original_value - global_min) * (
                    max_likert - min_likert
                ) / (global_max - global_min)
                agent_data[col] = round(rescaled_value)

        return agent_data

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
