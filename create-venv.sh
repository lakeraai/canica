#!/bin/bash

set -eo pipefail

rm -rf venv

conda create -y --prefix ./venv python=3.11
eval "$(conda shell.bash hook)"
conda activate ./venv

pip install poetry
poetry install --with=dev

poetry run pre-commit install --hook-type pre-commit
poetry run pre-commit install --hook-type pre-push