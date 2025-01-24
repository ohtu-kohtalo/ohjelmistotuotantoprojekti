from flask import Flask

app = Flask(__name__)


@app.route("/api/gemini")
def query():
    return "Hello, World!"


if __name__ == "__main__":
    app.run()
