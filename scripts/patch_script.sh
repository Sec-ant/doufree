#!/bin/bash

# Function to download file from URL
download_file() {
    local url="$1"
    local output_dir="./dist/assets"
    mkdir -p "$output_dir" || {
        printf "Error: Failed to create output directory\n" >&2
        return 1
    }
    curl -LOs --output-dir "$output_dir" "$url" || {
        printf "Error: Failed to download file from URL: %s\n" "$url" >&2
        return 1
    }
}

# Function to copy file and insert ".patch" before extension
copy_and_rename() {
    local original_file="$1"
    local filename="${original_file%.*}"
    local extension="${original_file##*.}"
    local new_file="${filename}.patch.${extension}"
    if ! cp "$original_file" "$new_file"; then
        printf "Error: Failed to copy file %s\n" "$original_file" >&2
        return 1
    fi
    printf "%s\n" "$new_file"
}

# Function to apply grit to the patch file
apply_grit() {
    local patch_file="$1"
    if ! npx grit apply ./patterns/add_local_reshare.grit "$patch_file" --force --output compact; then
        printf "Error: Failed to apply grit to file %s\n" "$patch_file" >&2
        return 1
    fi
}

# Function to read URL from JSON file if SCRIPT_URL is not set
read_url_from_json() {
    local json_file="./script-url.meta.json"
    if [[ -f "$json_file" ]]; then
        local url
        url=$(jq -r '.[0]' "$json_file")
        if [[ -n "$url" && "$url" != "null" ]]; then
            printf "%s\n" "$url"
            return 0
        fi
    fi
    return 1
}

# Main function
main() {
    # Try to get URL from SCRIPT_URL environment variable
    local url="$SCRIPT_URL"

    # If SCRIPT_URL is not set, try to read from JSON file
    if [[ -z "$url" ]]; then
        if ! url=$(read_url_from_json); then
            printf "Error: SCRIPT_URL environment variable is not set and no valid URL found in script-url.meta.json\n" >&2
            return 1
        fi
    fi

    # Download file from URL
    download_file "$url" || return 1

    # Get filename from URL
    local filename=$(basename "$url")
    local filepath="./dist/assets/$filename"

    # Copy file and rename with ".patch" inserted before extension
    local patch_file=$(copy_and_rename "$filepath") || return 1

    # Apply grit to the patch file
    apply_grit "$patch_file" || return 1

    # Add URL to JSON file if not already present
    ./scripts/add_url.sh "$url"

    printf "Success: Grit applied to %s\n" "$patch_file"
}

# Execute main function
main "$@"
