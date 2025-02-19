FROM python:3.12-slim

RUN pip install poetry

WORKDIR /app

COPY . .

RUN chown -R root:0 /app && chmod -R g+rwX /app

ENV POETRY_VIRTUALENVS_CREATE=false

RUN poetry install --without dev

EXPOSE 5500

CMD ["poetry", "run", "gunicorn", "--bind", "0.0.0.0:5500", "backend.app:app"]