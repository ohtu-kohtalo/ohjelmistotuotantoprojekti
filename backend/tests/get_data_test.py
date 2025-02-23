import unittest
from unittest.mock import Mock
from backend.services.get_data import GetData


class TestGetData(unittest.TestCase):
    """Tests for the class GetData"""

    def setUp(self):

        def side_effect_func(arg):
            """Return values for mock_survey, when method questions is called."""
            responses = {
                "Q1": {
                    "question": "gender",
                    "answer_choices": {"1": "female", "2": "male", "3": "other"},
                },
                "Q2": {
                    "question": "when",
                    "answer_choices": {
                        "1": "now",
                    },
                },
                "Q3": {
                    "question": "politics",
                    "answer_choices": {"1": "liberal", "4": "conservative"},
                },
            }
            return responses.get(arg)

        mock_survey = Mock()
        mock_survey.question.side_effect = side_effect_func

        mock_agent_pool = Mock()
        self.get_data = GetData(mock_survey, mock_agent_pool)

        self.distribution = {
            "Q1": {"1": "100", "2": "200", "3": "300"},
            "Q2": {" ": "20", "1": "222"},
            "Q3": {"1": "40", "2": "100", "3": "80", "4": "30"},
        }

        mock_agent_pool.all_distributions.return_value = self.distribution

    def test_make_distributions_readable(self):
        """Test the method make_distributions_readable."""
        should_be = {
            "gender": {"female": "100", "male": "200", "other": "300"},
            "when": {"Tieto puuttuu": "20", "now": "222"},
            "politics": {"liberal": "40", "2": "100", "3": "80", "conservative": "30"},
        }
        dist = self.get_data.make_distributions_readable(self.distribution)
        self.assertEqual(should_be, dist)

    def test_get_all_distributions(self):
        """Test the method get_all_distributions."""
        expected_output = {
            "gender": {"female": "100", "male": "200", "other": "300"},
            "when": {"Tieto puuttuu": "20", "now": "222"},
            "politics": {"liberal": "40", "2": "100", "3": "80", "conservative": "30"},
        }
        actual_output = self.get_data.get_all_distributions()
        self.assertEqual(actual_output, expected_output)
