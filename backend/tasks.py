from invoke import task


@task
def start(ctx):
    ctx.run("poetry run python3 backend/app.py")


@task
def test(ctx):
    ctx.run("coverage run --branch -m pytest && coverage report -m && coverage html")
