import unittest
from backend.services.get_data import GetData


class TestGetData(unittest.TestCase):
    """Tests for the class GetData."""

    def setUp(self):
        """Set up sample agents for testing."""
        self.get_data = GetData()
        self.agents = [
            MockAgent({"Meat production should be reduced.": 1}),
            MockAgent({"Meat production should be reduced.": 2}),
            MockAgent({"Meat production should be reduced.": 3}),
            MockAgent({"Meat production should be reduced.": 4}),
            MockAgent({"Meat production should be reduced.": 4}),
        ]

    def test_get_answer_distributions(self):
        """Test get_answer_distributions gives correct distributions for one question."""
        distributions = self.get_data.get_answer_distributions(self.agents)
        excepted = [
            {
                "question": "Meat production should be reduced.",
                "answers": {
                    "Strongly agree": 0,
                    "Agree": 2,
                    "Neutral": 1,
                    "Disagree": 1,
                    "Strongly disagree": 1,
                },
            }
        ]
        self.assertEqual(excepted, distributions)

    def test_get_answer_distributions_two_questions(self):
        """Test get_answer_distributions gives distributions for two answers."""
        self.agents.append(
            MockAgent(
                {
                    "Meat production should be reduced.": 1,
                    "Vegetable production should be reduced.": 5,
                },
            ),
        )
        distributions = self.get_data.get_answer_distributions(self.agents)
        excepted = [
            {
                "question": "Meat production should be reduced.",
                "answers": {
                    "Strongly agree": 0,
                    "Agree": 2,
                    "Neutral": 1,
                    "Disagree": 1,
                    "Strongly disagree": 2,
                },
            },
            {
                "question": "Vegetable production should be reduced.",
                "answers": {
                    "Strongly agree": 1,
                    "Agree": 0,
                    "Neutral": 0,
                    "Disagree": 0,
                    "Strongly disagree": 0,
                },
            },
        ]
        self.assertEqual(excepted, distributions)


class MockAgent:
    """A class to mock Agent-objects"""

    def __init__(self, new_questions: dict):
        """Creates an agent.

        Args:
            __info (dict): information about the agent, e.g. age and gender, answers to questions
            new_questions (dict): Questions by the user and answers to them by an LLM
        """
        # An example of new_questions:
        # {'Meat production should be reduced.': 2}
        self.new_questions = new_questions
