#!/usr/bin/env bash
set -eu

input="$(cat)"
tool="$(printf '%s' "$input" | jq -r '.tool_name')"
reason='Changesets are created only with the changesets CLI: pnpm exec changeset add --patch|--minor|--major @draekien/create-d9-app -m "<summary>" < /dev/null, or --empty -m "<summary>". Do not write .changeset/*.md by hand.'

deny() {
  jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

case "$tool" in
  Write|Edit|MultiEdit|NotebookEdit)
    path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' | tr '\\' '/')"
    if printf '%s' "$path" | grep -Eq '(^|/)\.changeset/[^/]+\.md$'; then
      deny
    fi
    ;;
  Bash)
    cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' | sed -E 's/[0-9]*>&[0-9]+//g')"
    if printf '%s' "$cmd" | grep -Eq '\.changeset/[^ "'"'"']*\.md' \
      && printf '%s' "$cmd" | grep -Eq '(>|\btee\b|\bcp\b|\bmv\b|\btouch\b|sed[^|]*-i)' \
      && ! printf '%s' "$cmd" | grep -Eq 'changeset add'; then
      deny
    fi
    ;;
esac
exit 0
