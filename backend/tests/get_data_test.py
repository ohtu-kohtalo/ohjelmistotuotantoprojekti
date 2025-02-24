import unittest
from unittest.mock import Mock
from backend.services.get_data import GetData


class TestGetData(unittest.TestCase):
    """Tests for the class GetData"""

    def setUp(self):

        def side_effect_questions(arg):
            """Return values for mock_survey, when method questions is called."""
            responses = {
                "Q1": {
                    "question": "gender",
                    "answer_choices": {"1": "female", "2": "male", "3": "other"},
                },
                "Q2": {
                    "question": "when",
                    "answer_choices": {
                        "1": "now",
                    },
                },
                "Q3": {
                    "question": "politics",
                    "answer_choices": {"1": "liberal", "4": "conservative"},
                },
            }
            return responses.get(arg)

        mock_survey = Mock()
        mock_survey.question.side_effect = side_effect_questions

        mock_agent1 = Mock()
        mock_agent1.get_all_answers.return_value = {"Q1": "1", "Q2": "1"}
        
        mock_agent2 = Mock()
        mock_agent2.get_all_answers.return_value = {"Q1": "2", "Q3": "4"}

        mock_agent_pool = Mock()
        mock_agent_pool.agents = Mock(return_value=[mock_agent1, mock_agent2])
        self.get_data = GetData(mock_survey, mock_agent_pool)

        self.distribution = {
            "Q1": {"1": "100", "2": "200", "3": "300"},
            "Q2": {" ": "20", "1": "222"},
            "Q3": {"1": "40", "2": "100", "3": "80", "4": "30"},
        }

        mock_agent_pool.all_distributions.return_value = self.distribution

    def test_make_distributions_readable(self):
        """Test the method make_distributions_readable."""
        should_be = {
            "gender": {"female": "100", "male": "200", "other": "300"},
            "when": {"Tieto puuttuu": "20", "now": "222"},
            "politics": {"liberal": "40", "2": "100", "3": "80", "conservative": "30"},
        }
        dist = self.get_data.make_distributions_readable(self.distribution)
        self.assertEqual(should_be, dist)

    def test_get_all_distributions(self):
        """Test the method get_all_distributions."""
        expected_output = {
            "gender": {"female": "100", "male": "200", "other": "300"},
            "when": {"Tieto puuttuu": "20", "now": "222"},
            "politics": {"liberal": "40", "2": "100", "3": "80", "conservative": "30"},
        }
        actual_output = self.get_data.get_all_distributions()
        self.assertEqual(actual_output, expected_output)

    def test_add_question_and_answer_to_prompt(self):
        should_be = (
            "\nKysymys: gender"
            "\nVastausvaihtoehdot: "
            "\n1 female"
            "\n2 male"
            "\n3 other"
            "\nVastaus: male"
        )
        prompt = self.get_data.add_question_and_answer_to_prompt("Q1", "2")
        self.assertEqual(should_be, prompt)

    def test_add_texts_to_beginning_and_end(self):
        beginning = (
            "Minulla on kyselytietoja henkilöistä. Näytän sinulle nyt yhden "
            "henkilön tiedot. Olen listannut alle kysymykset, "
            "vastausvaihtoehdot ja henkilön antaman vastauksen.\n"
        )
        middle = "MIDDLE PART\n"
        end = (
            "\n\nEsitän sinulle nyt kysymyksen ja haluan että vastaat "
            "kysymykseen, niin kuin olettaisit kuvaillun henkilön vastaavan. Anna vain "
            "vastaus kysymykseen äläkä mitään muuta. Kysymys on: QUESTION"
        )
        excepted = beginning + middle + end
        actual = self.get_data.add_texts_to_beginning_and_end(
            "MIDDLE PART\n", "QUESTION"
        )
        self.assertEqual(excepted, actual)

    def test_get_prompts(self):
        """Test the method get_prompts."""
        question = "Mitä mieltä olet politiikasta?"
        prompts = self.get_data.get_prompts(question)
        self.assertEqual(len(prompts), 2)
