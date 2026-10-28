#!/bin/zsh
cd -- "$(dirname -- "$0")"
task_python="$(command -v python3)"
task_bundled_python="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [[ -x "$task_bundled_python" ]]; then
  task_python="$task_bundled_python"
fi
if [[ -z "$task_python" ]]; then
  print 'Python 3 is needed to start the local preview.'
  read '?Press Enter to close.'
  exit 1
fi
"$task_python" serve.py
