import unittest
from backend.services.get_data import GetData


class TestGetData(unittest.TestCase):
    """Tests for the class GetData."""

    def setUp(self):
        """Set up sample agents for testing."""
        self.get_data = GetData()
        self.agents = [
            MockAgent({"Meat production should be reduced.": [1]},{"Meat production should be reduced.": [2]}),
            MockAgent({"Meat production should be reduced.": [2]},{"Meat production should be reduced.": [1]}),
            MockAgent({"Meat production should be reduced.": [3]},{"Meat production should be reduced.": [4]}),
            MockAgent({"Meat production should be reduced.": [4]},{"Meat production should be reduced.": [4]}),
            MockAgent({"Meat production should be reduced.": [4]},{"Meat production should be reduced.": [5]}),
        ]

    def test_get_answer_distributions(self):
        """Test get_answer_distributions gives correct distributions for one question."""
        distributions = self.get_data.get_answer_distributions(0, self.agents)
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
                    "Meat production should be reduced.": [1],
                    "Vegetable production should be reduced.": [5],
                },
                {
                    "Meat production should be reduced.": [2],
                    "Vegetable production should be reduced.": [4],
                },
            ),
        )
        distributions = self.get_data.get_answer_distributions(0, self.agents)
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

    def test_get_answer_distributions_future(self):
        """Test get_answer_distributions gives distributions for future agents."""
        # Add a new agent to the beginning of the agents list
        self.agents.insert(
            0,
            MockAgent(
                {
                    "Meat production should be reduced.": [1],
                    "Vegetable production should be reduced.": [5],
                },
                 {
                    "Meat production should be reduced.": [2],
                    "Vegetable production should be reduced.": [4],
                },
            ),
        )
        distributions = self.get_data.get_answer_distributions(0, self.agents, True)
        print(distributions)
        excepted = [
            {
                "question": "Meat production should be reduced.",
                "data": [
                    {"label": "Strongly Disagree", "value": 1},
                    {"label": "Disagree", "value": 2},
                    {"label": "Neutral", "value": 0},
                    {"label": "Agree", "value": 2},
                    {"label": "Strongly Agree", "value": 1},
                ],
                "statistics": {
                    "median": 3.0,
                    "mode": 2,
                    "variation ratio": 0.6666666666666667,
                },
            },
            {
                "question": "Vegetable production should be reduced.",
                "data": [
                    {"label": "Strongly Disagree", "value": 0},
                    {"label": "Disagree", "value": 0},
                    {"label": "Neutral", "value": 0},
                    {"label": "Agree", "value": 1},
                    {"label": "Strongly Agree", "value": 0},
                ],
                "statistics": {"median": 4, "mode": 4, "variation ratio": 0.0},
            },
        ]
        self.assertEqual(excepted, distributions)


class MockAgent:
    """A class to mock Agent-objects"""

    def __init__(self, questions: dict, future_questions: dict):
        """Creates an agent.

        Args:
            __info (dict): information about the agent, e.g. age and gender, answers to questions
            questions (dict): Questions by the user and answers to them by an LLM
        """
        # An example of questions:
        # {'Meat production should be reduced.': 2}
        self.questions = questions
        self.future_questions = future_questions
