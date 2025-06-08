/**
 * Convenience Hooks DOM Tests - Tests actual hook behavior with DOM
 */

import { test, describe, expect, beforeEach } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { 
  useStatefulUrlArray, 
  useStatefulUrlSet, 
  useStatefulUrlString 
} from "../useStatefulUrl";

describe("Convenience Hooks - DOM Integration", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  });

  describe("useStatefulUrlArray", () => {
    test("should initialize with default array", () => {
      const { result } = renderHook(() =>
        useStatefulUrlArray<string>("tags", ["react", "typescript"])
      );

      expect(result.current.value).toEqual(["react", "typescript"]);
      expect(result.current.isInitialized).toBe(true);
    });

    test("should update array and URL", async () => {
      const { result } = renderHook(() =>
        useStatefulUrlArray<string>("tags", ["react"])
      );

      act(() => {
        result.current.setValue(["vue", "javascript", "bun"]);
      });

      expect(result.current.value).toEqual(["vue", "javascript", "bun"]);

      await new Promise(resolve => setTimeout(resolve, 150));

      const hash = window.location.hash.substring(1);
      expect(hash).toContain("tags=vue%2Cjavascript%2Cbun");
    });

    test("should initialize from URL hash", () => {
      window.location.hash = "#__UHS-tags=vue%2Cjavascript%2Cbun-UHS__";

      const { result } = renderHook(() =>
        useStatefulUrlArray<string>("tags", ["react"])
      );

      expect(result.current.value).toEqual(["vue", "javascript", "bun"]);
    });

    test("should handle function updates", () => {
      const { result } = renderHook(() =>
        useStatefulUrlArray<string>("tags", ["react"])
      );

      act(() => {
        result.current.setValue(prev => [...prev, "typescript"]);
      });

      expect(result.current.value).toEqual(["react", "typescript"]);
    });
  });

  describe("useStatefulUrlSet", () => {
    test("should initialize with default Set", () => {
      const { result } = renderHook(() =>
        useStatefulUrlSet<string>("categories", new Set(["frontend", "backend"]))
      );

      expect(result.current.value).toEqual(new Set(["frontend", "backend"]));
      expect(result.current.isInitialized).toBe(true);
    });

    test("should update Set and URL", async () => {
      const { result } = renderHook(() =>
        useStatefulUrlSet<string>("categories", new Set(["frontend"]))
      );

      act(() => {
        result.current.setValue(new Set(["backend", "devops", "fullstack"]));
      });

      expect(result.current.value).toEqual(new Set(["backend", "devops", "fullstack"]));

      await new Promise(resolve => setTimeout(resolve, 150));

      const hash = window.location.hash.substring(1);
      expect(hash).toContain("categories=backend%2Cdevops%2Cfullstack");
    });

    test("should initialize from URL hash", () => {
      window.location.hash = "#__UHS-categories=backend%2Cdevops%2Cfullstack-UHS__";

      const { result } = renderHook(() =>
        useStatefulUrlSet<string>("categories", new Set(["frontend"]))
      );

      expect(result.current.value).toEqual(new Set(["backend", "devops", "fullstack"]));
    });

    test("should handle function updates", () => {
      const { result } = renderHook(() =>
        useStatefulUrlSet<string>("categories", new Set(["web"]))
      );

      act(() => {
        result.current.setValue(prev => new Set([...prev, "mobile"]));
      });

      expect(result.current.value).toEqual(new Set(["web", "mobile"]));
    });
  });

  describe("useStatefulUrlString", () => {
    test("should initialize with default string", () => {
      const { result } = renderHook(() =>
        useStatefulUrlString("query", "default search")
      );

      expect(result.current.value).toBe("default search");
      expect(result.current.isInitialized).toBe(true);
    });

    test("should update string and URL", async () => {
      const { result } = renderHook(() =>
        useStatefulUrlString("query", "initial")
      );

      act(() => {
        result.current.setValue("updated search query");
      });

      expect(result.current.value).toBe("updated search query");

      await new Promise(resolve => setTimeout(resolve, 150));

      const hash = window.location.hash.substring(1);
      expect(hash).toContain("query=updated+search+query");
    });

    test("should initialize from URL hash", () => {
      window.location.hash = "#__UHS-query=search+from+url-UHS__";

      const { result } = renderHook(() =>
        useStatefulUrlString("query", "default")
      );

      expect(result.current.value).toBe("search from url");
    });

    test("should handle special characters", async () => {
      const { result } = renderHook(() =>
        useStatefulUrlString("query", "")
      );

      act(() => {
        result.current.setValue("cats & dogs + birds");
      });

      expect(result.current.value).toBe("cats & dogs + birds");

      await new Promise(resolve => setTimeout(resolve, 150));

      const hash = window.location.hash.substring(1);
      expect(hash).toContain("query=cats+%26+dogs+%2B+birds");
    });

    test("should handle function updates", () => {
      const { result } = renderHook(() =>
        useStatefulUrlString("query", "initial")
      );

      act(() => {
        result.current.setValue(prev => prev + " updated");
      });

      expect(result.current.value).toBe("initial updated");
    });
  });

  describe("Integration tests", () => {
    test("should clear values correctly", async () => {
      const { result } = renderHook(() =>
        useStatefulUrlString("query", "test")
      );

      act(() => {
        result.current.setValue("search query");
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      act(() => {
        result.current.clearHash();
      });

      expect(result.current.value).toBe("test");
      expect(window.location.hash).toBe("");
    });
  });
}); 