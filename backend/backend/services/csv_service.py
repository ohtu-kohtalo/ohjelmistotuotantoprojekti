from typing import List


def extract_questions_from_csv(data) -> List[str]:
    """
    Extracts and returns questions from the uploaded CSV data.

    Args:
        data (dict): JSON data containing questions from the CSV file.

    Returns:
        list: A list of questions.
    """
    questions = data.get("questions", [])
    print(f"[DEBUG] Questions extracted from CSV: {questions}", flush=True)

    if not isinstance(questions, list) or len(questions) == 0:
        print("[ERROR] No valid questions found in the CSV!", flush=True)
        return []

    return questions
