import unittest
from backend.load_dataset import load_dataset
from backend.services.create_questions import get_questions


class TestCreateQuestion(unittest.TestCase):
    """Test that the questions are correctly created"""

    def setUp(self):
        self.file_path = "tests/data/question_test.csv"

    def test_get_questions(self):
        """Test that the questions are returned in a dictionary in the right form"""
        should_be = {"Q1": "How old are you", "Q2": "Who are you", "Q3": "What are you"}
        questions = get_questions(self.file_path)
        self.assertEqual(should_be, questions)
