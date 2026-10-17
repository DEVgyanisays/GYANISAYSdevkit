#!/usr/bin/env bash
# build-spec-check.sh — two mechanical guarantees for BUILD_SPEC.md (Saarthi kit)
#   1. COVERAGE : every UI action handler in the build is documented in BUILD_SPEC.md (in `backticks`)
#   2. LINT     : BUILD_SPEC.md, data-model.md and API_CONTRACT.md carry no sample people, organisations or money
# Usage: ./build-spec-check.sh [build.html|app.js] [BUILD_SPEC.md]
set -euo pipefail
cd "$(dirname "$0")"
SRC="${1:-frontend/app.js}"
SPEC="${2:-BUILD_SPEC.md}"
echo "Build : $SRC"
echo "Spec  : $SPEC"
echo

ACTIONS=$(grep -oE "on(click|change|input|keydown|submit)=\\\\?[\"'][a-zA-Z_][a-zA-Z0-9_]*\(" "$SRC" \
  | sed -E "s/on[a-z]+=\\\\?[\"']//; s/\($//" | sort -u | grep -vxE 'if|event|this|S|document|window|setTimeout')
total=0; missing=0
echo "=== COVERAGE (action -> in spec?) ==="
while IFS= read -r a; do
  [ -z "$a" ] && continue
  total=$((total+1))
  if ! grep -q "\`$a\`" "$SPEC"; then echo "  MISSING: $a"; missing=$((missing+1)); fi
done <<< "$ACTIONS"
echo "  $((total-missing))/$total actions documented."
echo

echo "=== SAMPLE-DATA LINT (must be zero) ==="
BLOCK='Monica|Sajal|Arjun|Meera|Tanvi|Kavya|Rohan|Neha Kapoor|Sameer|Isha Verma|Vikram|Kabir|Imran|Leela|Neel Kamath|Sunita|Mohit|Priyanka|Rahul|Farida|Alok|Sneha|Kiran Joshi|Anil Pawar|Girish|Ashwini|ABC Ltd|example\.in|98xxx|₹ ?[0-9]|Rs\.? ?[0-9]'
hits=$(grep -nE "$BLOCK" "$SPEC" data-model.md API_CONTRACT.md 2>/dev/null || true)
if [ -n "$hits" ]; then echo "$hits"; lint=1; else echo "  clean — no sample data found."; lint=0; fi
echo

[ "$missing" -eq 0 ] && [ "$lint" -eq 0 ] && echo "PASS" || { echo "FAIL"; exit 1; }
