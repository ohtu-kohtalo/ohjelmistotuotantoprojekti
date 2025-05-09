import unittest
from backend.entities.agent import Agent


class TestAgent(unittest.TestCase):
    def setUp(self):
        Agent._id_counter = 0
        self.agent = Agent(
            {
                "age": "40",
                "gender": "male",
                "when": "now",
            }
        )

    def test_get_answer_returns_existing_answer(self):
        """Test that when the question exists, get_answer returns the answer."""
        age = self.agent.get_answer("age")
        self.assertEqual(age, "40")

    def test_get_answer_returns_none(self):
        """Test that when the question does not exist, get_answer returns None."""
        answer = self.agent.get_answer("non_existent")
        self.assertEqual(None, answer)

    def test_get_agent_info_returns_info(self):
        """Test that get_agent_info returns the agent information"""
        info = self.agent.get_agent_info()
        expected = {"age": "40", "gender": "male", "when": "now"}

        self.assertEqual(expected, info)

    def test_get_id(self):
        """Test that get_id returns the agent id"""
        self.assertEqual(self.agent.get_id(), 0)

        second_agent = Agent(
            {
                "age": "32",
                "gender": "female",
                "when": "now",
            }
        )

        self.assertEqual(second_agent.get_id(), 1)

    def test_get_agent_future_info(self):
        """Test that get_agent_future_info returns the future info."""
        future_info = self.agent.get_agent_future_info()
        self.assertEqual(future_info, {"Answers": {}})

    def test_delete_future_info_and_questions(self):
        """Test that delete_future_info_and_questions resets future attributes."""
        self.agent.future_questions = {"q1": "3"}
        self.agent.questions = {"q2": "2"}
        self.agent._Agent__future_info = {"Answers": {"var1": 10}}

        self.agent.delete_future_info_and_questions()

        self.assertEqual(self.agent.get_agent_future_info(), {"Answers": {}})
        self.assertEqual(self.agent.questions, {})
        self.assertEqual(self.agent.future_questions, {})

    def test_save_new_future_latent_variables(self):
        """Test that save_new_future_latent_variables updates future_info correctly."""
        new_variables = {"var1": 10, "var2": 20}
        self.agent.save_new_future_latent_variables(new_variables)
        self.assertEqual(self.agent.get_agent_future_info(), {"Answers": new_variables})
