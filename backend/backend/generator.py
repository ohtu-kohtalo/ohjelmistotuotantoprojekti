from gemini import Gemini


class Generator:
    """This class generates agents"""

    def __init__(self, llm=Gemini()):
        self.__llm = llm

    def create_agents(
        self,
        company: str,
        industry: str,
        number_of_agents: str,
        website_data: str = None,
    ) -> str:
        """Creates agents based on the given parameters.

        Arguments:
        ----------
            company: the name of the company.
            industry: the industry where the company operates.
            website_data: (Optional) Crawled data from the the website of the company.
            number_of_agents: the number of agents this method will create.

        Returns:
        --------
            A string that contains a description of the agents."""
        prompt = (
            f"Simulate {number_of_agents} customer profiles for a company. The name "
            f"of the company is {company} and its industry is {industry}"
        )
        if website_data:
            prompt += f". Website data for the company: {website_data}"
        response = self.__llm.get_response(prompt)
        return response
