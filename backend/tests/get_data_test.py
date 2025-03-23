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
                "data": [
                    {"label": "Strongly Disagree", "value": 1},
                    {"label": "Disagree", "value": 1},
                    {"label": "Neutral", "value": 1},
                    {"label": "Agree", "value": 2},
                    {"label": "Strongly Agree", "value": 0},
                ],
                "statistics": {"median": 3, "mode": 4, "variation ratio": 0.6},
            },
        ]
        self.assertEqual(excepted, distributions)

    def test_get_answer_distributions_two_questions(self):
        """Test get_answer_distributions gives distributions for two answers."""
        # Add a new agent to the beginning of the agents list
        self.agents.insert(
            0,
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
                "data": [
                    {"label": "Strongly Disagree", "value": 2},
                    {"label": "Disagree", "value": 1},
                    {"label": "Neutral", "value": 1},
                    {"label": "Agree", "value": 2},
                    {"label": "Strongly Agree", "value": 0},
                ],
                "statistics": {
                    "median": 2.5,
                    "mode": 1,
                    "variation ratio": 0.6666666666666667,
                },
            },
            {
                "question": "Vegetable production should be reduced.",
                "data": [
                    {"label": "Strongly Disagree", "value": 0},
                    {"label": "Disagree", "value": 0},
                    {"label": "Neutral", "value": 0},
                    {"label": "Agree", "value": 0},
                    {"label": "Strongly Agree", "value": 1},
                ],
                "statistics": {"median": 5, "mode": 5, "variation ratio": 0.0},
            },
        ]
        self.assertEqual(excepted, distributions)

    def test_duplicate_question_in_first_agent(self):
        """Test that duplicate questions in the first agent are not processed twice."""
        
        # Custom dictionary that yields duplicate items for a key.
        class DuplicateKeyDict(dict):
            def items(self):
                # Yield each item twice for a specific key
                for k, v in super().items():
                    yield k, v
                    if k == "Meat production should be reduced.":
                        yield k, v

        # Create a first agent using DuplicateKeyDict.
        duplicate_agent = MockAgent(
            DuplicateKeyDict({"Meat production should be reduced.": 1})
        )
        # Combine with the remaining agents (skipping the original first agent).
        agents = [duplicate_agent] + self.agents[1:]
        distributions = self.get_data.get_answer_distributions(agents)

        expected = [
            {
                "question": "Meat production should be reduced.",
                "data": [
                    {"label": "Strongly Disagree", "value": 2},
                    {"label": "Disagree", "value": 1},
                    {"label": "Neutral", "value": 1},
                    {"label": "Agree", "value": 2},
                    {"label": "Strongly Agree", "value": 0},
                ],
                "statistics": {
                    "median": 2.5,
                    "mode": 1,
                    "variation ratio": 0.6666666666666667,
                },
            }
        ]
        self.assertEqual(expected, distributions)


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
