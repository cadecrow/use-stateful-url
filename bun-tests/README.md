# Bun Tests for useStatefulUrl

This directory contains the Bun-based test suite for the `useStatefulUrl` package. Bun provides significantly faster test execution compared to Jest while maintaining compatibility with React Testing Library.

## Prerequisites

Make sure you have Bun installed:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Or using npm
npm install -g bun
```

## Installation

Install the required dependencies:

```bash
# Install React Testing Library for Bun
bun add --dev @testing-library/react @testing-library/dom happy-dom
```

## Running Tests

### Basic Test Execution

```bash
# Run all tests
bun test bun-tests/

# Or use the custom runner
bun run bun-tests/run-bun-tests.ts
```

### Available Options

- **Watch mode**: Automatically re-run tests when files change
  ```bash
  bun test bun-tests/ --watch
  # or
  bun run bun-tests/run-bun-tests.ts --watch
  ```

- **Coverage reporting**: Generate test coverage reports
  ```bash
  bun test bun-tests/ --coverage
  # or
  bun run bun-tests/run-bun-tests.ts --coverage
  ```

- **Verbose output**: Show detailed test information
  ```bash
  bun test bun-tests/ --verbose
  # or
  bun run bun-tests/run-bun-tests.ts --verbose
  ```

- **Bail on first failure**: Stop testing on first failure
  ```bash
  bun test bun-tests/ --bail
  # or
  bun run bun-tests/run-bun-tests.ts --bail
  ```

### Combined Options

```bash
# Watch mode with coverage and verbose output
bun run bun-tests/run-bun-tests.ts --watch --coverage --verbose

# Quick test run that stops on first failure
bun run bun-tests/run-bun-tests.ts --bail
```

## Test Files

- **`setup.ts`**: Test environment setup and configuration
- **`useStatefulUrl.test.ts`**: Core hook functionality tests
- **`urlEncoding.test.ts`**: URL encoding edge cases and special characters
- **`hashUtils.test.ts`**: Coexistence functionality and utility tests
- **`convenienceHooks.test.ts`**: Tests for `useStatefulUrlArray`, `useStatefulUrlSet`, and `useStatefulUrlString`

## Configuration

- **`bunfig.toml`**: Bun test configuration file
- **`run-bun-tests.ts`**: Custom test runner with command-line options

## Integration with Package Scripts

You can add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:bun": "bun test bun-tests/",
    "test:bun:watch": "bun test bun-tests/ --watch",
    "test:bun:coverage": "bun test bun-tests/ --coverage",
    "test:bun:runner": "bun run bun-tests/run-bun-tests.ts"
  }
}
```

## Performance Comparison

Bun typically provides:
- **5-10x faster** test execution compared to Jest
- **Built-in TypeScript support** without additional configuration
- **Native JSX/TSX support** without Babel
- **Built-in DOM environment** (happy-dom) without additional setup
- **Hot reload** in watch mode

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Make sure all dependencies are installed with `bun install`
2. **DOM environment issues**: Bun uses `happy-dom` by default, which is faster but may have slight differences from `jsdom`
3. **TypeScript errors**: Bun has built-in TypeScript support, but make sure your `tsconfig.json` is compatible

### Debugging

To debug tests, you can use Bun's built-in debugger:

```bash
bun --inspect test bun-tests/
```

## Differences from Jest Tests

The Bun tests are functionally identical to the Jest tests but use:
- `import { test, describe, expect, beforeEach } from "bun:test"` instead of Jest globals
- Bun's native DOM environment instead of Jest + jsdom
- Simpler configuration through `bunfig.toml`

All test logic, expectations, and coverage remain the same. 