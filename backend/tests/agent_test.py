import unittest
from backend.entities.agent import Agent


class TestAgent(unittest.TestCase):
    def setUp(self):
        self.agent = Agent({"age": "40"})

    def test_agent(self):
        info = self.agent.info
        self.assertEqual(info, {"age": "40"})
