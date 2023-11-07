import sys
from pathlib import Path

# Read the file path from the first command-line argument
file_path = Path(sys.argv[1])

# Check if directory exists
if not file_path.exists():
    # Create the directory
    file_path.parent.mkdir(parents=True, exist_ok=True)
    # Create the empty file
    file_path.touch()
