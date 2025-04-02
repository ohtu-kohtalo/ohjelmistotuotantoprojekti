import unittest
from backend.services.agent_transformer import AgentTransformer


class TestAgentTransformer(unittest.TestCase):
    def setUp(self):
        """Set up sample agents for testing."""

        self.agents = [
            MockAgent(
                {"Meat production should be reduced.": [1]},
                {"Meat production should be reduced.": [2]},
                {"Answers": {"Overall happiness level": 2}},
            ),
            MockAgent(
                {"Meat production should be reduced.": [2]},
                {"Meat production should be reduced.": [1]},
                {"Answers": {"Overall happiness level": 3}},
            ),
            MockAgent(
                {"Meat production should be reduced.": [3]},
                {"Meat production should be reduced.": [4]},
                {"Answers": {"Overall happiness level": 4}},
            ),
            MockAgent(
                {"Meat production should be reduced.": [4]},
                {"Meat production should be reduced.": [4]},
                {"Answers": {"Overall happiness level": 5}},
            ),
            MockAgent(
                {"Meat production should be reduced.": [4]},
                {"Meat production should be reduced.": [5]},
                {"Answers": {"Overall happiness level": 1}},
            ),
        ]
        self.INTRO_BEGINNING = "Intro"
        self.INTRO_END = "End"
        self.PROMPT_END = "The End"

    def _add_agent_variable_values(self, agents, latent_variables):
        prompt = ""
        for i, agent in enumerate(agents):
            agent_info = agent.get_agent_info()
            prompt += f"Respondent {i+1}:\n"
            prompt += "Latent variable values:\n"

            # Add the values of the latent variables always in the same order.
            # The order is set in the latent_variables -variable
            for var_name in latent_variables:
                value = agent_info["Answers"].get(var_name, "N/A")
                if isinstance(value, float):
                    value = round(value, 1)
                prompt += f"{value}\n"

            prompt += "\n"
        return prompt

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

    def test_create_prompt(self):
        future_scenario = "future scenario"
        latent_variables = ["Overall happiness level"]
        result = AgentTransformer.create_prompt(
            self, self.agents, future_scenario, latent_variables
        )
        compare = "Introfuture scenarioEndRespondent 1:\nLatent variable values:\n2\n\nRespondent 2:\nLatent variable values:\n3\n\nRespondent 3:\nLatent variable values:\n4\n\nRespondent 4:\nLatent variable values:\n5\n\nRespondent 5:\nLatent variable values:\n1\n\nThe End"
        self.assertEqual(compare, result)

    def test_get_latent_variables(self):
        result = AgentTransformer._get_latent_variables(self, self.agents[0])
        self.assertEqual(["Overall happiness level"], result)

    def test_add_agent_variable_values(self):
        "Tests the return of variable values in prompt"
        latent_variables = ["Overall happiness level"]
        result = AgentTransformer._add_agent_variable_values(
            self, self.agents, latent_variables
        )
        compare = "Respondent 1:\nLatent variable values:\n2\n\nRespondent 2:\nLatent variable values:\n3\n\nRespondent 3:\nLatent variable values:\n4\n\nRespondent 4:\nLatent variable values:\n5\n\nRespondent 5:\nLatent variable values:\n1\n\n"
        self.assertEqual(compare, result)

    def test_only_empty_strings_in_a_list(self):
        """Tests whether a list contains only empty string."""

        string_list = ["", "", ""]
        result = AgentTransformer._only_empty_strings_in_a_list(self, string_list)
        self.assertEqual(True, result)
        string_list = [1, 3, 5]
        result = AgentTransformer._only_empty_strings_in_a_list(self, string_list)
        self.assertEqual(False, result)

    def test_future_variables_exist(self):
        """Test for the check to see if the first agent in the list has future latent variable values already set."""
        self.assertEqual(
            False, AgentTransformer.future_variables_exist(self, self.agents)
        )

    def test_delete_old_variables_and_questions(self):
        """Test to see hat agent info is reset"""
        AgentTransformer._delete_old_variables_and_questions(self, self.agents)
        self.assertEqual({}, self.agents[0].questions)


class MockAgent:
    """A class to mock Agent-objects"""

    def __init__(self, questions: dict, future_questions: dict, info: dict):
        """Creates an agent.

        Args:
            __info (dict): information about the agent, e.g. age and gender, answers to questions
            questions (dict): Questions by the user and answers to them by an LLM
        """
        # An example of questions:
        # {'Meat production should be reduced.': 2}
        self.questions = questions
        self.future_questions = future_questions
        self.__future_info = {"Answers": {}}
        self.__info = info

    def get_agent_info(self):
        return self.__info

    def get_agent_future_info(self):
        return self.__future_info

    def delete_future_info_and_questions(self):
        self.__future_info = {"Answers": {}}
        self.questions = {}
        self.future_questions = {}
