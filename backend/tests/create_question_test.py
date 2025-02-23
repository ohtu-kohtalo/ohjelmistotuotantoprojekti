import unittest
from backend.services.create_questions import (
    get_questions,
    get_answer_choices,
    create_questions,
)


class TestCreateQuestions(unittest.TestCase):
    """Test that the questions are correctly created"""

    def setUp(self):
        self.questions_file_path = "tests/data/question_test.csv"
        self.answers_file_path = "tests/data/answer_choices_test.csv"
        self.invalid_answers_file_path = "tests/data/invalid_answer_choices_test.csv"

    def test_get_questions(self):
        """Test that the questions are returned in a dictionary in the right form"""
        should_be = {"Q1": "How old are you", "Q2": "Who are you", "Q3": "What are you"}
        questions = get_questions(self.questions_file_path)
        self.assertEqual(should_be, questions)

    def test_get_answer_choices(self):
        """Test that the answer choices are returned in a dictionary in the right form"""
        should_be = {
            "Q1": {
                "1": "less than 18 years old",
                "2": "18 - 64 years old",
                "3": "65 or more years old",
            },
            "Q2": {"1": "cat", "2": "dog", "3": "you", "4": "I"},
            "Q3": {
                "1": "lazy",
            },
        }
        answers = get_answer_choices(self.answers_file_path)
        self.assertEqual(should_be, answers)

    def test_create_questions(self):
        """Test that the SurveyQuestion objects are created correctly."""
        survey = create_questions(self.questions_file_path, self.answers_file_path)
        questions = survey.questions()
        should_be = {
            "question": "Who are you",
            "answer_choices": {"1": "cat", "2": "dog", "3": "you", "4": "I"},
        }
        self.assertEqual(should_be, questions["Q2"])

    def test_get_answer_choices_invalid_format(self):
        """Test that ValueError is raised when an answer choice is incorrectly formatted."""
        with self.assertRaises(ValueError) as context:
            get_answer_choices(self.invalid_answers_file_path)

        self.assertIn("Expected an integer", str(context.exception))
