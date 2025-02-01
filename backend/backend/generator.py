import os
import pandas as pd
from gemini import Gemini

csv_file_path = os.getenv("CSV_FILE_PATH")

class Generator:
    """This class generates agents"""

    def __init__(self, llm=Gemini()):
        self.__llm = llm

    def _sample_csv(self, sample_amount):
        """Samples data from the CSV file."""
        data_frame = pd.read_csv(csv_file_path, sep=';')
        return data_frame.sample(n=sample_amount)

    def _create_profile(self, sample):
        """Creates a customer profile from a sample."""
        gender = sample["T1"]
        age = sample["T2"]
        residents = sample["T3"]
        county = sample["T4"]
        place_of_work = sample["T5"]

        return f"{gender}, {age} vanha, kunnasta, jossa on {residents} ja joka sijaitsee maakunnassa {county}. Mykyinen tai viimeisin työnantaja: {place_of_work}."

    def create_agents(self, company, industry, number_of_agents, website_data=None):
        """Creates agents based on the given parameters."""
        sample = self._sample_csv(number_of_agents)

        agegroup_map = {
            1: "18-25 vuotta",
            2: "26-35 vuotta",
            3: "36-45 vuotta",
            4: "46-55 vuotta",
            5: "56-65 vuotta",
            6: "Yli 65 vuotta"
        }

        gender_map = {
            1: "Mies",
            2: "Nainen",
            3: "Muu"
        }

        residents_map = {
            1: "alle 4000 asukasta",
            2: "4000-8000 asukasta",
            3: "8000-30 000 asukasta",
            4: "30 000-80 000 asukasta",
            5: "Yli 80 000 asukasta"
        }

        county_map = {
            1: "Uusimaa",
            2: "Varsinais-Suomi",
            3: "Satakunta",
            4: "Häme",
            5: "Pirkanmaa",
            6: "Päijät-häme",
            7: "Kymenlaakso",
            8: "Etelä-Karjala",
            9: "Etelä-Savo",
            10: "Pohjois-Savo",
            11: "Pohjois-Karjala",
            12: "Keski-Suomi",
            13: "Etelä-Pohjanmaa",
            14: "Pohjanmaa (Vaasan rann.)",
            15: "Keski-Pohjanmaa",
            16: "Pohjois-Pohjanmaa",
            17: "Kainuu",
            18: "Lappi"
        }

        work_map = {
            1: "Valtio",
            2: "Kunta tai kuntayhtymä",
            3: "Julkisomisteinen yritys",
            4: "Yksityinen (tai oma) yritys",
            5: "Järjestö tai yhdistys",
            6: "Jokin muu työnantaja",
            7: "En ole ollut mukana työelämässä"
        }

        sample["T1"] = sample["T1"].map(gender_map)
        sample["T2"] = sample["T2"].map(agegroup_map)
        sample["T3"] = sample["T3"].map(residents_map)
        sample["T4"] = sample["T4"].map(county_map)
        sample["T5"] = sample["T5"].map(work_map)

        profiles = [self._create_profile(sample.iloc[i]) for i in range(number_of_agents)]

        prompt = (
            f"Simulate {number_of_agents} customer profiles for a company. The name "
            f"of the company is {company} and its industry is {industry}. "
            f"Here are the customer demographics:\n"
        )
        prompt += "\n".join(profiles)

        if website_data:
            prompt += f". Website data for the company: {website_data}"

        response = self.__llm.get_response(prompt)
        return response
