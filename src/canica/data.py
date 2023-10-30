from typing import Hashable, Optional, Union

import numpy as np
import pandas as pd
from pydantic import BaseModel, Field


class Point(BaseModel):
    text: str
    embedding: list[float]
    hue_var: Optional[Union[str, float]] = Field(default=None)


# Type aliases
InputDict = dict[Hashable, Point]


class InputData(BaseModel):
    data: InputDict

    @property
    def ids(self):
        return list(self.data.keys())

    @property
    def text(self):
        return [self.data[id].text for id in self.ids]

    @property
    def embeddings(self):
        return [self.data[id].embedding for id in self.ids]

    @embeddings.setter
    def embeddings(self, new_embeddings: list[list[float]]):
        for i, id in enumerate(self.ids):
            self.data[id].embedding = new_embeddings[i]

    @property
    def hue(self):
        return [self.data[id].hue_var for id in self.ids]

    def model_dump(self, **kwargs):
        return super().model_dump(**kwargs)["data"]


def create_input_dict(
    df: pd.DataFrame,
    embedding_col: str,
    text_col: str,
    hue_col: Union[str, None] = None,
) -> InputData:
    """
    Create an InputData instance in the desired format for the widget.

    Args:
        df: DataFrame containing the text, embeddings, and hue_col.
        embedding_col: Name of the column containing the embeddings.
        text_col: Name of the column containing the text.
        hue_col: Name of the column containing the variable to color by.
            If None, no coloring is applied.
    """
    # Check that the desired columns are in the DataFrame.
    assert embedding_col in df.columns, "embeddings variable not in DataFrame"
    assert text_col in df.columns, "text variable not in DataFrame"
    assert hue_col is None or hue_col in df.columns, "hue_col not in DataFrame"
    # If the DataFrame doesn't have a unique index it leads to issues.
    assert df.index.is_unique, "Elements of the input DataFrame's index must be unique"

    df = df.copy()
    # Select desired columns
    if hue_col is not None:
        df = df[[text_col, embedding_col, hue_col]]
    else:
        df = df[[text_col, embedding_col]]

    # Rename columns
    df = df.rename(
        columns={text_col: "text", embedding_col: "embedding", hue_col: "hue_var"}
    )

    # Convert embeddings to list
    df["embedding"] = df["embedding"].apply(lambda x: list(x))

    # Build dictionary in the right format
    df_dict = df.to_dict(orient="index")
    return InputData(data=df_dict)


def project_pca(X: np.ndarray, n_components: int) -> np.ndarray:
    """Project the data onto the first n_components of the PCA.
    NumPy-only implementation.
    """
    N, D = X.shape
    # Step 1: Get the right input.
    # Standardize data
    X_std = (X - np.mean(X, axis=0)) / np.std(X, axis=0)
    # Compute covariance matrix
    cov_mat = np.cov(X_std.T)
    assert cov_mat.shape == (D, D), (
        f"Covariance matrix should be ({D}, {D}), ",
        f"found {cov_mat.shape} instead.",
    )

    # Step 2: Compute eigenvectors and eigenvalues.
    # Using eigh (instead of eig) because cov_mat is symmetric
    eig_vals, eig_vecs = np.linalg.eigh(cov_mat)
    assert len(eig_vals) == D, (
        "Number of eigenvalues should match number of dimensions, ",
        f"found {len(eig_vals)} instead of {D}.",
    )

    # Step 3: Identify top eigenvectors by absolute value of their eigenvalues.
    eig_pairs = [(np.abs(eig_vals[i]), i) for i in range(D)]
    # Sort eigenvalues in descending order
    eig_pairs.sort(key=lambda x: x[0], reverse=True)
    # Select top-k eigenvalues (where k=n_components)
    eig_pairs = eig_pairs[:n_components]

    # Step 4: Take top eigenvectors
    top_eig_vecs = np.array([eig_vecs[i] for _, i in eig_pairs])

    # Step 5: Project onto top eigenvectors
    X_pca = np.dot(X_std, top_eig_vecs.T)
    assert X_pca.shape == (N, n_components), (
        f"X_pca shape should be ({N}, {n_components}), ",
        f"found {X_pca.shape} instead.",
    )
    return X_pca


def apply_pca(data: InputData, pca_dim: int) -> InputData:
    """Apply PCA to data in the format we used as input to the widget."""
    # If the data is already in a lower dimension, don't do anything.
    input_D = len(data.embeddings[0])
    if input_D <= pca_dim:
        return data
    # To numpy
    X = np.array(data.embeddings)
    X_pca = project_pca(X, n_components=pca_dim)
    # Overwrite into InputDict
    data.embeddings = [list(X_pca[i]) for i in range(len(X_pca))]
    return data
