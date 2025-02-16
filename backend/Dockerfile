FROM python:3.12-slim

RUN pip install poetry

WORKDIR /app

COPY . .

RUN poetry config virtualenvs.create false && poetry install --without dev

EXPOSE 5500

CMD ["poetry", "run", "python", "backend/app.py"]