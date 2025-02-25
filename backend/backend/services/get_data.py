class GetData:
    """This class provides methods to get data about agents.

    Attributes:
        survey (SurveyQuestions):
            A SurveyQuestions object that has the questions and answer choices.
        agent_pool (AgentPool):
            An AgentPool object that has the agents and their answers to questions."""

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

    def get_prompts(self, question: str) -> list[str]:
        """Creates one prompt for each agent. The prompt asks the LLM to answer the
        question based on the information given about the agent.

        Returns:
            list: The prompts in text form in a list."""

        prompts = []
        for agent in self.agent_pool.agents():
            prompt = ""
            answers = agent.get_all_answers()
            for question_id, answer in answers.items():
                prompt += self.add_question_and_answer_to_prompt(question_id, answer)

            prompt = self.add_texts_to_beginning_and_end(prompt, question)
            prompts.append(prompt)

        return prompts

    def list_answer_choices(self, question_dict: dict) -> str:
        """Convert the answer choices to a numbered list."""
        choice_list = ""
        for number, choice in question_dict["answer_choices"].items():
            choice_list += f"\n{number} {choice}"

        return choice_list

    def answer_to_text(self, answer: str, question_dict: dict) -> str:
        """Convert the answer from a number to text."""
        return question_dict["answer_choices"][answer]

    def add_question_and_answer_to_prompt(self, question_id: str, answer: str):
        """Lists the question, answer_choices and the agent's answer and returns them in
        a string."""
        prompt = ""
        question_dict = self.survey.question(question_id)
        answer_choices = self.list_answer_choices(question_dict)
        answer_in_text = self.answer_to_text(answer, question_dict)

        prompt += f"\nKysymys: {question_dict["question"]}"
        prompt += f"\nVastausvaihtoehdot: {answer_choices}"
        prompt += f"\nVastaus: {answer_in_text}"
        return prompt

    def add_texts_to_beginning_and_end(self, prompt: str, question: str) -> str:
        """Add texts that describe what the LLM should do with the agent."""
        beginning = (
            "Minulla on kyselytietoja henkilöistä. Näytän sinulle nyt yhden "
            "henkilön tiedot. Olen listannut alle kysymykset, "
            "vastausvaihtoehdot ja henkilön antaman vastauksen.\n"
        )
        end = (
            "\n\nEsitän sinulle nyt kysymyksen ja haluan että vastaat "
            "kysymykseen, niin kuin olettaisit kuvaillun henkilön vastaavan. Anna vain "
            f"vastaus kysymykseen äläkä mitään muuta. Kysymys on: {question}"
        )
        return beginning + prompt + end
