import numpy as np
import pandas as pd
from canica.data import InputData, Point, create_input_dict


def test_data_happy_path():
    text_input = ["a", "b"]
    embedding_input = [np.array([1, 2, 3]), np.array([4, 5, 6])]
    hue_input = ["1", "2"]
    df = pd.DataFrame(
        {
            "text_col": text_input,
            "embeddings_col": embedding_input,
            "hue_col": hue_input,
        }
    )
    result_dict = create_input_dict(
        df,
        embedding_col="embeddings_col",
        text_col="text_col",
        hue_col="hue_col",
    )
    expected_dict = InputData(
        data={
            0: Point(text="a", embedding=[1, 2, 3], hue_var="1"),
            1: Point(text="b", embedding=[4, 5, 6], hue_var="2"),
        }
    )

    assert result_dict.model_dump() == expected_dict.model_dump()


def test_no_hue():
    text_input = ["a", "b"]
    embedding_input = [np.array([1, 2, 3]), np.array([4, 5, 6])]
    df = pd.DataFrame(
        {
            "text_col": text_input,
            "embeddings_col": embedding_input,
        }
    )
    result_dict = create_input_dict(
        df,
        embedding_col="embeddings_col",
        text_col="text_col",
    )
    expected_dict = InputData(
        data={
            0: Point(text="a", embedding=[1, 2, 3], hue_var=None),
            1: Point(text="b", embedding=[4, 5, 6], hue_var=None),
        }
    )

    assert result_dict.model_dump() == expected_dict.model_dump()
