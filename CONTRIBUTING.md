# Introduction
Welcome to canica, dear contributor. We are glad you are here. This document will guide you through the process of contributing to this project.

# Project Overview
canica is a text dataset viewer: it takes in text data and their corresponding embeddings, and allows you to interactively explore it in a 2D plot. The way we do this is by using dimensionality reduction algorithms, such as t-SNE and UMAP. We developed this tool internally at Lakera AI to explore our datasets, and we decided to open source it so that others can benefit from it as well.

# How to Contribute
## Guidelines
This project is open to contributions from anyone. We welcome contributions of all kinds. If you want to give feedback, report a bug or request a feature, please open an issue. If you want to contribute code or documentation, please open a merge request on the [GitLab repository](https://gitlab.com/lakeraai/canica). We will review your contribution and merge it if it is in line with our goals for the project.

## Style Guide
For the Python parts of the project, we follow the [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide. We use [Black](https://github.com/psf/black) to automatically format our code. We perform static type checking with [mypy](http://mypy-lang.org/).

For the TypeScript parts of the project, we typecheck with [TypeScript](https://www.typescriptlang.org/). We use [Prettier](https://prettier.io/) to automatically format our code.

This requirements are all enforced by our pre-commit hooks. Make sure to follow the instructions below to set them up.

# Contribution Process
## Forking the Repository
Fork either the GitHub or GitLab repository versions of the project. Please be mindful that any contributions will need to be made to the GitLab repository, as the GitHub repository is a mirror.

## Project Setup
### Python
The Python environment management is done via [hatch](https://github.com/pypa/hatch). Any Python-related command must therefore be run using `hatch -e dev run <command>`. This will ensure that the correct environment is used. If the environment is not set up, the command will take care of installing all required dependencies, so you don't need to worry about that.

In particular, if you need to test something related to canica, you will need to run `hatch -e dev run jupyter lab`.

### TypeScript
To build the bundled JavaScript file, run `npm run build`. These files are needed to run the widget, so make sure you build them before testing the widget. The command `npm run dev` will build the files and watch for changes, rebuilding them automatically.

### Pre-Commit Hooks
We use [pre-commit](https://pre-commit.com/) to run a series of checks on the code before it is committed. This ensures that the code is formatted correctly, that the tests pass, and that the code is properly typed. To set up the pre-commit hooks, run `hatch -e dev run pre-commit install` in the root of the repository.

## Submitting a Merge Request
When you submit a Merge Request, please make sure to include a detailed description of the changes you made, and to reference any issues that are related to the Merge Request. We will review your Merge Request and merge it if it is in line with our goals for the project.

All submitted code must pass our pre-commit hooks and CI pipelines, and must be properly tested. If you are unsure about how to write tests, please ask for help.

# Conclusion
## Acknowledgments
Thanks to all the people who have contributed to this project, and to the people who have inspired us to create it. In particular, thanks to the team at Lakera AI for their positive feedback and support.

## Contact Information
Any questions or comments can be directed to jbt (at) lakera (dot) ai.