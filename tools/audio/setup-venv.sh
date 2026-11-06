#!/usr/bin/env bash
# Creates the Python venv used by synth_narration.py. Requires uv (https://docs.astral.sh/uv/).
set -euo pipefail

TOOLKIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV="$TOOLKIT_ROOT/.venv-tts"

if ! command -v uv >/dev/null 2>&1; then
  echo "error: uv not found. Install: curl -LsSf https://astral.sh/uv/install.sh | sh" >&2
  exit 1
fi

uv venv --python 3.12 "$VENV"
uv pip install --python "$VENV/bin/python" torch numpy

echo "TTS venv ready: $VENV"
"$VENV/bin/python" -c "import torch; print('torch', torch.__version__)"
