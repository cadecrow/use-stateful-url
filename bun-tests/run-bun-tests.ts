#!/usr/bin/env bun

/**
 * Bun Test Runner for useStatefulUrl
 * 
 * Usage:
 *   bun run bun-tests/run-bun-tests.ts
 *   bun run bun-tests/run-bun-tests.ts --watch
 *   bun run bun-tests/run-bun-tests.ts --coverage
 *   bun run bun-tests/run-bun-tests.ts --verbose
 */

import { parseArgs } from "util";

// Parse command line arguments
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    watch: { type: "boolean", short: "w" },
    coverage: { type: "boolean", short: "c" },
    verbose: { type: "boolean", short: "v" },
    bail: { type: "boolean", short: "b" },
    help: { type: "boolean", short: "h" },
  },
  allowPositionals: true,
});

if (args.help) {
  console.log(`
🧪 Bun Test Runner for useStatefulUrl

Usage:
  bun run bun-tests/run-bun-tests.ts [options]

Options:
  -w, --watch     Watch for changes and re-run tests
  -c, --coverage  Generate coverage report
  -v, --verbose   Verbose output
  -b, --bail      Stop on first test failure
  -h, --help      Show this help message

Examples:
  bun run bun-tests/run-bun-tests.ts
  bun run bun-tests/run-bun-tests.ts --watch --verbose
  bun run bun-tests/run-bun-tests.ts --coverage
`);
  process.exit(0);
}

// Build command arguments
const bunArgs = ["test"];

// Add test directory
bunArgs.push("bun-tests/");

// Add flags based on arguments
if (args.watch) {
  bunArgs.push("--watch");
}

if (args.coverage) {
  bunArgs.push("--coverage");
}

if (args.verbose) {
  bunArgs.push("--verbose");
}

if (args.bail) {
  bunArgs.push("--bail");
}

console.log("🚀 Starting Bun tests...");
console.log(`Command: bun ${bunArgs.join(" ")}\n`);

// Run the tests
const proc = Bun.spawn(["bun", ...bunArgs], {
  stdio: ["inherit", "inherit", "inherit"],
  cwd: process.cwd(),
});

// Wait for completion and exit with same code
const exitCode = await proc.exited;
process.exit(exitCode); 