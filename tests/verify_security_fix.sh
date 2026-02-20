#!/bin/bash
if grep -q "TRUSTWORTHY ON" sqlhttp.js; then
    echo "FAIL: Found insecure 'TRUSTWORTHY ON' configuration in sqlhttp.js"
    exit 1
else
    echo "PASS: 'TRUSTWORTHY ON' not found in sqlhttp.js"
    exit 0
fi
