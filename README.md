# Ohtuprojekti

This program is being developed for [VTT](https://www.vttresearch.com/en) as part of a University of Helsinki course project.

![Prettier](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/black.yml/badge.svg)

![Black](https://github.com/ohtu-kohtalo/ohjelmistotuotantoprojekti/actions/workflows/prettier.yml/badge.svg)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Documentation](/docs/)

## Prerequisites

- **Python 3.12 or higher**
- **Poetry 2.0.0 or higher**
- **Node.js and npm**

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

### Backend

Install frontend dependencies:

```bash
cd frontend && npm install
```

### Frontend

Install backend dependencies:

```bash
cd ../backend && poetry install

```

## Usage

1. Start the backend server in the backend/backend folder:
```bash
poetry run python app.py
```

2. Start the frontend application in the frontend folder:
```bash
npm run dev
```
