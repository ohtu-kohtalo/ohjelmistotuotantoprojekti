import pandas as pd
from gemini import Gemini
from key_config import SAV_FILE_PATH


class Generator:
    """This class generates agents"""

    def __init__(self, llm=Gemini(), data_frame=None):
        """If no data_frame is given to the class constructor, pandas creates a
        DataFrame object from the sav file that is specified in the .env file. When
        tests are run, a mock data frame object should be given instead to the
        constructor, which allows tests to be run without any data or environment
        variables.

        Args:
            llm (LLM): an interface for using a LLM. Defaults to Gemini().
            data_frame (DataFrame, optional): a pandas DataFrame object that contains
            survey data. Defaults to None in which case the file specified in the .env
            file is used.
        """
        self.__llm = llm
        self.__data_frame = self.set_data_frame(data_frame)

    def set_data_frame(self, data_frame):
        """Sets the instance variable __data_frame. If parameter data_frame is None,
        loads the sav file specified in the .env file and creates a pandas DataFrame
        object from it. Otherwise uses the data_frame parameter.

        Args:
            data_frame (None | any): This parameter can be None, an actual data frame
            or a mock data frame.
        """
        if data_frame:
            return data_frame
        else:
            return pd.read_spss(SAV_FILE_PATH)

    def _read_sav(self, file_path):
        """Reads an sav file and returns a pandas DataFrame object"""
        return pd.read_spss(file_path)

    def _sample_from_data_frame(self, data_frame, number_of_agents: int):
        """Randomly samples rows from a pandas DataFrame object.

        Args:
            data_frame (DataFrame): a pandas data frame object.
            number_of_agents (int): the number of agents to be sampled.

        Returns:
            DataFrame: a pandas DataFrame object with only the sampled data.
        """
        return data_frame.sample(n=number_of_agents)

    def _create_profile(self, sample) -> str:
        """Creates a short descripion about a customer profile. This description can be
        given to an LLM as a prompt.

        Args:
            sample (DataFrame): one row from a pandas DataFrame object representing one
            survey participant.

        Returns:
            str: a short descripion about a customer profile."""
        gender = sample["T1"]
        age = sample["T2"]
        residents = sample["T3"]
        county = sample["T4"]
        place_of_work = sample["T5"]

        return (
            f"{gender}, {age} vanha, kunnasta, jossa on {residents} ja joka "
            f"sijaitsee maakunnassa {county}. Nykyinen tai viimeisin työnantaja: "
            f"{place_of_work}."
        )

    def create_agents(
        self,
        company: str,
        industry: str,
        number_of_agents: str,
        website_data: str = None,
    ) -> str:
        """Creates agents based on the given parameters and on the survey data given
        to the program."""

        sample = self._sample_from_data_frame(self.__data_frame, number_of_agents)

        profiles = [
            self._create_profile(sample.iloc[i]) for i in range(number_of_agents)
        ]
        prompt = self._create_prompt(
            company, industry, number_of_agents, profiles, website_data
        )
        response = self.__llm.get_response(prompt)
        return response

    def _create_prompt(
        self,
        company: str,
        industry: str,
        number_of_agents: str,
        profiles: list[str],
        website_data: str = None,
    ) -> str:
        """Creates a prompt that can be given to the LLM. The prompt has some info
        about a company and some example customer profiles

        Args:
            company (str): name of the company
            industry (str): the industry where the company operates
            number_of_agents (str): the number of agents (customer profiles) the LLM
            should create.
            profiles (list): a list of short textual descriptions of the agents.
            website_data (str, optional): Data about the company's website in textual
            form. Defaults to None.

        Returns:
            str: a prompt that gives some key information about the company and the
            customers.
        """
        prompt = (
            f"Simulate {number_of_agents} customer profiles for a company. The name "
            f"of the company is {company} and its industry is {industry}. "
            f"Here are the customer demographics:\n"
        )
        prompt += "\n".join(profiles)

        if website_data:
            prompt += f"\nWebsite data for the company: {website_data}"

        return prompt
