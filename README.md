# Ohtuprojekti

This application, developed by a team of University of Helsinki students for [VTT](https://www.vttresearch.com/), simulates consumer behavior by creating AI agents from questionnaire data.
The application allows for researchers and and analysts to:

- Interact with virtual respondents
  - Pose questions to a diverse pool of AI agents whose profiles (age, gender, past answers) are drawn directly from [real survey data](https://www.vttresearch.com/en/news-and-ideas/activists-sceptics-many-faces-gen-z-changing-food-system).
- Model “what-if” futures
  - Define a hypothetical scenario—economic shift, new product launch, cultural trend, etc.—and automatically transform each agent’s attributes and answer patterns to project how opinions might evolve.
- Visualize responses
  - View current vs. future answer distributions side-by-side in interactive charts. Quickly spot shifts in sentiment, emerging consensus, or areas of high uncertainty.
- Export raw data
  - Download both current and future agent responses as CSV files (bundled in a ZIP), complete with demographics, for further statistical analysis or reporting.

![Prettier](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/black.yml/badge.svg)
![Black](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/prettier.yml/badge.svg)
![Python tests](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/python_tests.yml/badge.svg)
![End-to-end tests](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/e2e.yml/badge.svg)
[![codecov](https://codecov.io/gh/ohtu-kohtalo/ohjelmistotuotantoprojekti/graph/badge.svg?token=IXPDGIWJ57)](https://codecov.io/gh/ohtu-kohtalo/ohjelmistotuotantoprojekti)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Documentation](/docs/)
- [Backlog](https://github.com/orgs/ohtu-kohtalo/projects/1)

## Prerequisites

- **Python 3.12 or higher**
- **Poetry 2.0.0 or higher**
- **Node.js and npm**
- **A [Gemini](https://ai.google.dev/gemini-api/docs/api-key) API key
  or an [OpenAI](https://openai.com/api/) API key**
- **A CSV data file**

## Installation

Clone the repository:

```bash
git clone https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti.git
```

Navigate to the project folder:

```bash
cd ohjelmistotuotantoprojekti
```

> [!IMPORTANT]
> Do the next installation steps in order

### Frontend

Install frontend dependencies:

```bash
cd frontend && npm install
```

### Backend

Install backend dependencies:

```bash
cd ../backend && poetry install

```

### Data file

You need to put a CSV data file in the `backend/data/` directory. The application uses the data to create agents. If you do not have a data file, you can still test the application by using the `mock_survey.csv` file that can be found in the `docs/examples/` directory. Copy and paste the mock_survey.csv file into backend/data/ directory. Note that when using the application with the mock_survey.csv file, you can create a maximum of 10 agents.

If you want to use some other dataset than the VTT's Gen Z food study, you need to do some changes to the code. Specifically, in the file `backend/backend/services/agent_transformer.py` update the variables listed in the class variable `INTRO_END` to match the new variables in your dataset. These variables can be survey questions, statements, or latent variables derived from your data. The application has not been tested with any other data.

### .env file

1. Create a `.env` file in the `backend/` directory (not in the backend/backend directory).

2. Add the following lines into the `.env` file:

   ```env
   LLM_PROVIDER=<gemini / openai>
   GEMINI_API_KEY=<your-api-key-here>
   OPENAI_API_KEY=<your-api-key-here>
   CSV_FILE_PATH=data/<file-name-here>
   ```

   Choose either `gemini` or `openai` and replace `<your-api-key-here>` and `<file-name-here>` with your actual API key and file name.

## Usage

1. Start the server in the backend folder:

- If you are using MacOs/Linux with:

  ```bash
  poetry run invoke start
  ```

- If you are using Windows with:

  ```bash
  python -m backend.app
  ```

2. Start the frontend application in the frontend folder:

```bash
npm run dev
```

3. Now the application is ready to be used. Please hover over the ?-icons in the UI for further instructions.
