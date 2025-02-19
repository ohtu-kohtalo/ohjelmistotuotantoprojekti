import unittest
from backend.entities.agent_pool import AgentPool
from backend.entities.agent import Agent


class TestAgentPool(unittest.TestCase):
    def setUp(self):
        self.agent_pool = AgentPool(
            [Agent({"age": "40"}), Agent({"age": "70"}), Agent({"age": "40"})]
        )

    def test_get_answer_distribution(self):
        """Test that the get_answer_distribution returns the distribution of the answers."""
        distribution = self.agent_pool.get_answer_distribution("age")
        should_be = {"40": 2, "70": 1}
        self.assertEqual(should_be, distribution)
