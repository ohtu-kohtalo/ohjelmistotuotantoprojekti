import unittest
from backend.services.agent_transformer import AgentTransformer
from backend.entities.agent import Agent
from unittest.mock import Mock


class TestAgentTranformerIntegration(unittest.TestCase):
    """Test agent future transformation. Tests the integration of AgentTranformer and Agent classes.
    The used LLM class is mocked so that get_response returns a predermined response.
    """

    def setUp(self):
        """Set up sample agents for testing."""

        def latent_variables(age: str, gender: str, latent_values: list):
            """Returns an info dictionary that can be used to create Agent instances"""
            info = {
                "Age": age,
                "Gender": gender,
                "Answers": {
                    "Overall happiness level": latent_values[0],
                    "Opposition to technology": latent_values[1],
                },
            }
            return info

        # Create a list of agents
        self.agents = [
            Agent(latent_variables("19", "male", [2.3, -0.1])),
            Agent(latent_variables("19", "male", [-3.0, -0.2])),
            Agent(latent_variables("19", "male", [0.0, -0.4])),
            Agent(latent_variables("19", "male", [1.9, 0.0])),
        ]

    def test_transform_agents_to_future(self):
        """Tests that transform_agents_to_future works correctly with good inputs."""
        mock_llm = Mock()

        # Set the response llm will give
        llm_answer = """

Respondent 1:
0.1
-0.2

Respondent 2:
1.3
2.3

Respondent 3:
0.0
-2.2

Respondent 4:
1.3
0.0
"""
        mock_llm.get_response.return_value = llm_answer

        transformer = AgentTransformer(mock_llm)
        scenario = "This is a future scenario"
        succeeded = transformer.transform_agents_to_future(self.agents, scenario)
        self.assertTrue(succeeded)
