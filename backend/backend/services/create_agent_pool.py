import pandas
from ..entities.agent import Agent
from ..entities.agent_pool import AgentPool


def create_agent_pool(dataframe: pandas.DataFrame) -> AgentPool:
    """Creates instances of agents based on the given data and returns them in an
    AgentPool object"""
    # Convert integers in the dataframe to strings
    dataframe[dataframe.select_dtypes(include=["int"]).columns] = (
        dataframe.select_dtypes(include=["int"]).astype(str)
    )

    agent_info_list = dataframe.to_dict(orient="records")

    agents = []
    for agent in agent_info_list:
        agents.append(Agent(agent))

    return AgentPool(agents)
