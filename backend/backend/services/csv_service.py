from typing import List, Dict, Any


def extract_questions_from_csv(data: Dict[str, Any]) -> List[str]:
    """
    Extracts and returns questions from the uploaded CSV data.

    Args:
        data (dict): JSON data containing questions from the CSV file.

    Returns:
        list: A list of questions.
    """
    questions = data.get("questions", [])

    if not isinstance(questions, list) or len(questions) == 0:
        # No valid questions found in the CSV
        return []

    elif len(questions) > 10:
        # Too many questions found in the CSV
        return []

    for question in questions:
        if len(question) > 200:
            # Question too long in the CSV
            return []

    return questions
