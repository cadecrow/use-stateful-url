/**
 * useStatefulUrl Hook Tests - DOM-dependent functionality
 * Tests the actual React hook behavior with window and location
 */

import { test, describe, expect, beforeEach } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { useStatefulUrl, hashUtils } from "../useStatefulUrl";

describe("useStatefulUrl Hook - DOM Integration", () => {
  beforeEach(() => {
    // Reset hash before each test - setup.ts should handle DOM globals
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  });

  test("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0, name: "test" })
    );

    expect(result.current.state).toEqual({ count: 0, name: "test" });
    expect(result.current.isInitialized).toBe(true);
  });

  test("should update state and URL hash", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0, name: "test" })
    );

    act(() => {
      result.current.setState({ count: 5, name: "updated" });
    });

    expect(result.current.state).toEqual({ count: 5, name: "updated" });

    // Wait for debounced URL update
    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("count=5");
    expect(hash).toContain("name=updated");
  });

  test("should initialize from URL hash", () => {
    window.location.hash = "#__UHS-count=10&name=fromhash-UHS__";

    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0, name: "test" })
    );

    expect(result.current.state).toEqual({ count: 10, name: "fromhash" });
  });

  test("should handle array values", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ tags: ["react", "typescript"] })
    );

    act(() => {
      result.current.setState({ tags: ["vue", "javascript", "bun"] });
    });

    expect(result.current.state.tags).toEqual(["vue", "javascript", "bun"]);

    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("tags=vue%2Cjavascript%2Cbun");
  });

  test("should handle Set values", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ categories: new Set(["frontend", "backend"]) })
    );

    act(() => {
      result.current.setState({ 
        categories: new Set(["fullstack", "devops"]) 
      });
    });

    expect(result.current.state.categories).toEqual(
      new Set(["fullstack", "devops"])
    );

    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("categories=fullstack%2Cdevops");
  });

  test("should handle boolean values", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ isActive: false, isVisible: true })
    );

    act(() => {
      result.current.setState({ isActive: true, isVisible: false });
    });

    expect(result.current.state).toEqual({ isActive: true, isVisible: false });

    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("isActive=true");
    expect(hash).toContain("isVisible=false");
  });

  test("should handle custom serializers", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl(
        { items: ["a", "b", "c"] },
        {
          serializers: {
            serialize: (state) => ({
              items: state.items.join("|"),
            }),
            deserialize: (params) => ({
              items: params.get("items")?.split("|") || [],
            }),
          },
        }
      )
    );

    act(() => {
      result.current.setState({ items: ["x", "y", "z"] });
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("items=x%7Cy%7Cz");
  });

  test("should handle function-based state updates", () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0 })
    );

    act(() => {
      result.current.setState(prev => ({ count: prev.count + 1 }));
    });

    expect(result.current.state.count).toBe(1);

    act(() => {
      result.current.setState(prev => ({ count: prev.count * 2 }));
    });

    expect(result.current.state.count).toBe(2);
  });

  test("should sync to URL manually", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ test: "value" })
    );

    act(() => {
      result.current.setState({ test: "manual" });
    });

    // Call syncToUrl immediately without waiting for debounce
    act(() => {
      result.current.syncToUrl();
    });

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("test=manual");
  });

  test("should clear hash and reset state", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0, name: "test" })
    );

    act(() => {
      result.current.setState({ count: 5, name: "updated" });
    });

    await new Promise(resolve => setTimeout(resolve, 150));

    act(() => {
      result.current.clearHash();
    });

    expect(result.current.state).toEqual({ count: 0, name: "test" });
    expect(window.location.hash).toBe("");
  });

  test("should handle debouncing", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0 }, { debounceMs: 200 })
    );

    // Make multiple rapid updates
    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.setState({ count: 3 });
    });

    // Hash should not be updated immediately
    expect(window.location.hash).toBe("");

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 250));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("count=3");
  });

  test("should handle hash changes from external sources", () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 0 })
    );

    // Simulate external hash change
    act(() => {
      window.location.hash = "#__UHS-count=42-UHS__";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(result.current.state.count).toBe(42);
  });

  test("should work with position strategy 'end'", async () => {
    window.location.hash = "#existing=value";

    const { result } = renderHook(() =>
      useStatefulUrl(
        { count: 5 },
        { positionStrategy: "end" }
      )
    );

    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("existing=value");
    expect(hash).toContain("__UHS-count=5-UHS__");
    expect(hash.indexOf("existing")).toBeLessThan(hash.indexOf("__UHS-"));
  });

  test("should work with custom delimiters", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl(
        { count: 10 },
        { 
          delimiters: { 
            start: "<<<START>>>", 
            end: "<<<END>>>" 
          } 
        }
      )
    );

    await new Promise(resolve => setTimeout(resolve, 150));

    const hash = window.location.hash.substring(1);
    expect(hash).toContain("<<<START>>>count=10<<<END>>>");
  });

  test("should get hash without state", async () => {
    window.location.hash = "#external=value";

    const { result } = renderHook(() =>
      useStatefulUrl({ count: 5 })
    );

    await new Promise(resolve => setTimeout(resolve, 150));

    const externalHash = result.current.getHashWithoutState();
    expect(externalHash).toBe("external=value");
  });

  test("should get state from hash", async () => {
    const { result } = renderHook(() =>
      useStatefulUrl({ count: 5 })
    );

    await new Promise(resolve => setTimeout(resolve, 150));

    const stateHash = result.current.getStateFromHash();
    expect(stateHash).toBe("count=5");
  });
}); 