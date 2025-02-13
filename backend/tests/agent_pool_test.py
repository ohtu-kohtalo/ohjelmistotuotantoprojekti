import unittest
from backend.entities.agent_pool import AgentPool
from backend.entities.agent import Agent


class TestAgentPool(unittest.TestCase):
    def setUp(self):
        self.agent_pool = AgentPool([Agent({"name": "Hilda Maria"})])

    def test_agent(self):
        agents = self.agent_pool.get_agents()
        self.assertEqual(agents, "\n\n{'name': 'Hilda Maria'}")
