#!/usr/bin/env bash
# Replace public/inequivalent with the solver from Inequivalent master.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/public/inequivalent"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -fsSL -o "$tmp/src.tar.gz" \
  https://codeload.github.com/gkane1234/Inequivalent/tar.gz/refs/heads/master
tar -xzf "$tmp/src.tar.gz" -C "$tmp" --strip-components=1

rm -rf "$dest"
mkdir -p "$dest"
cp -a "$tmp/web/." "$dest/"
