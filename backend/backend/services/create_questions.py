import csv


def create_questions(questions_file_path, answers_file_path):
    """Saves the question ID, question text and answer choices of each question.

    Returns:
        Questions: A Questions object that has all of the questions in a dictionary.
    """

    questions = get_questions(questions_file_path)

    return questions


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
