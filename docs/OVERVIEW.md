# Agents

[Agents](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/blob/dev/backend/backend/entities/agent.py) are defined as individuals, that have been created based on the data.csv file. Essentially one agent is equivalent to one respondee from the data file.
Each agent has their own id, info (age, gender), latent values, questions and future questions along with their responses.

> [!NOTE]
> In this case, latent values refer to underlying values that attempt to explain how individuals make choices on a certain topic

# Statements

By uploading a CSV file (no header row, one entry per row) containing statements, an LLM is tasked with giving likert-scale answers to the statements based on the individual latent factors of each agent.

# Future scenario

When the user submits a future scenario, the latent values of each agent are transformed and saved to the the agent's future_info class modifier. After this, the LLM can be requested to give likert-scale answers based on both the current and future latent factors of each agent.

# Export

The user is able to download a zip file containing two csv files, one for current answers and one for future answers. In the case that no future scenario has been submitted, only the current answers file will be populated. The structure of these files is the following:
|  Agent  |  Age  |  Gender  |  Question 1  |  Question 2  |
|  -----  |  -----  |  -----  |  -----  |  -----  |
|  1  |  21  |  Female  |  4  |  1  |
|  2  | 27  |  Male  | 3  |  5  |
