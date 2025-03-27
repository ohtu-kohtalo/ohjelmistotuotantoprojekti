import pytest
from backend.services.llm_handler import LlmHandler


# Dummy LLM classes
class DummyLLM:
    def get_response(self, prompt):
        return "Agent 1: 1, 4, 2\nAgent 2: 5, 5, 3"


class EmptyLLM:
    def get_response(self, prompt):
        return ""


class InsufficientAgentsLLM:
    def get_response(self, prompt):
        return "Agent 1: 1, 2, 3"


class WrongFormatLLM:
    def get_response(self, prompt):
        # First line is missing the colon after "Agent 1:"
        return "Agent 1 1, 2, 3\nAgent 2: 5, 5, 3"


class ExtraLineLLM:
    def get_response(self, prompt):
        # Returns three lines for two agents
        return "Agent 1: 1, 4, 2\nAgent 2: 5, 5, 3\nAgent 3: 3, 3, 3"


class MismatchLLM:
    def get_response(self, prompt):
        # Agent 1 returns only 2 answers
        return "Agent 1: 1, 4\nAgent 2: 5, 5, 3"


class ExceptionLLM:
    def get_response(self, prompt):
        raise Exception("test")


class FaultyString(str):
    def split(self, sep=None, maxsplit=-1):
        # Force a faulty split
        return [self]


# Fake response object for tricking get_agent_responses() into processing custom lines
class FaultyResponse:
    def __init__(self, lines):
        self._lines = lines

    def strip(self):
        # Return self so that .split() can be called.
        return self

    def split(self, sep):
        # Return list of lines
        return self._lines


class FaultyFormatLLM:
    def get_response(self, prompt):
        # The first line is a FaultyString, and the second line is a normal valid response.
        return FaultyResponse([FaultyString("Agent 1:"), "Agent 2: 5, 5, 3"])


# Dummy Agent class
class DummyAgent:
    def __init__(self, info):
        self.info = info
        self.questions = {}

    def get_agent_info(self):
        return self.info


@pytest.fixture
def questions():
    return ["q1", "q2", "q3"]


@pytest.fixture
def dummy_agents():
    agent_info = {"Answers": {"latent1": 0.4, "latent2": 0.1}}
    agent2_info = {"Answers": {"latent1": 0.2, "latent2": 0.3}}
    agent = DummyAgent(agent_info)
    agent2 = DummyAgent(agent2_info)
    return [agent, agent2]


# Tests
def test_create_prompt(dummy_agents, questions):
    """Test that create_prompt returns a prompt containing expected sections."""
    handler = LlmHandler()
    prompt = handler.create_prompt(dummy_agents, questions)
    assert "You are simulating multiple consumer agents" in prompt
    assert "Latent variables:" in prompt
    assert "Agent 1:" in prompt
    for question in questions:
        assert question in prompt


def test_get_agent_responses(dummy_agents, questions):
    """Test that valid responses are processed correctly."""
    handler = LlmHandler()
    handler.llm = DummyLLM()

    responses = handler.get_agents_responses(dummy_agents, questions)

    expected = {
        "Agent_1": {"q1": 1, "q2": 4, "q3": 2},
        "Agent_2": {"q1": 5, "q2": 5, "q3": 3},
    }
    # Verify that each agent's questions got updated.
    assert dummy_agents[0].questions == {"q1": [1], "q2": [4], "q3": [2]}
    assert dummy_agents[1].questions == {"q1": [5], "q2": [5], "q3": [3]}
    assert responses == expected


def test_empty_response(capsys, dummy_agents, questions):
    """Test that an empty LLM response returns None and logs an error."""
    handler = LlmHandler()
    handler.llm = EmptyLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    assert responses is None
    debug = capsys.readouterr().out
    assert "LLM returned an empty response!" in debug


def test_more_lines_than_agents(capsys, dummy_agents, questions):
    """
    Test that if there are fewer response lines than agents,
    an error is logged and None is returned.
    """
    handler = LlmHandler()
    handler.llm = InsufficientAgentsLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    assert responses is None
    debug = capsys.readouterr().out
    assert f"Expected {len(dummy_agents)} agents in response" in debug


def test_invalid_format(capsys, dummy_agents, questions):
    """
    Test that when a response line does not match the expected format,
    the line is skipped (and no error message is printed).
    """
    handler = LlmHandler()
    handler.llm = WrongFormatLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    expected = {"Agent_1": {"q1": 5, "q2": 5, "q3": 3}}
    assert responses == expected
    debug = capsys.readouterr().out
    # Verify that no error message about invalid format is printed.
    assert "Invalid response format at line 1:" not in debug


def test_single_question(dummy_agents):
    """
    Test that when only one question is provided,
    the prompt includes the singular instruction.
    """
    handler = LlmHandler()
    prompt = handler.add_questions_and_instructions(["q1"])
    assert "The statement to be answered by each agent on a Likert scale:" in prompt


def test_extra_response_line(capsys, dummy_agents, questions):
    """
    Test that an extra response lines beyond the number of agents are passed
    """
    handler = LlmHandler()
    handler.llm = ExtraLineLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    expected = {
        "Agent_1": {"q1": 1, "q2": 4, "q3": 2},
        "Agent_2": {"q1": 5, "q2": 5, "q3": 3},
    }
    assert responses == expected
    debug = capsys.readouterr().out
    assert "Skipping response line 3 because there are only 2 agents" in debug


def test_mismatch_response(capsys, dummy_agents, questions):
    """
    Test that if the number of answers doesn't match the expected count,
    an error is logged.
    """
    handler = LlmHandler()
    handler.llm = MismatchLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    expected = {"Agent_1": {"q1": 5, "q2": 5, "q3": 3}}
    assert responses == expected
    debug = capsys.readouterr().out
    expected_error = (
        f"Mismatch in responses for Agent 1: Expected {len(questions)}, got 2."
    )
    assert expected_error in debug


def test_value_error(capsys, dummy_agents, questions, monkeypatch):
    original_int = int

    def fake_int(x):
        # Force a ValueError
        if x.strip() == "2":
            raise ValueError("forced error")
        return original_int(x)

    # Import the llm_handler module and patch its globals so that
    # int() calls fake_int()
    import backend.services.llm_handler as llm_mod

    monkeypatch.setitem(llm_mod.__dict__, "int", fake_int)

    handler = llm_mod.LlmHandler()
    handler.llm = DummyLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    expected = {"Agent_1": {"q1": 5, "q2": 5, "q3": 3}}
    assert responses == expected
    debug = capsys.readouterr().out
    assert "Failed to convert responses to integers at line 1:" in debug


def test_exception_handling(capsys, dummy_agents, questions):
    """
    Test that an exception in the LLM call is caught and logged.
    """
    handler = LlmHandler()
    handler.llm = ExceptionLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    assert responses is None
    debug = capsys.readouterr().out
    assert "LLM call failed: test" in debug


def test_invalid_format_with_faulty_split(capsys, dummy_agents, questions):
    """
    Test if split() returns fewer than 2 parts, an error is printed
    and that line is skipped.
    """
    handler = LlmHandler()
    handler.llm = FaultyFormatLLM()
    responses = handler.get_agents_responses(dummy_agents, questions)
    expected = {"Agent_1": {"q1": 5, "q2": 5, "q3": 3}}
    assert responses == expected
    debug = capsys.readouterr().out
    assert "[ERROR] Invalid response format at line 1:" in debug
