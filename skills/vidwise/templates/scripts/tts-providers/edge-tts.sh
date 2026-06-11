# Docs:   https://github.com/rany2/edge-tts
# Install: pip install edge-tts  (or uv add edge-tts)
# Voices: edge-tts --list-voices
#   zh-CN-YunxiNeural     (男声)
#   zh-CN-XiaoxiaoNeural  (女声)
#   en-US-AriaNeural      (英文女声)
#   en-US-GuyNeural       (英文男声)

EDGE_TTS_CMD=""

tts_check() {
  # 优先找 PATH 里的 edge-tts（pip 安装）
  if command -v edge-tts >/dev/null 2>&1; then
    EDGE_TTS_CMD="edge-tts"
    return 0
  fi
  # 再找 uv / uv.exe（uv 安装）
  local uv_bin=""
  if command -v uv >/dev/null 2>&1; then
    uv_bin="uv"
  elif command -v uv.exe >/dev/null 2>&1; then
    uv_bin="uv.exe"
  fi
  if [[ -n "$uv_bin" ]] && $uv_bin run edge-tts --version >/dev/null 2>&1; then
    EDGE_TTS_CMD="$uv_bin run edge-tts"
    return 0
  fi
  echo "✗ edge-tts not found (tried PATH and uv run)" >&2
  return 1
}

tts_install_help() {
  cat <<'EOF' >&2
Install edge-tts (free, uses Microsoft Edge's TTS backend, no API key):
  pip install edge-tts
  # or
  uv add edge-tts
List available voices:
  edge-tts --list-voices | less
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-YunxiNeural}"
  # Convert WSL /mnt/X paths to Windows X:/ paths
  # (edge-tts via uv runs as Windows Python, can't open WSL paths)
  local win_out="$out"
  if [[ "$win_out" == /mnt/?/* ]]; then
    local _drive="${win_out:5:1}"
    win_out="${_drive^^}:${win_out:6}"
  fi
  $EDGE_TTS_CMD --text "$text" --voice "$voice" --write-media "$win_out" >/dev/null 2>&1
}
