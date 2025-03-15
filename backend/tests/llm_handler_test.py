import pytest
from backend.services.llm_handler import LlmHandler

class DummyLLM:
    def get_response(self, prompt):
        return "Agent 1: 1, 4, 2\nAgent 2: 5, 5, 3"
    
class EmptyLLM:
    def get_response(self, prompt):
        return ""
    
class DummyAgent:
    def __init__(self, info):
        self.info = info
        self.new_questions = {}

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

def test_create_prompt(dummy_agents, questions):
    handler = LlmHandler()
    prompt = handler.create_prompt(dummy_agents, questions)

    assert "You are simulating multiple consumer agents" in prompt
    assert "Latent variables:" in prompt
    assert "Agent 1:" in prompt
    
    for question in questions:
        assert question in prompt

def test_get_agent_responses(dummy_agents, questions):
    handler = LlmHandler()
    handler.llm = DummyLLM()

    responses = handler.get_agents_responses(dummy_agents, questions)

    expected = {
        "Agent_1": {"q1": 1, "q2": 4, "q3": 2},
        "Agent_2": {"q1": 5, "q2": 5, "q3": 3},
    }

    assert dummy_agents[0].new_questions == expected["Agent_1"]
    assert dummy_agents[1].new_questions == expected["Agent_2"]

    assert responses == expected

def test_empty_response(capsys, dummy_agents, questions):
    handler = LlmHandler()
    handler.llm = EmptyLLM()

    responses = handler.get_agents_responses(dummy_agents, questions)

    assert responses is None

    debug = capsys.readouterr().out
    assert "LLM returned an empty response!" in debug