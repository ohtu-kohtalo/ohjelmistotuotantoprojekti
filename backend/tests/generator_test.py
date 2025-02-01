import unittest
from unittest.mock import MagicMock
from backend.generator import Generator


class TestGenerator(unittest.TestCase):
    def setUp(self):
        self.mock_gemini = MagicMock()
        self.mock_gemini.get_response.side_effect = lambda x: x
        self.generator = Generator(self.mock_gemini)

    def test_simulate_customer(self):
        response = self.generator.create_agents("Mokia", "IT", 3)
        should_be = (
            "Simulate 3 customer profiles for a company. The name of the company "
            "is Mokia and its industry is IT. Here are the customer demographics:\n"
        )
        self.assertTrue(response.startswith(should_be))
        self.assertIn("Here are the customer demographics:", response)
