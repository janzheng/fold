#!/usr/bin/env bash
# Install the active proj skills without touching unrelated skill directories.
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
stamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)-$$"
backup_root="${XDG_STATE_HOME:-$HOME/.local/state}/fold/skill-backups/$stamp"

for tool in claude agents cursor; do
  dest="$HOME/.$tool/skills"
  mkdir -p "$dest"
  for source in "$root"/skills/proj:*/; do
    name="$(basename "$source")"
    target="$dest/$name"
    if [ ! -L "$target" ] && [ -d "$target" ] && diff -rq "$source" "$target" >/dev/null; then
      continue
    fi

    staging="$(mktemp -d "$dest/.fold-install.XXXXXX")"
    cp -R "$source" "$staging/$name"
    if [ -e "$target" ] || [ -L "$target" ]; then
      mkdir -p "$backup_root/$tool"
      mv "$target" "$backup_root/$tool/$name"
    fi
    mv "$staging/$name" "$target"
    rmdir "$staging"
    printf '%s: installed %s\n' "$tool" "$name"
  done
done

printf 'Done. Replaced copies, if any, are backed up under %s\n' "$backup_root"
