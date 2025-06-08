# Contributing to useStatefulUrl

Thank you for your interest in contributing to `useStatefulUrl`! This document provides guidelines for contributing to this React hook package.

## 🎯 Project Overview & Motivation

### What is useStatefulUrl?

`useStatefulUrl` is a React hook that manages state synchronized with URL hash parameters, enabling shareable URLs that preserve application state. When users share a URL, the receiving user sees the same state (open modals, selected filters, search queries, etc.).

### Project History

This project was born out of the need for state persistence and shareability in modern React applications. Traditional state management works great for user interactions, but falls short when users want to bookmark, share, or refresh pages while maintaining their current application state.

The hook was designed to solve the common problem where:

- A user opens a modal, applies filters, or navigates to a specific view
- They want to share that exact state with someone else
- Or they refresh the page and lose all their progress

### Core Philosophy

1. **Shareability First**: URLs should capture meaningful application state
2. **Developer Experience**: Simple API that feels natural in React
3. **Flexibility**: Support for various data types (objects, arrays, Sets, strings, numbers)
4. **Coexistence**: Play nicely with existing hash-based routing or other URL parameters
5. **Performance**: Debounced updates to avoid excessive URL changes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun (preferred / necessary for current tests) or npm
- Basic understanding of React hooks
- Familiarity with URL handling and browser APIs

### Development Setup

```bash
git clone https://github.com/cadecrow/use-hash-state.git
cd use-hash-state
bun install  # or npm install

# Run the working tests
bun test  # Pure function tests (51 tests passing) - window / dom related tests do not work at all. Tried to one-shot some tests, didn't work. Would extremely appreciate contributions for testing.

# Build the package
bun run build
```

## 🧪 Testing Status & Important Notes

### Why Bun?

Faster makes monkey brain excited. Cutting edge make monkey brain feel cool. Also, monkey brain believe it is future.

### ⚠️ Current Testing Implementation

**The test suite is currently in a rough implementation state.** I mostly vibe coded the tests so I could have something a bit acceptable for publishing this as a package. There are definitely plenty of issues with testing that need to be refined.

### ✅ Pure Function Tests (STABLE)

- **Location**: `bun-tests/`
- **Status**: 51 tests passing reliably
- **Coverage**: Serialization, URL encoding, data transformations
- **Command**: `bun test` or `npm run test:pure`

### 🚧 DOM Tests (NOT WORKING)

- **Location**: `browser-window-dom-tests/`
- **Status**: 41 tests created but failing due to DOM environment issues
- **Problem**: Happy-dom setup not properly exposing `window` and `document` globals
- **Command**: `npm run test:dom` (currently fails)

### Testing Philosophy (or why I split them up so I could more easily vibe code)

We've separated tests into two categories:

1. **Pure functions** - Fast, reliable, no DOM dependencies
2. **DOM integration** - Full hook behavior with window/location (needs work)

This separation allows development to continue on core logic while DOM testing infrastructure is refined.

## 📋 Contributing Guidelines

### Before You Start

1. **Check existing issues** - Look for related problems or feature requests
2. **Start small** - Consider fixing documentation, adding tests, or minor improvements first
3. **Discuss major changes** - Open an issue to discuss significant features or refactors

### Development Workflow

1. **Fork** the repository
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests** - Ensure pure function tests still pass - add separate tests if potentially necessary to `/supplemental-tests` - Maintaining team will handle merging into main testing suite if necessary
   ```bash
   bun test
   ```
5. **Build the package** - Verify it compiles
   ```bash
   bun run build
   ```
6. **Commit with clear messages**
7. **Push and create a Pull Request**

### Code Style

- **TypeScript**: All code should be properly typed
- **ESLint**: Follow existing linting rules
- **Naming**: Use descriptive variable and function names
- **Comments**: Document complex logic and public APIs - creating mini READMEs would be stellar
- **Format**: Use consistent indentation and formatting

### Types of Contributions We Welcome

#### 🐛 Bug Fixes

- Fix serialization edge cases
- Resolve TypeScript type issues
- Address browser compatibility problems

#### ✨ Features

- New serialization formats
- Additional convenience hooks
- Performance optimizations
- Better error handling

#### 🧪 Testing Improvements

- **HIGH PRIORITY**: Fix DOM test environment setup
- Add edge case coverage

#### 📚 Documentation

- API documentation improvements
- Usage examples
- Integration guides
- Performance best practices

#### 🔧 Infrastructure

- Build process improvements
- TypeScript configuration
- Package management
- CI/CD setup

### Pull Request Guidelines

1. **Clear title and description**
2. **Reference related issues** (if applicable)
3. **Include tests** for new functionality (when possible)
4. **Update documentation** if needed
5. **Keep changes focused** - one feature per PR

### Testing Contributions

Given the current testing state, we especially welcome contributions that:

#### Fix DOM Tests

- Fix the Happy-dom environment setup (or suggest something else you think is better with reasoning provided)
- Resolve `window`/`document` global exposure issues
- Improve React Testing Library integration
- Get the 41 existing DOM tests passing

## 🤝 Code of Conduct

## OPTIMISM

Optimism is hard. I hope to encourage the robust type of optimism necessary elegantly move through this world.
When I say optimism, I do not mean incessant "look on the bright side!" and "I'm so happy" types of optimism.
I mean the "yeah, that will probably be tough, and I have no idea if or how we will get there, but let's keep pushing."
When there is a suggestion made, we honestly evaluate the 1,000 roadblocks, but rather than shitting on ideas for the fear of work they will add or fear that if we actually agree to them we will fail, we recognize maintain a sense of optimism that if the feature is worth it we have a team that can push through it and will be there for one another during the process and AFTER failures.
I do not know a great way to describe the type of optimism I mean, but it is a more subtle, pragmatic, and robust type of optimism than the general sense of optimism I (@cadecrow) believe the world to have, but is the type that is deeply powerful for people that want to do great and struggle with satisfaction.

### Be Respectful

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Give and accept constructive feedback gracefully

### Be Collaborative

- Help newcomers get started
- Share knowledge and best practices
- Credit contributions appropriately

### Be Professional

- Focus on what's best for the project
- Be patient with questions and discussions
- Maintain a positive attitude

## 🔗 Resources

- **Documentation**: [README.md](README.md)
- **Demos**: [DEMO.md](DEMO.md)
- **Issues**: [GitHub Issues](https://github.com/cadecrow/use-hash-state/issues)
- **Discussions**: Use GitHub Issues for questions and proposals

## 📞 Getting Help

If you need help:

1. **Check existing documentation** and demos
2. **Search GitHub Issues** for similar questions
3. **Open a new issue** with a clear description
4. **Be patient** - this is a volunteer-maintained project

## 🙏 Recognition

All contributors will be recognized in our release notes and README. Significant contributions may be highlighted in our documentation.

Thank you for helping make `useStatefulUrl` better for the React community! 🚀
I would love to expand this to more frameworks / communities in the future. Even though I know many frameworks do not have the same "UI is a function of state" philosophy as React, I could see the motivation for this project being useful in a mutated form appropriate for the framework.
