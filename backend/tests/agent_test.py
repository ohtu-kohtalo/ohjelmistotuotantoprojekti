import unittest
from backend.entities.agent import Agent


class TestAgent(unittest.TestCase):
    def setUp(self):
        self.agent = Agent(
            {
                "age": "40",
                "gender": "male",
                "when": "now",
            }
        )

    def test_get_answer_returns_existing_answer(self):
        """Test that when the question exists, get_answer returns the answer."""
        age = self.agent.get_answer("age")
        self.assertEqual(age, "40")

    def test_get_answer_returns_none(self):
        """Test that when the question does not exist, get_answer returns None."""
        answer = self.agent.get_answer("non_existent")
        self.assertEqual(None, answer)

    def test_get_all_answers_returns_all_answers(self):
        """Test that get_all_answers returns all the answers."""
        all_answers = self.agent.get_all_answers()
        self.assertEqual(
            all_answers,
            {
                "age": "40",
                "gender": "male",
                "when": "now",
            },
        )

    def test_get_agent_info_returns_info(self):
        """Test that get_agent_info returns the agent information"""
        info = self.agent.get_agent_info()
        expected = {
            "age": "40",
            "gender": "male",
            "when": "now"
        }
