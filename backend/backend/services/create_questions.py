import csv
from ..entities.survey_questions import SurveyQuestions


def create_questions(questions_file_path, answers_file_path) -> SurveyQuestions:
    """Saves the question ID, question text and answer choices of each question.

    Returns:
        SurveyQuestions: An instance of SurveyQuestions, where the questions given in
        the files have been saved.
    """

    questions = get_questions(questions_file_path)
    choices = get_answer_choices(answers_file_path)

    survey = SurveyQuestions()
    for index in questions:
        if not index in choices:
            continue
        survey.add_question(index, questions[index], choices[index])

    return survey


def get_questions(questions_file_path):
    """Helper function for create_questions. Reads and saves the questions into a
    dictionary.

    Returns:
        dict:
            A dictionary where the question index is the key and the question text is
            the value"""
    questions_dict = {}

    with open(questions_file_path, mode="r", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter=";")

        next(reader)

        for row in reader:
            question_id, question_text = row
            question_text = question_text.replace("\t", "")
            questions_dict[question_id] = question_text

    return questions_dict


def get_answer_choices(answers_file_path):
    """Helper function for create_questions. Reads and saves the answers choices into a
    dictionary.

    Returns:
        dict:
            A dictionary where the question index is the key and the value is a
            dictionary containing the answer choices. E.g.
            **{'Q1': {'1': 'answer_choice_1, '2': 'answer_choice_2}}**

    Raises:
        ValueError:
            'Expected an integer'. Answer choices must be numbered and
            the number must preced the answer choice. This error indicates that the
            data was not in the expected format."""
    answer_choices = {}

    with open(answers_file_path, mode="r", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter=";")

        for row in reader:
            choices = {}
            for i in range(1, len(row), 2):
                try:
                    int(row[i])
                except ValueError as exc:
                    raise ValueError(f"Expected an integer. Got '{row[i]}'") from exc
                choices[row[i]] = row[i + 1].replace("/v", "")
            answer_choices[row[0]] = choices

    return answer_choices
