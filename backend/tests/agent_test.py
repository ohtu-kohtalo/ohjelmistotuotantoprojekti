import unittest
from backend.entities.agent import Agent


class TestAgent(unittest.TestCase):
    def setUp(self):
        self.agent = Agent({"age": "40"})

    def test_get_answer_returns_existing_answer(self):
        """Test that when the question exists, get_answer returns the answer."""
        age = self.agent.get_answer("age")
        self.assertEqual(age, "40")

    def test_get_answer_returns_none(self):
        """Test that when the question does not exist, get_answer returns None."""
        answer = self.agent.get_answer("non_existent")
        self.assertEqual(None, answer)
