import unittest
from unittest.mock import MagicMock, patch
import pandas as pd
from backend.generator import Generator


class TestGenerator(unittest.TestCase):
    def setUp(self):
        self.mock_gemini = MagicMock()
        self.mock_gemini.get_response.side_effect = lambda x: x
        self.generator = Generator(self.mock_gemini)
    
    @patch('pandas.read_csv') 
    def test_simulate_customer(self, mock_read_csv):
        mock_data = pd.DataFrame({
            'T1': [1, 2, 3],
            'T2': [1, 2, 3],
            'T3': [1, 2, 3],
            'T4': [1, 2, 3],
            'T5': [1, 2, 3],
        })
        mock_read_csv.return_value = mock_data
        response = self.generator.create_agents("Mokia", "IT", 3)
        should_be = (
            "Simulate 3 customer profiles for a company. The name of the company "
            "is Mokia and its industry is IT."
        )
        self.assertTrue(response.startswith(should_be))
