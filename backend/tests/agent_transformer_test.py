import unittest
from backend.services.agent_transformer import AgentTransformer


class TestAgentTransformer(unittest.TestCase):
    def setUp(self):
        pass

    def test_parse_response_fails(self):
        """Test that an error is raised, when the LLM's response does not have new latent variables
        for all agents."""
        self.transformer = AgentTransformer("This is a mock llm")
        response = """

Respondent 1:
0.1
-0.2

Respondent 2:
1.3
2.3
"""
        number_of_agents = 3
        latent_variables = ["Variable 1", "Variable 2"]
        # self.transformer._parse_response(response, number_of_agents, latent_variables)
        with self.assertRaises(RuntimeError):
            self.transformer._parse_response(
                response, number_of_agents, latent_variables
            )
