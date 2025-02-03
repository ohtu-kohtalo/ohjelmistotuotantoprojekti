import os
import pandas as pd
from gemini import Gemini
from key_config import CSV_FILE_PATH


class Generator:
    """This class generates agents"""

    def __init__(self, llm=Gemini()):
        self.__llm = llm

    def _sample_csv(self, number_of_agents):
        """Samples data from the CSV file."""
        data_frame = pd.read_csv(CSV_FILE_PATH, sep=";")
        return data_frame.sample(n=number_of_agents)

    def _create_profile(self, sample):
        """Creates a customer profile from a sample."""
        gender = sample["T1"]
        age = sample["T2"]
        residents = sample["T3"]
        county = sample["T4"]
        place_of_work = sample["T5"]

        return f"{gender}, {age} vanha, kunnasta, jossa on {residents} ja joka sijaitsee maakunnassa {county}. Mykyinen tai viimeisin työnantaja: {place_of_work}."

    def create_agents(
        self,
        company: str,
        industry: str,
        number_of_agents: str,
        website_data: str = None,
    ) -> str:
        """Creates agents based on the given parameters."""

        sample = self._sample_csv(number_of_agents)

        T1_map = {1: "Mies", 2: "Nainen", 3: "Muu"}

        T2_map = {
            1: "18-25 vuotta",
            2: "26-35 vuotta",
            3: "36-45 vuotta",
            4: "46-55 vuotta",
            5: "56-65 vuotta",
            6: "Yli 65 vuotta",
        }

        T2B_map = {
            1: "Asun kotona vanhempien luona",
            2: "Asun yksin",
            3: "Asun kaksin puolison/kumppanin kanssa",
            4: "Asun puolison/kumppanin ja lasten kanssa",
            5: "Olen yksinhuoltaja",
            6: "Muu (esim. yhteisasuminen)",
            7: "En halua sanoa",
        }

        T3_map = {
            1: "alle 4000 asukasta",
            2: "4000-8000 asukasta",
            3: "8000-30 000 asukasta",
            4: "30 000-80 000 asukasta",
            5: "Yli 80 000 asukasta",
        }

        T4_map = {
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
            18: "Lappi",
        }

        T5_map = {
            1: "Valtio",
            2: "Kunta tai kuntayhtymä",
            3: "Julkisomisteinen yritys",
            4: "Yksityinen (tai oma) yritys",
            5: "Järjestö tai yhdistys",
            6: "Jokin muu työnantaja",
            7: "En ole ollut mukana työelämässä",
        }

        T5B_T16_map = {1: "Kyllä", 2: "En"}

        T6_map = {
            1: "Kokopäivätyössä",
            2: "Puolipäivätyössä",
            3: "Osa-aikatyössä",
            4: "Muu työaikamuoto",
        }

        T7_map = {1: "Vakituinen", 2: "Määräaikainen"}

        T8_map = {1: "Kansakoulu", 2: "Keski- tai peruskoulu", 3: "Ylioppilastutkinto"}

        T9_map = {
            1: "Ei ammatillista koulutusta",
            2: "Ammattikurssi, muu lyhyt ammattikoulutus",
            3: "Ammattikoulu",
            4: "Opistotasoinen ammattikoulutus",
            5: "Ammattikorkeakoulututkinto",
            6: "Yliopisto- tai korkeakoulututkinto",
        }

        T10_map = {
            1: "Johtavassa asemassa toisen palveluksessa",
            2: "Ylempi toimihenkilö",
            3: "Alempi toimihenkilö",
            4: "Työntekijä",
            5: "Yrittäjä tai yksityinen ammatinharjoittaja",
            6: "Maatalousyrittäjä",
            7: "Opiskelija",
            8: "Eläkeläinen",
            9: "Kotiäiti/koti-isä",
            10: "Työtön",
            11: "Muu",
        }

        T11_map = {
            1: "Maa- ja metsätalous",
            2: "Teollisuus ja rakennustoiminta",
            3: "Yksityiset palvelut",
            4: "Julkiset palvelut",
            5: "En ole ollut mukana työelämässä",
        }

        T12_map = {1: "En kuulu", 2: "Kyllä"}

        T12B_map = {1: "SAK", 2: "STTK", 3: "Akava", 4: "MTK"}

        T13_map = {
            1: "Kokoomus",
            2: "Perussuomalaiset",
            3: "SDP",
            4: "Keskusta",
            5: "Vihreät",
            6: "Vasemmistoliitto",
            7: "RKP",
            8: "Kristillisdemokraatit",
            9: "Liike Nyt",
            10: "Jokin muu puolue tai ryhmittymä",
            11: "En äänestäisi lainkaan",
            12: "En osaa sanoa",
            13: "En halua sanoa",
        }

        T14_map = {
            1: "Työväenluokkaan",
            2: "Alempaan keskiluokkaan",
            3: "Keskiluokkaan",
            4: "Ylempään keskiluokkaan",
            5: "Yläluokkaan",
            6: "En katso kuuluvani mihinkään luokkaan",
        }

        T15_map = {1: "Suomi", 2: "Ruotsi", 3: "Muu"}

        bv1_map = {
            1: "Alle 10.000 euroa/v",
            2: "10.000-20.000 euroa/v",
            3: "20.001-30.000 euroa/v",
            4: "30.001-40.000 euroa/v",
            5: "40.001-50.000 euroa/v",
            6: "50.001-60.000 euroa/v",
            7: "60.001-70.000 euroa/v",
            8: "70.001-80.000 euroa/v",
            9: "80.001-90.000 euroa/v",
            10: "Yli 90.000 euroa/v",
            11: "En halua vastata",
            12: "En osaa sanoa",
        }

        Q1_Q9_map = {
            1: "Täysin samaa mieltä",
            2: "Jokseenkin samaa mieltä",
            3: "Vaikea sanoa",
            4: "Jokseenkin eri mieltä",
            5: "Täysin eri mieltä",
        }

        Q2A_map = {
            1: "Ei yhtään",
            2: "Yksi",
            3: "Kaksi",
            4: "Kolme tai enemmän",
            5: "En osaa/halua sanoa",
        }

        Q2B_map = {
            1: "En yhtään",
            2: "Yhden",
            3: "Kaksi",
            4: "Kolme tai enemmän",
            5: "En osaa/halua sanoa",
        }

        Q2C_map = {1: "Kyllä", 2: "Ei", 3: "En osaa/halua sanoa"}

        Q2D_map = {
            1: "Melko paljon",
            2: "Jonkin verran",
            3: "Vain hieman",
            4: "Ei juuri lainkaan",
            5: "Asialla ei ole merkitystä",
            6: "En osaa sanoa",
        }

        Q2E = {
            1: "Peruskoulu",
            2: "Toinen aste (lukio tai ammatillinen koulutus)",
            3: "Korkea-aste (opisto, ammattikorkeakoulu, yliopisto)",
            4: "Koulutustasolla ei ole väliä",
            5: "En osaa sanoa",
        }

        Q3_map = {
            1: "Erittäin paljon",
            2: "Melko paljon",
            3: "Melko vähän",
            4: "Erittäin vähän/ei lainkaan",
            5: "En osaa/halua sanoa",
        }

        Q4_map = {
            1: "Hyvin tärkeä",
            2: "Melko tärkeä",
            3: "Ei kovin tärkeä",
            4: "Ei lainkaan tärkeä",
            5: "En osaa sanoa",
        }

        Q5_map = {
            1: "Tuntuvasti korottaa",
            2: "Hieman korottaa",
            3: "Pitää nykyisellään",
            4: "Hieman alentaa",
            5: "Tuntuvasti alentaa",
            6: "En osaa sanoa",
        }

        Q6_map = {
            1: "Hyvin todennäköistä",
            2: "Melko todennäköistä",
            3: "Melko epätodennäköistä",
            4: "Hyvin epätodennäköistä",
            5: "En osaa sanoa",
        }

        Q7_map = {
            1: "Erittäin myönteisesti",
            2: "Melko myönteisesti",
            3: "Melko kielteisesti",
            4: "Erittäin kielteisesti",
            5: "En osaa sanoa",
        }

        Q8A_map = {
            1: "Hyväksyn täysin",
            2: "Hyväksyn jossain määrin",
            3: "En hyväksy enkä tuomitse",
            4: "Tuomitsen jossain määrin",
            5: "Tuomitsen täysin",
            6: "En osaa sanoa",
        }

        Q8B_Q8C_map = {
            1: "Hyvin suurta haittaa",
            2: "Melko suurta haittaa",
            3: "Melko pientä haittaa",
            4: "Ei lainkaan haittaa",
            5: "En osaa sanoa",
        }

        Q10_map = {
            1: "Työajalla ei pidä protestoida lainkaan",
            2: "10–15 minuuttia",
            3: "2 tuntia",
            4: "1 vuorokausi",
            5: "2–3 vuorokautta",
            6: "Viikko tai enemmän",
            7: "Protestin kestoa ei pidä rajoittaa lainkaan",
            8: "En osaa sanoa",
        }

        Q11_map = {
            1: "Äänestän varmuudella",
            2: "Äänestän todennäköisesti",
            3: "En todennäköisesti äänestä",
            4: "En varmuudella äänestä",
            5: "En osaa sanoa",
        }

        Q12_map = {
            1: "Paljon enemmän",
            2: "Hieman enemmän",
            3: "Kuten nykyisin",
            4: "Hieman vähemmän",
            5: "Paljon vähemmän",
            6: "En osaa sanoa",
        }

        Q13_map = {
            1: "Hyvin myönteisesti",
            2: "Melko myönteisesti",
            3: "Neutraalisti",
            4: "Melko kielteisesti",
            5: "Hyvin kielteisesti",
            6: "En osaa sanoa",
        }

        Q14_map = {1: "Todennäköistä", 2: "Vaikea sanoa", 3: "Epätodennäköistä"}

        Q15_map = {1: "Myönteisesti", 2: "Vaikea sanoa", 3: "Kielteisesti"}

        Q16ABC_map = {
            1: "Erittäin myönteisesti",
            2: "Melko myönteisesti",
            3: "Neutraalisti",
            4: "Melko kielteisesti",
            5: "Erittäin kielteisesti",
            6: "En osaa sanoa",
        }

        Q16D_map = {
            1: "Paljon hyötyä",
            2: "Jonkin verran hyötyä",
            3: "Ei hyötyä eikä haittaa",
            4: "Jonkin verran haittaa",
            5: "Paljon haittaa",
            6: "En osaa sanoa",
        }

        Q18_map = {
            1: "Täysin samaa mieltä",
            2: "Jokseenkin samaa mieltä",
            3: "En samaa enkä eri mieltä",
            4: "Jokseenkin eri mieltä",
            5: "Täysin eri mieltä",
        }

        Q19_map = {
            1: "Erittäin paljon",
            2: "Melko paljon",
            3: "Jonkin verran",
            4: "Vain vähän",
            5: "En lainkaan",
        }

        sample["T1"] = sample["T1"].map(T1_map)
        sample["T2"] = sample["T2"].map(T2_map)
        sample["T2B"] = sample["T2B"].map(T2B_map)
        sample["T3"] = sample["T3"].map(T3_map)
        sample["T4"] = sample["T4"].map(T4_map)
        sample["T5"] = sample["T5"].map(T5_map)
        sample["T5B"] = sample["T5B"].map(T5B_T16_map)
        sample["T6"] = sample["T6"].map(T6_map)
        sample["T7"] = sample["T7"].map(T7_map)
        sample["T8"] = sample["T8"].map(T8_map)
        sample["T9"] = sample["T9"].map(T9_map)
        sample["T10"] = sample["T10"].map(T10_map)
        sample["T11"] = sample["T11"].map(T11_map)
        sample["T12"] = sample["T12"].map(T12_map)
        sample["T12B"] = sample["T12B"].map(T12B_map)
        sample["T13"] = sample["T13"].map(T13_map)
        sample["T14"] = sample["T14"].map(T14_map)
        sample["T15"] = sample["T15"].map(T15_map)
        sample["T16"] = sample["T16"].map(T5B_T16_map)
        sample["bv1"] = sample["bv1"].map(bv1_map)

        profiles = [
            self._create_profile(sample.iloc[i]) for i in range(number_of_agents)
        ]

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
