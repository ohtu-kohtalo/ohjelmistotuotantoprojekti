import unittest
from backend.entities.agent_pool import AgentPool
from backend.entities.agent import Agent


class TestAgentPool(unittest.TestCase):
    def setUp(self):
        a1 = Agent({"T2": "40", "T1": "male"})
        a2 = Agent({"T2": "50", "T1": "female"})
        a3 = Agent({"T2": "60", "T1": "male"})
        a4 = Agent({"T2": "70", "T1": "female"})
        a5 = Agent({"T2": "40", "T1": "female"})
        self.agent_pool = AgentPool([a1, a2, a3, a4, a5])
        self.agents = [a1, a2, a3, a4, a5]

    def test_get_agents(self):
        """Test that agents method returns the correct list of agents."""
        self.assertEqual(self.agent_pool.agents(), self.agents)

    def test_get_answer_distribution(self):
        """Test that get_answer_distribution returns the distribution of a answer."""
        distribution = self.agent_pool.answer_distribution("T2")
        should_be = {"40": 2, "50": 1, "60": 1, "70": 1}
        self.assertEqual(should_be, distribution)

    def test_get_all_distributions(self):
        """Test that get_all_distributions returns the distribution of all answers."""
        distributions = self.agent_pool.all_distributions()
        should_be = {
            "T1": {"male": 2, "female": 3},
            "T2": {"40": 2, "50": 1, "60": 1, "70": 1},
            "T3": {None: 5},
            "T4": {None: 5},
            "T5": {None: 5},
            "T5B": {None: 5},
            "T8": {None: 5},
            "T9": {None: 5},
            "T10": {None: 5},
            "T11": {None: 5},
            "T12": {None: 5},
            "T13": {None: 5},
            "T14": {None: 5},
            "bv1": {None: 5},
            "Q20": {None: 5},
            "Q17B": {None: 5},
            "Q17C": {None: 5},
            "Q17D": {None: 5},
        }
        self.assertEqual(should_be, distributions)
