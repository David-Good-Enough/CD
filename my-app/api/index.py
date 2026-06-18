from pathlib import Path
import sys

# Ensure the project root is importable when Vercel executes api/index.py.
sys.path.append(str(Path(__file__).resolve().parents[1]))

from server import app
