/**
 * Hash Utils DOM Tests - Tests utility functions with actual DOM
 */

import { test, describe, expect, beforeEach } from "bun:test";
import { hashUtils } from "../useStatefulUrl";

describe("Hash Utils - DOM Integration", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  });

  test("should get hash without state when no useStatefulUrl content", () => {
    window.location.hash = "#external=value&other=param";
    
    const result = hashUtils.getHashWithoutState();
    expect(result).toBe("external=value&other=param");
  });

  test("should get hash without state when useStatefulUrl content present", () => {
    window.location.hash = "#external=value&__UHS-count=5-UHS__&other=param";
    
    const result = hashUtils.getHashWithoutState();
    expect(result).toBe("external=value&other=param");
  });

  test("should get state from hash when present", () => {
    window.location.hash = "#external=value&__UHS-count=5&name=test-UHS__&other=param";
    
    const result = hashUtils.getStateFromHash();
    expect(result).toBe("count=5&name=test");
  });

  test("should get empty string when no state in hash", () => {
    window.location.hash = "#external=value&other=param";
    
    const result = hashUtils.getStateFromHash();
    expect(result).toBe("");
  });

  test("should detect hash state presence", () => {
    window.location.hash = "#external=value";
    expect(hashUtils.hasHashState()).toBe(false);

    window.location.hash = "#__UHS-count=5-UHS__";
    expect(hashUtils.hasHashState()).toBe(true);

    window.location.hash = "#external=value&__UHS-count=5-UHS__";
    expect(hashUtils.hasHashState()).toBe(true);
  });

  test("should work with custom delimiters", () => {
    const customDelimiters = { start: "<<<", end: ">>>" };
    
    window.location.hash = "#external=value&<<<count=5&name=test>>>&other=param";
    
    const withoutState = hashUtils.getHashWithoutState(customDelimiters);
    expect(withoutState).toBe("external=value&other=param");
    
    const stateOnly = hashUtils.getStateFromHash(customDelimiters);
    expect(stateOnly).toBe("count=5&name=test");
    
    const hasState = hashUtils.hasHashState(customDelimiters);
    expect(hasState).toBe(true);
  });

  test("should update external hash safely", () => {
    window.location.hash = "#__UHS-count=5-UHS__";
    
    hashUtils.updateExternalHash("newexternal=value");
    
    const fullHash = window.location.hash.substring(1);
    expect(fullHash).toBe("newexternal=value__UHS-count=5-UHS__");
  });

  test("should handle empty external hash update", () => {
    window.location.hash = "#__UHS-count=5-UHS__";
    
    hashUtils.updateExternalHash("");
    
    const fullHash = window.location.hash.substring(1);
    expect(fullHash).toBe("__UHS-count=5-UHS__");
  });

  test("should trigger hashchange event on external update", (done) => {
    window.location.hash = "#__UHS-count=5-UHS__";
    
    const handleHashChange = () => {
      window.removeEventListener("hashchange", handleHashChange);
      done();
    };
    
    window.addEventListener("hashchange", handleHashChange);
    
    hashUtils.updateExternalHash("external=updated", undefined, false);
  });

  test("should handle malformed hash content gracefully", () => {
    // Hash with start delimiter but no end
    window.location.hash = "#external=value&__UHS-count=5";
    
    const withoutState = hashUtils.getHashWithoutState();
    expect(withoutState).toBe("external=value&__UHS-count=5");
    
    const stateOnly = hashUtils.getStateFromHash();
    expect(stateOnly).toBe("");
    
    const hasState = hashUtils.hasHashState();
    expect(hasState).toBe(false);
  });

  test("should handle edge case with multiple delimiters", () => {
    // Multiple occurrences of delimiters - should use first valid pair
    window.location.hash = "#__UHS-first=1-UHS__middle__UHS-second=2-UHS__";
    
    const stateOnly = hashUtils.getStateFromHash();
    expect(stateOnly).toBe("first=1");
    
    const withoutState = hashUtils.getHashWithoutState();
    expect(withoutState).toBe("middle__UHS-second=2-UHS__");
  });
}); 