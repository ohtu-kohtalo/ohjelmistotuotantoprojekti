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
        print("[ERROR] No valid questions found in the CSV!", flush=True)
        return []

    elif len(questions) > 10:
        print("[ERROR] Too many questions found in the CSV! (more than 10)", flush=True)
        return []

    for question in questions:
        if len(question) > 200:
            print(
                "[ERROR] Question too long in the CSV! (length more than 200)",
                flush=True,
            )
            return []

    return questions
