#!/usr/bin/env python
import subprocess
from pathlib import Path


def main() -> None:
    # We're under scripts/, BASE_DIR is the repo root
    BASE_DIR = Path(__file__).resolve().parent.parent

    DIRECTORIES = ["."]

    for subdir in DIRECTORIES:
        dir = BASE_DIR / subdir
        result = subprocess.run(
            ["poetry", "lock", "--check"],
            cwd=dir,
            stderr=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
        )

        if result.returncode != 0:
            print(f"In {dir}, poetry.lock is not consistent with pyproject.toml.")
            print(
                "If you're trying to add a new dependency, use `poetry add package`"
                " instead of manually editing pyproject.toml."
            )
            print(
                "It's also possible that you simply forgot to commit the updated "
                "poetry.lock."
            )
            print(
                "For more info about Poetry, see "
                "https://www.notion.so/lakera/Poetry-and-Python-packages-fabca84f11284a4ab8a199bd31564ccf?pvs=4"
            )
            exit(1)


if __name__ == "__main__":
    main()
