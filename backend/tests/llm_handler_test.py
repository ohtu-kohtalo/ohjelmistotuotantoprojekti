import pytest
import builtins
from backend.services.llm_handler import LlmHandler


class MockAgent:
    def __init__(self, answers, future_answers=None):
        self._agent_info = {"Answers": answers, "Age": "25", "Gender": "Female"}
        self._agent_future_info = {
            "Answers": future_answers if future_answers is not None else answers,
            "Age": "30",
            "Gender": "Male",
        }
        self.questions = {}
        self.future_questions = {}

    def get_agent_info(self):
        return self._agent_info

    def get_agent_future_info(self):
        return self._agent_future_info


class MockLLM:
    def __init__(self):
        self.prompt_received = None

    def get_response(self, prompt):
        self.prompt_received = prompt
        return "Agent 1: 3, 4\nAgent 2: 2, 5"

    def get_parallel_responses(self, prompts):
        self.prompts_received = prompts
        return [
            # original response
            "Agent 1: 3, 4\nAgent 2: 2, 5",
            # future response
            "Agent 1: 4, 5\nAgent 2: 3, 4",
        ]


class MockLLMString:
    def get_parallel_responses(self, prompts):
        return "Agent 1: 3, 4\nAgent 2: 2, 5## Answer Agent 1: 4, 5\nAgent 2: 3, 4"


class MockTransformer:
    def __init__(self, future_exists=False):
        self.future_exists = future_exists

    def future_variables_exist(self, agents):
        return self.future_exists


class MockLLMBadResponse:
    def get_parallel_responses(self, prompts):
        return ["Only one response"]


class MockLLMBadString:
    def get_parallel_responses(self, prompts):
        return "Agent 1: 3, 4"


class MockLLMValid:
    def get_parallel_responses(self, prompts):
        return "Agent 1: 3, 4\nAgent 2: 2, 5## Answer Agent 1: 4, 5\nAgent 2: 3, 4"


class MockLLMEmpty:
    def get_response(self, prompt):
        return ""


class MockStr(str):
    def split(self, sep=None, maxsplit=-1):
        return ["element"]


# Fixtures


@pytest.fixture
def llm_handler():
    handler = LlmHandler()
    handler.llm = MockLLM()
    handler.transformer = MockTransformer(future_exists=False)
    return handler


@pytest.fixture
def fake_agents():
    agent1 = MockAgent({"Q1": 1, "Q2": 2})
    agent2 = MockAgent({"Q1": 3, "Q2": 4})
    return [agent1, agent2]


# Helper method tests


def test_create_intro(llm_handler):
    intro = llm_handler.create_intro()
    assert "latent variables" in intro.lower()


def test_get_latent_variables(llm_handler):
    agent = MockAgent({"Q1": 1, "Q2": 2})
    latent_vars = llm_handler._get_latent_variables(agent)
    assert set(latent_vars) == {"Q1", "Q2"}


def test_add_latent_variables_to_prompt(llm_handler):
    latent_vars = ["Q1", "Q2"]
    prompt = llm_handler.add_latent_variables_to_prompt(latent_vars)
    assert "- Q1" in prompt
    assert "- Q2" in prompt


def test_add_agents_info_without_future(llm_handler, fake_agents):
    latent_vars = ["Q1", "Q2"]
    info_prompt = llm_handler.add_agents_info(fake_agents, latent_vars, future=False)
    assert "Agent 1:" in info_prompt
    assert "Agent 2:" in info_prompt

    assert "1" in info_prompt
    assert "2" in info_prompt


def test_add_questions_and_instructions(llm_handler):
    questions = ["Q1", "Q2", "Q3"]
    prompt = llm_handler.add_questions_and_instructions(questions)
    assert "Likert scale" in prompt
    assert f"There are {len(questions)} statements" in prompt


def test_add_questions_and_instructions_single(llm_handler):
    questions = ["Q1"]
    prompt = llm_handler.add_questions_and_instructions(questions)
    assert "The statement to be answered by each agent on a Likert scale:" in prompt
    assert f"There are {len(questions)} statements" in prompt


def test_create_prompt(llm_handler, fake_agents):
    questions = ["Q1", "Q2"]
    prompt = llm_handler.create_prompt(fake_agents, questions, future=False)
    assert "simulating multiple consumer agents" in prompt.lower()
    assert "Agent 1:" in prompt
    for q in questions:
        assert q in prompt


# Parse and save tests


def test_parse_line_success(llm_handler):
    questions = ["Q1", "Q2"]
    line = "Agent 1: 3, 4"
    result = llm_handler.parse_line(line, 0, questions)
    expected = {"Q1": 3, "Q2": 4}
    assert result == expected


def test_parse_line_failure(llm_handler):
    questions = ["Q1", "Q2"]
    line = "Agent 2: 3, 4"
    result = llm_handler.parse_line(line, 0, questions)
    assert result is None


def test_parse_line_invalid_format_using_fakestr(llm_handler):
    questions = ["Q1", "Q2"]

    line = MockStr("Agent 1: dummy")
    result = llm_handler.parse_line(line, 0, questions)
    assert result is None


def test_parse_line_conversion_failure(monkeypatch, llm_handler):
    questions = ["Q1", "Q2"]
    line = "Agent 1: 3, 4"
    original_int = builtins.int

    def fake_int(x):
        raise ValueError("error")

    monkeypatch.setattr(builtins, "int", fake_int)

    result = llm_handler.parse_line(line, 0, questions)
    assert result is None

    # Restore original int
    monkeypatch.setattr(builtins, "int", original_int)


def test_process_lines(llm_handler, fake_agents):
    questions = ["Q1", "Q2"]
    lines = ["Agent 1: 3, 4", "Agent 2: 2, 5"]
    responses = llm_handler.process_lines(lines, fake_agents, questions)
    assert len(responses) == 2

    for agent, ans in responses.items():
        if agent.get_agent_info()["Answers"] == {"Q1": 1, "Q2": 2}:
            assert ans == {"Q1": 3, "Q2": 4}
        elif agent.get_agent_info()["Answers"] == {"Q1": 3, "Q2": 4}:
            assert ans == {"Q1": 2, "Q2": 5}


def test_process_lines_insufficient_agents(llm_handler):
    questions = ["Q1", "Q2"]

    agent = MockAgent({"Q1": 1, "Q2": 2})
    agents = [agent]
    lines = ["Agent 1: 3, 4", "Agent 2: 2, 5"]
    responses = llm_handler.process_lines(lines, agents, questions)

    assert len(responses) == 1
    assert responses[agent] == {"Q1": 3, "Q2": 4}


def test_process_lines_skip_empty_response(llm_handler, fake_agents):
    questions = ["Q1", "Q2"]

    lines = ["Agent 1: 3, 4", "Agent 2: invalid"]
    responses = llm_handler.process_lines(lines, fake_agents, questions)

    assert len(responses) == 1
    assert fake_agents[0] in responses
    assert responses[fake_agents[0]] == {"Q1": 3, "Q2": 4}


def test_save_responses_to_agents(llm_handler, fake_agents):
    responses = {fake_agents[0]: {"Q1": 3, "Q2": 4}, fake_agents[1]: {"Q1": 2, "Q2": 5}}

    for agent in fake_agents:
        agent.questions = {}
    llm_handler.save_responses_to_agents(responses, future=False)
    assert fake_agents[0].questions == {"Q1": [3], "Q2": [4]}
    assert fake_agents[1].questions == {"Q1": [2], "Q2": [5]}


def test_save_responses_append_existing(llm_handler, fake_agents):
    fake_agents[0].questions = {"Q1": [1]}
    fake_agents[1].questions = {}

    responses = {
        fake_agents[0]: {"Q1": 2},
        fake_agents[1]: {"Q1": 3},
    }

    llm_handler.save_responses_to_agents(responses, future=False)

    assert fake_agents[0].questions["Q1"] == [1, 2]
    assert fake_agents[1].questions["Q1"] == [3]


# get_agent_responses()


def test_get_agents_responses_without_future(llm_handler, fake_agents):
    # Future scenario doesn't exist
    llm_handler.transformer = MockTransformer(future_exists=False)
    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)

    assert "original" in responses
    assert "future" not in responses

    assert fake_agents[0].questions == {"Q1": [3], "Q2": [4]}
    assert fake_agents[1].questions == {"Q1": [2], "Q2": [5]}


def test_get_agents_responses_with_future(llm_handler, fake_agents):
    # Future scenario exists
    llm_handler.transformer = MockTransformer(future_exists=True)
    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)

    assert "original" in responses
    assert "future" in responses

    assert fake_agents[0].questions == {"Q1": [3], "Q2": [4]}
    assert fake_agents[1].questions == {"Q1": [2], "Q2": [5]}

    assert fake_agents[0].future_questions == {"Q1": [4], "Q2": [5]}
    assert fake_agents[1].future_questions == {"Q1": [3], "Q2": [4]}


def test_get_agents_responses_string_response(llm_handler, fake_agents):
    llm_handler.transformer = MockTransformer(future_exists=True)
    llm_handler.llm = MockLLMString()

    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)

    assert responses is not None
    assert "original" in responses
    assert "future" in responses

    original = responses["original"]
    future = responses["future"]

    assert original[fake_agents[0]] == {"Q1": 3, "Q2": 4}
    assert original[fake_agents[1]] == {"Q1": 2, "Q2": 5}
    assert future[fake_agents[0]] == {"Q1": 4, "Q2": 5}
    assert future[fake_agents[1]] == {"Q1": 3, "Q2": 4}


def test_get_agents_responses_bad_response_list(llm_handler, fake_agents):
    llm_handler.transformer = MockTransformer(future_exists=True)

    llm_handler.llm = MockLLMBadResponse()
    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)
    assert responses is None


def test_get_agents_responses_bad_response_string(llm_handler, fake_agents):
    llm_handler.transformer = MockTransformer(future_exists=True)

    llm_handler.llm = MockLLMBadString()
    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)
    assert responses is None


def test_get_agents_responses_failed_parsing(llm_handler, fake_agents):
    llm_handler.transformer = MockTransformer(future_exists=True)

    llm_handler.llm = MockLLMValid()

    original_parse_responses = llm_handler.parse_responses

    def fake_parse_responses(response, agents, questions):
        if "4, 5" in response:
            return None
        return original_parse_responses(response, agents, questions)

    llm_handler.parse_responses = fake_parse_responses

    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)
    assert responses is None


def test_get_agents_responses_no_parse(llm_handler, fake_agents):
    llm_handler.transformer = MockTransformer(future_exists=False)
    llm_handler.parse_responses = lambda response, agents, questions: None

    questions = ["Q1", "Q2"]

    responses = llm_handler.get_agents_responses(fake_agents, questions)

    assert responses is None


def test_get_agents_responses_empty_response(llm_handler, fake_agents):
    llm_handler.transformer = MockTransformer(future_exists=False)

    llm_handler.llm = MockLLMEmpty()

    questions = ["Q1", "Q2"]
    responses = llm_handler.get_agents_responses(fake_agents, questions)

    assert responses is None
