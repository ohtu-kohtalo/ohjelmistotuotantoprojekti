# Agents

[Agents](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/blob/dev/backend/backend/entities/agent.py) are defined as individuals, that have been created based on the data.csv file. Essentially one agent is equivalent to one respondee from the data file.
Each agent has their own id, info (age, gender), latent values, questions and future questions along with their responses.

> [!NOTE]
> In this case, latent values refer to underlying values that attempt to explain how individuals make choices on a certain topic

# Data

The data used in the application comes from VTT's [Gen Z food study](https://www.vttresearch.com/en/news-and-ideas/activists-sceptics-many-faces-gen-z-changing-food-system). While the application can be adapted to work with other data, this process has not been fully automated. The `docs/examples/mock_survey.csv` file is similar to the actual dataset that has been used, but with randomized respondent values and only 10 respondents instead of 900.

The dataset contains latent variables that have been derived from the original questions of the survey. The reason that latent variables are used is that they contain the information more compactly: The survey contains over 100 questions, but these have been reduced to just 13 latent variables. This significantly shortens the length of the prompts sent to the LLM. Additionally, in many cases the terms of use for raw survey data may prohibit sending it to an LLM that could save the prompts.

# Statements

By uploading a CSV file (no header row, one entry per row, no commas) containing statements, an LLM is tasked with giving Likert-scale answers to the statements based on the individual latent factors of each agent. Refer to the example file at `docs/examples/example_statements.csv` to see the expected format.

# Future scenario

When the user submits a future scenario, the latent values of each agent are transformed and saved to the the agent's future_info class modifier. After this, the LLM can be requested to give Likert-scale answers based on both the current and future latent factors of each agent.

The application has been tested with four scenarios taken from a report by Matti et al. (2023): _Eco-states_, _Greening through crisis_, _Green business boom_ and _Glocal eco-world_. These scenarios are fairly long and the tranformation process can take several minutes with a large number of agents. Occasionally the LLM refuses to carry out the transformation or the gives the response in a wrong format, causing an error in the application.

You can also use shorter scenarios and create your own scenarios, but remember that they should be somehow related to food or sustainability. To use a built-in default scenario, simply enter `default` in the future scenario field.

See `docs/examples/example_future_scenario.md` to see one of the future scenarios by Matti et al. It is formatted in Markdown syntax and everything graphical has been left out, because only plain text can be sent to the LLM.

**Reference:**

Matti, Jensen, Bontoux, Goran, Pistocchi, Salvi, Towards a fair and sustainable Europe 2050:
social and economic choices in sustainability transitions, Publications Office of the European Union, Luxembourg,
2023, doi:10.2760/804844, JRC133716

# Export

The user is able to download a zip file containing two csv files, one for current answers and one for future answers. In the case that no future scenario has been submitted, only the current answers file will be populated. The structure of these files is the following:
| Agent | Age | Gender | Question 1 | Question 2 |
| ----- | ----- | ----- | ----- | ----- |
| 1 | 21 | Female | 4 | 1 |
| 2 | 27 | Male | 3 | 5 |
