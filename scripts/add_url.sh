#!/bin/bash

# Function to add URL to JSON file if not already present
add_url_to_json() {
  local url="$1"
  local json_file="./script-url.meta.json"
  if [[ ! -f "$json_file" ]]; then
    printf '[]' >"$json_file"
  fi
  if jq --arg url "$url" 'index($url)' "$json_file" | grep -q 'null'; then
    jq --arg url "$url" '[$url] + .' "$json_file" >"$json_file.tmp" && mv "$json_file.tmp" "$json_file"
  fi
}

# Call the function if this script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  add_url_to_json "$1"
fi
