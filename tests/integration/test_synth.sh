#!/usr/bin/env bash
# Integration test: real Silero synthesis of two short Russian phrases.
# Requires .venv-tts (tools/audio/setup-venv.sh) and ffprobe.
set -euo pipefail

TOOLKIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PY="$TOOLKIT_ROOT/.venv-tts/bin/python"
[ -x "$PY" ] || { echo "SKIP-SETUP: run tools/audio/setup-venv.sh first" >&2; exit 2; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cat > "$WORK/storyboard.json" <<'EOF'
{
  "storyId": "US-000",
  "baseUrl": "http://localhost",
  "scenes": [
    { "id": "SC-01", "narration": "Пользователь открывает список проектов.", "actions": [] },
    { "id": "SC-02", "narration": "После сохранения интерфейс сразу подсказывает следующий шаг.", "actions": [] }
  ]
}
EOF

"$PY" "$TOOLKIT_ROOT/tools/audio/synth_narration.py" \
  --storyboard "$WORK/storyboard.json" --out "$WORK/audio"

for id in SC-01 SC-02; do
  f="$WORK/audio/scene-$id.wav"
  [ -s "$f" ] || { echo "FAIL: $f missing or empty"; exit 1; }
  sr=$(ffprobe -v error -of csv=p=0 -show_entries stream=sample_rate "$f")
  [ "$sr" = "48000" ] || { echo "FAIL: $f sample rate $sr != 48000"; exit 1; }
  dur=$(ffprobe -v error -of csv=p=0 -show_entries format=duration "$f")
  awk -v d="$dur" 'BEGIN { exit !(d > 0.5) }' || { echo "FAIL: $f duration $dur too short"; exit 1; }
done

jq -e '."SC-01" > 0.5 and ."SC-02" > 0.5' "$WORK/audio/durations.json" >/dev/null \
  || { echo "FAIL: durations.json invalid"; exit 1; }

PYTHONPATH="$TOOLKIT_ROOT/tools/audio" "$PY" - <<'EOF'
from synth_narration import speakable_en
assert speakable_en("MCP server", {}) == "em, see, pee server."
assert speakable_en("tmgr and SSH.", {"tmgr": "tee, em, gee, ar"}) == "tee, em, gee, ar and ess, ess, aitch."
assert speakable_en("tmgr-ui GitHub", {"tmgr": "x"}) == "tmgr-ui git hub."
assert speakable_en("D", {}) == "dee."
EOF

echo "PASS: synth integration"
