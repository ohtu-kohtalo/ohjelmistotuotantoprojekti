import unittest
from backend.load_dataset import load_dataset
from backend.services.create_agent_pool import create_agent_pool


class TestPoolCreation(unittest.TestCase):
    """Test that the agent pool is correctly created based on the given test data"""

    def setUp(self):
        self.data_frame = load_dataset("tests/data/test_data.csv")
        self.agent_pool = create_agent_pool(self.data_frame)

    def test_first_agent_correct(self):
        """Test that the correct distribution of answers is returned"""
        should_be = {"male": 2, "female": 2}
        distribution = self.agent_pool.get_answer_distribution("gender")
        self.assertEqual(should_be, distribution)
