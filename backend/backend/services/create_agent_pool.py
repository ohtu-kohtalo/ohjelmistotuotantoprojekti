from entities.agent import Agent
from entities.agent_pool import AgentPool


def create_agent_pool() -> AgentPool:
    """Creates instances of agents and returns a pool of them"""
    agent1 = Agent(
        {
            "age": "20",
            "gender": "female",
            "place_of_residence": "Uusimaa",
            "occupation": "student",
        }
    )
    agent2 = Agent(
        {
            "age": "40",
            "gender": "male",
            "place_of_residence": "Varsinais-Suomi",
            "occupation": "software developer",
        }
    )
    agent3 = Agent(
        {
            "age": "70",
            "gender": "female",
            "place_of_residence": "Pirkanmaa",
            "occupation": "retired",
        }
    )
    return AgentPool([agent1, agent2, agent3])
