#!/bin/bash
# Prevent recursion if claude -p itself triggers this hook
if [ "${EXPLAIN_BASH_HOOK:-0}" = "1" ]; then
  exit 0
fi
export EXPLAIN_BASH_HOOK=1

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

EXPLANATION=$(claude -p "In one short sentence, explain what this bash command does and why Claude might run it: $COMMAND" 2>/dev/null)

if [ -n "$EXPLANATION" ]; then
  echo "$EXPLANATION" | jq -Rs '{"systemMessage": .}'
fi
