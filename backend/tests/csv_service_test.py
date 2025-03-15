import pytest
from backend.services.csv_service import extract_questions_from_csv

def test_valid_questions():
    data = {"questions": ["q1", "q2"]}
    result = extract_questions_from_csv(data)

    assert result == ["q1", "q2"]

def test_empty_questions(capsys):
    data = {"questions": []}
    result = extract_questions_from_csv(data)

    assert result == []

def test_not_a_list():
    data = {"questions": "test"}
    result = extract_questions_from_csv(data)

    assert result == []

def test_no_questions():
    data = {}
    result = extract_questions_from_csv(data)

    assert result == []
