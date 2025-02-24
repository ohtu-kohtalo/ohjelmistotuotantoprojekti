import unittest
from backend.entities.survey_questions import SurveyQuestions


class TestSurveyQuestions(unittest.TestCase):
    """Tests for the class SurveyQuestions"""

    def setUp(self):
        self.survey = SurveyQuestions()

    def test_add_question(self):
        """Test that questions can be added to a SurveyQuestions."""
        should_be = {
            "Q1": {
                "question": "How old are you",
                "answer_choices": {
                    "1": "less than 18 years old",
                    "2": "18 - 64 years old",
                    "3": "65 or more years old",
                },
            }
        }
        choices = {
            "1": "less than 18 years old",
            "2": "18 - 64 years old",
            "3": "65 or more years old",
        }
        self.survey.add_question("Q1", "How old are you", choices)
        self.assertEqual(should_be, self.survey.questions())

    def test_add_question_raises_error(self):
        """Test that questions can not be added using the same index."""
        self.survey.add_question("Q1", "How old are you", {"1": "old"})

        with self.assertRaises(RuntimeError):
            self.survey.add_question("Q1", "How are you", {"1": "good"})

    def test_question(self):
        """Test that the question can be retrieved by index."""
        choices = {
            "1": "less than 18 years old",
            "2": "18 - 64 years old",
            "3": "65 or more years old",
        }
        self.survey.add_question("Q1", "How old are you", choices)
        expected = {
            "question": "How old are you",
            "answer_choices": {
                "1": "less than 18 years old",
                "2": "18 - 64 years old",
                "3": "65 or more years old",
            },
        }
        self.assertEqual(expected, self.survey.question("Q1"))
