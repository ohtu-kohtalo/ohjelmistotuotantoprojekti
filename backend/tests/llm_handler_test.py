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
    """Mock LLM that returns predefined responses"""

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
    """Mock LLM that returns a single string for parallel responses."""

    def get_parallel_responses(self, prompts):
        return "Agent 1: 3, 4\nAgent 2: 2, 5## Answer Agent 1: 4, 5\nAgent 2: 3, 4"


class MockTransformer:
    """Mock transformer controlling future existence."""

    def __init__(self, future_exists=False):
        self.future_exists = future_exists

    def future_variables_exist(self, agents):
        return self.future_exists


class MockLLMBadResponse:
    """Mock LLM that returns a bad response list."""

    def get_parallel_responses(self, prompts):
        return ["Only one response"]


class MockLLMBadString:
    """Mock LLM that returns a bad single response string."""

    def get_parallel_responses(self, prompts):
        return "Agent 1: 3, 4"


class MockLLMValid:
    """Mock LLM that returns a valid combined string for parallel responses."""

    def get_parallel_responses(self, prompts):
        return "Agent 1: 3, 4\nAgent 2: 2, 5## Answer Agent 1: 4, 5\nAgent 2: 3, 4"


class MockLLMEmpty:
    """Mock LLM that returns an empty string response."""

    def get_response(self, prompt):
        return ""


class MockStr(str):
    """Mock string that splits into a single-element list."""

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
    """Test that the intro is created correctly."""
    intro = llm_handler.create_intro()
    assert "latent variables" in intro.lower()


def test_get_latent_variables(llm_handler):
    """Test that get_latent_variables returns the correct latent variables."""
    agent = MockAgent({"Q1": 1, "Q2": 2})
    latent_vars = llm_handler._get_latent_variables(agent)
    assert set(latent_vars) == {"Q1", "Q2"}


def test_add_latent_variables_to_prompt(llm_handler):
    """Test that add_latent_variables_to_prompt adds the correct latent variables to the prompt."""
    latent_vars = ["Q1", "Q2"]
    prompt = llm_handler.add_latent_variables_to_prompt(latent_vars)
    assert "- Q1" in prompt
    assert "- Q2" in prompt


def test_add_agents_info_without_future(llm_handler, fake_agents):
    """Test that add_agents_info adds the correct agent information to the prompt."""
    latent_vars = ["Q1", "Q2"]
    info_prompt = llm_handler.add_agents_info(fake_agents, latent_vars, future=False)
    assert "Agent 1:" in info_prompt
    assert "Agent 2:" in info_prompt

    assert "1" in info_prompt
    assert "2" in info_prompt


def test_add_questions_and_instructions(llm_handler):
    """Test that add_questions_and_instructions adds the correct questions and instructions to the prompt."""
    questions = ["Q1", "Q2", "Q3"]
    prompt = llm_handler.add_questions_and_instructions(questions)
    assert "Likert scale" in prompt
    assert f"There are {len(questions)} statements" in prompt


def test_add_questions_and_instructions_single(llm_handler):
    """Test that add_questions_and_instructions adds the correct questions and instructions to the prompt for a single question."""
    questions = ["Q1"]
    prompt = llm_handler.add_questions_and_instructions(questions)
    assert "The statement to be answered by each agent on a Likert scale:" in prompt
    assert f"There are {len(questions)} statements" in prompt


def test_create_prompt(llm_handler, fake_agents):
    """Test that create_prompt creates the correct prompt."""
    questions = ["Q1", "Q2"]
    prompt = llm_handler.create_prompt(fake_agents, questions, future=False)
    assert "simulating multiple consumer agents" in prompt.lower()
    assert "Agent 1:" in prompt
    for q in questions:
        assert q in prompt


# Parse and save tests


def test_parse_line_success(llm_handler):
    """Test that parse_line correctly maps answers to questions for a valid line."""
    qs = ["Q1", "Q2"]
    line = "Agent 1: 3, 4"
    assert llm_handler.parse_line(line, 0, qs) == {"Q1": 3, "Q2": 4}


def test_parse_line_failure(llm_handler):
    """Test that parse_line returns None for mismatched agent index."""
    qs = ["Q1", "Q2"]
    line = "Agent 2: 3, 4"
    assert llm_handler.parse_line(line, 0, qs) is None


def test_parse_line_invalid_format_using_fakestr(llm_handler):
    """Test that parse_line returns None when non-digit parts are present."""
    qs = ["Q1", "Q2"]
    line = MockStr("Agent 1: dummy")
    assert llm_handler.parse_line(line, 0, qs) is None


def test_parse_line_conversion_failure(monkeypatch, llm_handler):
    """Test that parse_line handles ValueError during int conversion gracefully."""
    qs = ["Q1", "Q2"]
    line = "Agent 1: 3, 4"
    original_int = builtins.int

    def fake_int(x):
        raise ValueError("error")

    monkeypatch.setattr(builtins, "int", fake_int)
    assert llm_handler.parse_line(line, 0, qs) is None
    monkeypatch.setattr(builtins, "int", original_int)


def test_process_lines(llm_handler, fake_agents):
    """Test that process_lines returns correct mapping for valid lines."""
    qs = ["Q1", "Q2"]
    lines = ["Agent 1: 3, 4", "Agent 2: 2, 5"]
    responses = llm_handler.process_lines(lines, fake_agents, qs)
    assert len(responses) == 2


def test_process_lines_insufficient_agents(llm_handler):
    """Test that process_lines skips extra lines when fewer agents are provided."""
    agent = MockAgent({"Q1": 1, "Q2": 2})
    lines = ["Agent 1: 3, 4", "Agent 2: 2, 5"]
    responses = llm_handler.process_lines(lines, [agent], ["Q1", "Q2"])
    assert len(responses) == 1


def test_process_lines_skip_empty_response(llm_handler, fake_agents):
    """Test that process_lines skips lines that parse to None."""
    lines = ["Agent 1: 3, 4", "Agent 2: invalid"]
    responses = llm_handler.process_lines(lines, fake_agents, ["Q1", "Q2"])
    assert len(responses) == 1


def test_save_responses_to_agents(llm_handler, fake_agents):
    """Test that save_responses_to_agents correctly populates questions dict for agents."""
    # Reset questions
    for agent in fake_agents:
        agent.questions = {}
    responses = {fake_agents[0]: {"Q1": 3, "Q2": 4}, fake_agents[1]: {"Q1": 2, "Q2": 5}}
    llm_handler.save_responses_to_agents(responses, future=False)
    assert fake_agents[0].questions == {"Q1": [3], "Q2": [4]}


def test_save_responses_append_existing(llm_handler, fake_agents):
    """Test that save_responses_to_agents appends to existing question lists."""
    fake_agents[0].questions = {"Q1": [1]}
    fake_agents[1].questions = {}
    responses = {fake_agents[0]: {"Q1": 2}, fake_agents[1]: {"Q1": 3}}
    llm_handler.save_responses_to_agents(responses, future=False)
    assert fake_agents[0].questions["Q1"] == [1, 2]


def test_get_agents_responses_without_future(llm_handler, fake_agents):
    """Test get_agents_responses returns only original when no future scenario."""
    llm_handler.transformer = MockTransformer(False)
    res = llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"])
    assert "original" in res and "future" not in res


def test_get_agents_responses_with_future(llm_handler, fake_agents):
    """Test get_agents_responses returns both original and future when scenario exists."""
    llm_handler.transformer = MockTransformer(True)
    res = llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"])
    assert "original" in res and "future" in res


def test_get_agents_responses_string_response(llm_handler, fake_agents):
    """Test handling of combined string response for parallel prompts."""
    llm_handler.transformer = MockTransformer(True)
    llm_handler.llm = MockLLMString()
    res = llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"])
    assert res is not None and "original" in res and "future" in res


def test_get_agents_responses_bad_response_list(llm_handler, fake_agents):
    """Test that get_agents_responses returns None for invalid list response."""
    llm_handler.transformer = MockTransformer(True)
    llm_handler.llm = MockLLMBadResponse()
    assert llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"]) is None


def test_get_agents_responses_bad_response_string(llm_handler, fake_agents):
    """Test that get_agents_responses returns None for invalid combined string."""
    llm_handler.transformer = MockTransformer(True)
    llm_handler.llm = MockLLMBadString()
    assert llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"]) is None


def test_get_agents_responses_failed_parsing(llm_handler, fake_agents):
    """Test that get_agents_responses returns None when parsing fails for one response."""
    llm_handler.transformer = MockTransformer(True)
    llm_handler.llm = MockLLMValid()
    orig = llm_handler.parse_responses

    def fake_parse(response, agents, qs):
        return None if "4, 5" in response else orig(response, agents, qs)

    llm_handler.parse_responses = fake_parse
    assert llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"]) is None


def test_get_agents_responses_no_parse(llm_handler, fake_agents):
    """Test that get_agents_responses returns None when parse_responses returns None."""
    llm_handler.transformer = MockTransformer(False)
    llm_handler.parse_responses = lambda r, a, q: None
    assert llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"]) is None


def test_get_agents_responses_empty_response(llm_handler, fake_agents):
    """Test that get_agents_responses returns None when LLM returns empty string."""
    llm_handler.transformer = MockTransformer(False)
    llm_handler.llm = MockLLMEmpty()
    assert llm_handler.get_agents_responses(fake_agents, ["Q1", "Q2"]) is None
