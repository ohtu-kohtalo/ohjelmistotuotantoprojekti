import pytest
from backend.services.csv_service import extract_questions_from_csv


def test_valid_questions():
    """Test that extract_questions_from_csv returns the correct questions with a valid input."""
    data = {"questions": ["q1", "q2"]}
    result = extract_questions_from_csv(data)

    assert result == ["q1", "q2"]


def test_empty_questions():
    """Test that extract_questions_from_csv returns an empty list with an empty input."""
    data = {"questions": []}
    result = extract_questions_from_csv(data)

    assert result == []


def test_not_a_list():
    """Test that extract_questions_from_csv returns an empty list with a non-list input."""
    data = {"questions": "test"}
    result = extract_questions_from_csv(data)

    assert result == []


def test_no_questions():
    """Test that extract_questions_from_csv returns an empty list with no questions key."""
    data = {}
    result = extract_questions_from_csv(data)

    assert result == []


def test_too_many_questions():
    """Test that extract_questions_from_csv returns an empty list with too many questions."""
    data = {
        "questions": [
            "q1",
            "q2",
            "q3",
            "q4",
            "q5",
            "q6",
            "q6",
            "q7",
            "q8",
            "q9",
            "q10",
            "q11",
        ]
    }
    result = extract_questions_from_csv(data)

    assert result == []


def test_question_too_long():
    """
    Test that extract_questions_from_csv returns an empty list with a question that is too long.
    """
    data = {"questions": ["a" * 201]}
    result = extract_questions_from_csv(data)

    assert result == []
