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

    def test_get_all_answers_returns_all_answers(self):
        """Test that get_all_answers returns all the answers."""
        all_answers = self.agent.get_all_answers()
        self.assertEqual(
            all_answers,
            {
                "age": "40",
                "gender": "male",
                "when": "now",
            },
        )

    def test_get_agent_info_returns_info(self):
        """Test that get_agent_info returns the agent information"""
        info = self.agent.get_agent_info()
        expected = {"age": "40", "gender": "male", "when": "now"}

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
        self.assertEqual(future_info, {"Anwers": {}})

    def test_delete_future_info_and_questions(self):
        """Test that delete_future_info_and_questions resets future attributes."""
        self.agent.future_questions = {"q1": "yes"}
        self.agent.questions = {"q2": "no"}
        self.agent._Agent__future_info = {"Anwers": {"var1": 10}}

        self.agent.delete_future_info_and_questions()

        self.assertEqual(self.agent.get_agent_future_info(), {"Anwers": {}})
        self.assertEqual(self.agent.questions, {})
        self.assertEqual(self.agent.future_questions, {})
