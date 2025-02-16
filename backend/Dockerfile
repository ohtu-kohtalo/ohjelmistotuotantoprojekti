FROM python:3.12-slim

RUN pip install poetry

WORKDIR /app

COPY . .

RUN poetry install

EXPOSE 5000

CMD ["poetry", "run", "python", "backend/app.py"]