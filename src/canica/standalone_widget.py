import json
import os
import pathlib

import pandas as pd

from canica.data import InputData, create_input_dict

TMP_DATA_PATH = pathlib.Path(__file__).parent.parent.parent / "data" / "tmp_data.json"


def launch_widget() -> None:
    os.system("npm run standalone")


def save_as_json(d: dict, path: pathlib.Path) -> None:
    with open(path, "w") as f:
        json.dump(d, f)


def save_input_data(
    df: pd.DataFrame, embedding_col: str, text_col: str, hue_col: str
) -> pathlib.Path:
    formatted_data: InputData = create_input_dict(
        df, embedding_col=embedding_col, text_col=text_col, hue_col=hue_col
    )
    save_as_json(formatted_data.model_dump(), TMP_DATA_PATH)

    return TMP_DATA_PATH


def show_standalone_canica(
    df: pd.DataFrame, embedding_col: str, text_col: str, hue_col: str
) -> None:
    _ = save_input_data(
        df,
        embedding_col=embedding_col,
        text_col=text_col,
        hue_col=hue_col,
    )
    launch_widget()


if __name__ == "__main__":
    show_standalone_canica(
        pd.read_parquet(
            pathlib.Path(__file__).parent.parent.parent
            / "data"
            / "wikipedia_5k_with_embeddings.parquet"
        ),
        "embedding",
        "text",
        "pi_score",
    )
