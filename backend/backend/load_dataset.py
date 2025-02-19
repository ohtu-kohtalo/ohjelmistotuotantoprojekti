import pandas


def load_dataset(file_path: str) -> pandas.DataFrame:
    """Reads an csv file and returns a pandas DataFrame object"""
    return pandas.read_csv(file_path, delimiter=";")
