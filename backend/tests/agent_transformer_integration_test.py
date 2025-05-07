import unittest
from unittest.mock import Mock
from backend.services.agent_transformer import AgentTransformer
from backend.entities.agent import Agent


class TestAgentTranformerIntegration(unittest.TestCase):
    """Test agent future transformation. Tests the integration of AgentTranformer and Agent classes.
    The used LLM class is mocked so that get_response returns a predermined response.
    """

    def setUp(self):
        """Set up sample agents for testing."""
        self.scenario = "This is a future scenario"
        self.mock_llm = Mock()

        def agent_variables(age: str, gender: str, latent_values: list):
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
            Agent(agent_variables("19", "male", [2.3, -0.1])),
            Agent(agent_variables("20", "male", [-3.0, -0.2])),
            Agent(agent_variables("19", "female", [0.0, -0.4])),
            Agent(agent_variables("21", "female", [1.9, 0.0])),
        ]

    def test_transform_agents_to_future(self):
        """Tests that transform_agents_to_future works correctly with good inputs."""

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
        self.mock_llm.get_response.return_value = llm_answer

        transformer = AgentTransformer(self.mock_llm)
        succeeded = transformer.transform_agents_to_future(self.agents, self.scenario)
        self.assertTrue(succeeded)

    def test_too_few_respondents(self):
        """Tests that transform_agents_to_future raises an error if all respondents did not get new
        variables."""

        # Set too few respondents in the llm's response
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

"""
        self.mock_llm.get_response.return_value = llm_answer
        transformer = AgentTransformer(self.mock_llm)

        with self.assertRaises(RuntimeError):
            transformer.transform_agents_to_future(self.agents, self.scenario)

    def test_too_many_respondents(self):
        """Tests that transform_agents_to_future raises an error if the llm's response has too many
        respondents."""

        # Set too many respondents in the llm's response
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
0.0
-3.2

Respondent 5:
0.0
-1.2

"""
        self.mock_llm.get_response.return_value = llm_answer
        transformer = AgentTransformer(self.mock_llm)

        with self.assertRaises(RuntimeError):
            transformer.transform_agents_to_future(self.agents, self.scenario)

    def test_too_few_variables(self):
        """Tests that transform_agents_to_future raises an error if the llm's response has too few
        new variables for some respondent."""

        # Set too many respondents in the llm's response
        llm_answer = """

Respondent 1:
0.1
-0.2

Respondent 2:
1.3
2.3

Respondent 3:
0.2

Respondent 4:
0.0
-3.2

"""
        self.mock_llm.get_response.return_value = llm_answer
        transformer = AgentTransformer(self.mock_llm)

        with self.assertRaises(RuntimeError):
            transformer.transform_agents_to_future(self.agents, self.scenario)
