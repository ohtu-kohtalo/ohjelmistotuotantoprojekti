import pytest
from backend.services.csv_service import extract_questions_from_csv


def test_valid_questions(capsys):
    data = {"questions": ["q1", "q2"]}
    result = extract_questions_from_csv(data)

    assert result == ["q1", "q2"]

    debug = capsys.readouterr().out


def test_empty_questions(capsys):
    data = {"questions": []}
    result = extract_questions_from_csv(data)

    assert result == []

    debug = capsys.readouterr().out
    assert "No valid questions found in the CSV!" in debug


def test_not_a_list(capsys):
    data = {"questions": "test"}
    result = extract_questions_from_csv(data)

    assert result == []

    debug = capsys.readouterr().out
    assert "No valid questions found in the CSV!" in debug


def test_no_questions(capsys):
    data = {}
    result = extract_questions_from_csv(data)

    assert result == []

    debug = capsys.readouterr().out
    assert "No valid questions found in the CSV!" in debug
