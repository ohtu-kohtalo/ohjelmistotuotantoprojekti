import unittest
from backend.load_dataset import load_dataset
from backend.services.create_agent_pool import create_agent_pool


class TestPoolCreation(unittest.TestCase):
    """Test that the agent pool is correctly created based on the given test data"""

    def setUp(self):
        self.data_frame = load_dataset("tests/data/test_data.csv")
        self.agent_pool = create_agent_pool(self.data_frame)

    def test_correct_number_of_agents(self):
        """Test that the correct number of agents was created"""
        self.assertEqual(4, len(self.agent_pool.agents))

    def test_first_agent_correct(self):
        """Test that the first agent in the pool has the correct info"""
        should_be = {
            "age": "20",
            "gender": "female",
            "region": "Uusimaa",
            "level of education": "upper secondary education",
            "occupation": "student",
            "political party affiliation": "The Greens",
            "Overall, things are getting better in society": "agree",
        }
        first_agent = self.agent_pool.agents[0].info
        self.assertEqual(should_be, first_agent)
