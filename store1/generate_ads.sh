#!/bin/sh

# Generate ads_data.js from manifest.txt
# Parses [banners] section with format: image_path|url

MANIFEST="manifest.txt"
OUTPUT="ads_data.js"

# Extract banner lines and generate JS
awk '
BEGIN { 
    print "var ads = ["
    in_banners = 0
    count = 0
}
/^\[banners\]$/ { in_banners = 1; next }
/^\[/ { in_banners = 0; next }
in_banners && /\|/ {
    split($0, parts, "|")
    image = parts[1]
    url = parts[2]
    count++
    if (count > 1) print ","
    printf "  {\n"
    printf "    image: \"%s\",\n", image
    printf "    url: \"%s\",\n", url
    printf "    name: \"banner%d\"\n", count
    printf "  }"
}
END { 
    print "\n];"
}
' "$MANIFEST" > "$OUTPUT"

echo "Generated $OUTPUT with $(grep -c 'image:' "$OUTPUT") banners"
