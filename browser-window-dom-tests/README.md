# DOM-Dependent Tests

This directory contains tests that require DOM environment setup (window, location, etc.) for the `useStatefulUrl` package.

## Test Structure

- **`setup.ts`** - DOM environment configuration using happy-dom
- **`bunfig.toml`** - Bun configuration for DOM testing environment
- **`useStatefulUrl.hook.test.ts`** - Core hook functionality with DOM integration
- **`convenienceHooks.dom.test.ts`** - Array, Set, and String convenience hooks
- **`hashUtils.dom.test.ts`** - Hash utility functions with actual window object

## Running DOM Tests

From the project root:

```bash
# Run all DOM tests
npm run test:dom

# Run DOM tests in watch mode  
npm run test:dom:watch

# Run DOM tests with coverage
npm run test:dom:coverage
```

## Separate from Pure Function Tests

These tests are separate from the `bun-tests/` directory to allow:
- Pure function tests to run quickly without DOM setup overhead
- DOM tests to be developed/debugged independently
- Different test configurations for different test types

## DOM Environment

Tests use **happy-dom** for fast, lightweight DOM simulation:
- Faster than jsdom
- Full DOM API compatibility
- Window, location, history, and URLSearchParams support
- Event system for hashchange events

## Test Coverage

DOM tests cover:
- ✅ Hook initialization from URL hash
- ✅ State updates triggering URL changes  
- ✅ Browser navigation (hashchange events)
- ✅ Debouncing behavior
- ✅ Custom serializers with DOM
- ✅ Convenience hooks integration
- ✅ Hash utils with actual window object
- ✅ Position strategies and delimiters

## Current Status

🚧 **In Development** - DOM environment setup is configured but may need fine-tuning for all test scenarios.

Run `npm run test:pure` for stable pure function tests while DOM tests are being refined. 