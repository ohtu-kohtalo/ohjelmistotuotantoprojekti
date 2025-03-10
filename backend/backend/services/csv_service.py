def extract_questions_from_csv(data):
    """
    Suodattaa ja palauttaa kysymykset CSV-tiedostosta.

    Args:
        data (dict): JSON-data, joka sisältää CSV:n kysymykset.

    Returns:
        list: Lista kysymyksistä.
    """
    questions = data.get("questions", [])
    print(f"[DEBUG] Kysymykset luettu CSV:stä: {questions}", flush=True)

    if not isinstance(questions, list) or len(questions) == 0:
        print("[ERROR] CSV:ssä ei ollut kelvollisia kysymyksiä!", flush=True)
        return []

    return questions
