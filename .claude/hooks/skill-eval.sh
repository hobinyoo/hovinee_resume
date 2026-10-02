#!/bin/bash
# skill-eval.sh — UserPromptSubmit 훅 진입점
# stdin(JSON)을 Node.js 엔진에 넘겨 관련 스킬을 추천한다. Node가 없으면 조용히 통과.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/skill-eval.js"

command -v node >/dev/null 2>&1 || exit 0
[ -f "$NODE_SCRIPT" ] || exit 0

# stdin(JSON)을 그대로 Node로 전달 (nvm/shell 초기화 잡음 억제)
cat | node "$NODE_SCRIPT" 2>/dev/null

# 항상 프롬프트는 통과시킨다
exit 0
