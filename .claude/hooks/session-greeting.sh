#!/bin/bash

PROJECT=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown project")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no branch")
DATE=$(date "+%A, %B %-d")

echo "{\"systemMessage\": \"👋 Hey! Welcome back to **$PROJECT**! You're on branch '$BRANCH' and today is $DATE. Let's build something awesome! 🚀\"}"
