#!/bin/bash
# Utility script to install local VS Code Server extensions

# Usage: install_local_extension <extension_path> <extension_id> [version]
# Example: install_local_extension "/path/to/my-extension" "my-extension" "1.0.0"
install_local_extension() {
  local extension_path="$1"
  local extension_id="$2"
  local version="${3:-1.0.0}"

  if [ -z "$extension_path" ] || [ -z "$extension_id" ]; then
    echo "Error: Missing required arguments"
    echo "Usage: install_local_extension <extension_path> <extension_id> [version]"
    return 1
  fi

  if [ ! -d "$extension_path" ]; then
    echo "Error: Extension path does not exist: $extension_path"
    return 1
  fi

  if ! command -v jq &>/dev/null; then
    echo "Error: jq is required but not installed"
    return 1
  fi

  local extensions_dir="$HOME/.local/share/code-server/extensions"
  local extensions_json="$extensions_dir/extensions.json"
  local link_target="$extensions_dir/$extension_id"

  # Create extensions directory if it doesn't exist
  mkdir -p "$extensions_dir"

  # Create symlink (use -sf to force overwrite if exists)
  echo "Creating symlink: $link_target -> $extension_path"
  ln -sfn "$extension_path" "$link_target"

  # Register in extensions.json
  if [ ! -f "$extensions_json" ]; then
    echo "Creating new extensions.json"
    echo "[]" > "$extensions_json"
  fi

  echo "Registering extension in extensions.json..."
  local timestamp_ms=$(($(date +%s) * 1000))
  local entry
  entry=$(jq -n \
    --arg id "$extension_id" \
    --arg ver "$version" \
    --arg path "$link_target" \
    --argjson ts "$timestamp_ms" \
    '{
      identifier: { id: $id },
      version: $ver,
      location: { "$mid": 1, path: $path, scheme: "file" },
      relativeLocation: $id,
      metadata: { installedTimestamp: $ts, source: "local", "private": true }
    }')

  jq --argjson entry "$entry" --arg id "$extension_id" \
    'if any(.[]; .identifier.id == $id)
     then map(if .identifier.id == $id then $entry else . end)
     else . + [$entry]
     end' "$extensions_json" > "$extensions_json.tmp" \
  && mv "$extensions_json.tmp" "$extensions_json"

  if [ $? -eq 0 ]; then
    echo "✓ Successfully installed local extension: $extension_id"
    echo "  Restart VS Code Server or reload window to activate"
    return 0
  else
    echo "✗ Failed to register extension"
    return 1
  fi
}

# If script is executed directly (not sourced), run with arguments
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
  install_local_extension "$@"
fi
