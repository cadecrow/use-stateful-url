#!/bin/bash

# Bun Test Runner for useStatefulUrl
# Simple shell script alternative to the TypeScript runner

WATCH_MODE=false
COVERAGE=false
VERBOSE=false
BAIL=false
HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -w|--watch)
      WATCH_MODE=true
      shift
      ;;
    -c|--coverage)
      COVERAGE=true
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -b|--bail)
      BAIL=true
      shift
      ;;
    -h|--help)
      HELP=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ "$HELP" = true ]; then
  echo "🧪 Bun Test Runner for useStatefulUrl"
  echo ""
  echo "Usage:"
  echo "  ./bun-tests/run-bun-tests.sh [options]"
  echo ""
  echo "Options:"
  echo "  -w, --watch     Watch for changes and re-run tests"
  echo "  -c, --coverage  Generate coverage report"
  echo "  -v, --verbose   Verbose output"
  echo "  -b, --bail      Stop on first test failure"
  echo "  -h, --help      Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./bun-tests/run-bun-tests.sh"
  echo "  ./bun-tests/run-bun-tests.sh --watch --verbose"
  echo "  ./bun-tests/run-bun-tests.sh --coverage"
  exit 0
fi

# Build command
BUN_CMD="bun test bun-tests/"

if [ "$WATCH_MODE" = true ]; then
  BUN_CMD="$BUN_CMD --watch"
fi

if [ "$COVERAGE" = true ]; then
  BUN_CMD="$BUN_CMD --coverage"
fi

if [ "$VERBOSE" = true ]; then
  BUN_CMD="$BUN_CMD --verbose"
fi

if [ "$BAIL" = true ]; then
  BUN_CMD="$BUN_CMD --bail"
fi

echo "🚀 Starting Bun tests..."
echo "Command: $BUN_CMD"
echo ""

# Run the tests
exec $BUN_CMD 