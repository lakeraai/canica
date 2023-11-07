import numpy as np
import pandas as pd
from canica.data import Point
from canica.widget import CanicaTSNE


def test_no_explicit_text():
    # If no name of the text column is provided, the default is "text".
    text_input = ["a", "b"]
    embedding_input = [np.array([1, 2, 3]), np.array([4, 5, 6])]
    hue_input = ["1", "2"]
    df = pd.DataFrame(
        {
            "text": text_input,
            "embeddings_col": embedding_input,
            "hue_col": hue_input,
        }
    )

    w_data = CanicaTSNE(df, embedding_col="embeddings_col", hue_col="hue_col").data
    assert w_data[0] == Point(text="a", embedding=[1, 2, 3], hue_var="1").model_dump()
    assert w_data[1] == Point(text="b", embedding=[4, 5, 6], hue_var="2").model_dump()
