# Ohtuprojekti

This program is being developed for [VTT](https://www.vttresearch.com/en) as part of a University of Helsinki course project.

![Prettier](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/black.yml/badge.svg)
![Black](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/prettier.yml/badge.svg)
![Unit tests](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/tests.yml/badge.svg)
[![codecov](https://codecov.io/gh/ohtu-kohtalo/ohjelmistotuotantoprojekti/graph/badge.svg?token=IXPDGIWJ57)](https://codecov.io/gh/ohtu-kohtalo/ohjelmistotuotantoprojekti)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Documentation](/docs/)

## Prerequisites

- **Python 3.12 or higher**
- **Poetry 2.0.0 or higher**
- **Node.js and npm**
- [**A Gemini API key**](https://ai.google.dev/gemini-api/docs/api-key)
- **A CSV data file that contains information about agents**

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

You need to put a CSV data file in the backend/data/ directory. The application uses the data to create agents. If you do not have a data file, you can still test the program by using the test_data.csv file that can be found in the backend/tests/data/ directory. Copy and paste the test_data.csv file into backend/data/ directory.

### .env file

1. Create a `.env` file in the backend directory (not in the backend/backend directory).

2. Add the following lines into the `.env` file:

   ```env
   GEMINI_API_KEY=<your-api-key-here>
   CSV_FILE_PATH=data/<file name here>
   ```

   Just replace `<your-api-key-here>` and `<file name here>` with your actual API key and file name.

## Usage

1. Start the backend server in the backend/backend folder:

```bash
poetry run python app.py
```

2. Start the frontend application in the frontend folder:

```bash
npm run dev
```
