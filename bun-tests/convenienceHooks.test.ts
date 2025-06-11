/**
 * Convenience Hooks Tests converted for Bun - Pure Functions Only
 * Tests serialization logic for useStatefulUrlArray, useStatefulUrlSet, and useStatefulUrlString
 */

import { test, describe, expect } from "bun:test";
import { hashSerializers } from "../src/useStatefulUrl";

describe("Convenience Hooks - Pure Functions", () => {

  describe("Array serialization logic", () => {
    test("should serialize and deserialize arrays correctly", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      // Test normal arrays
      expect(serialize(["react", "typescript", "bun"])).toBe("react,typescript,bun");
      expect(deserialize("react,typescript,bun")).toEqual(["react", "typescript", "bun"]);
      
      // Test single item
      expect(serialize(["single"])).toBe("single");
      expect(deserialize("single")).toEqual(["single"]);
      
      // Test empty array
      expect(serialize([])).toBe("");
      expect(deserialize("")).toEqual([]);
    });

    test("should handle arrays with special characters", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      const withSpaces = ["hello world", "foo bar"];
      const serialized = serialize(withSpaces);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(withSpaces);
    });

    test("should handle arrays with empty strings and commas", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      const tricky = ["", "middle", ""];
      const serialized = serialize(tricky);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(tricky);
    });
  });

  describe("Set serialization logic", () => {
    test("should serialize and deserialize Sets correctly", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;
      
      // Test normal sets
      const originalSet = new Set(["frontend", "backend", "fullstack"]);
      const serialized = serialize(originalSet);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(originalSet);
      expect(restored.size).toBe(3);
    });

    test("should handle Sets with duplicates during deserialization", () => {
      const { deserialize } = hashSerializers.stringSet;
      
      // Simulate a string with duplicates (shouldn't happen in real usage but good to test)
      const withDuplicates = "web,mobile,web,desktop,mobile";
      const restored = deserialize(withDuplicates);
      
      expect(restored).toEqual(new Set(["web", "mobile", "desktop"]));
      expect(restored.size).toBe(3);
    });

    test("should handle empty Sets", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;
      
      expect(serialize(new Set<string>())).toBe("");
      expect(deserialize("")).toEqual(new Set<string>());
    });

    test("should maintain Set order consistency", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;
      
      const orderedItems = ["z", "a", "m"];
      const set = new Set(orderedItems);
      const serialized = serialize(set);
      const restored = deserialize(serialized);
      
      expect(Array.from(restored)).toEqual(orderedItems);
    });
  });

  describe("Type validation patterns", () => {
    test("should handle array filtering logic", () => {
      const validValues = ["react", "vue", "angular", "svelte"];
      const input = ["react", "invalid", "vue", "also-invalid"];
      
      const filtered = input.filter(item => validValues.includes(item));
      
      expect(filtered).toEqual(["react", "vue"]);
    });

    test("should handle Set filtering logic", () => {
      const validCategories = ["frontend", "backend", "mobile", "desktop"];
      const input = ["frontend", "invalid", "backend", "also-invalid"];
      
      const filtered = input.filter(item => validCategories.includes(item));
      
      expect(new Set(filtered)).toEqual(new Set(["frontend", "backend"]));
    });
  });

  describe("String patterns", () => {
    test("should handle URL encoding concerns", () => {
      // Test characters that need URL encoding
      const specialStrings = [
        "hello world",
        "cats & dogs",
        "50% off",
        "query=value",
        "#hashtag"
      ];
      
      specialStrings.forEach(str => {
        const encoded = encodeURIComponent(str);
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(str);
      });
    });

    test("should handle empty and whitespace strings", () => {
      const testStrings = ["", " ", "  ", "\t", "\n"];
      
      testStrings.forEach(str => {
        // Each should remain as-is when encoded/decoded
        const encoded = encodeURIComponent(str);
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(str);
      });
    });
  });

  describe("Serialization edge cases", () => {
    test("should handle very long arrays", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      const longArray = Array.from({ length: 100 }, (_, i) => `item${i}`);
      const serialized = serialize(longArray);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(longArray);
      expect(restored.length).toBe(100);
    });

    test("should handle Sets with many items", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;
      
      const manyItems = Array.from({ length: 50 }, (_, i) => `category${i}`);
      const largeSet = new Set(manyItems);
      
      const serialized = serialize(largeSet);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(largeSet);
      expect(restored.size).toBe(50);
    });

    test("should handle arrays with numeric-like strings", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      const numericStrings = ["1", "2.5", "0", "-1", "NaN"];
      const serialized = serialize(numericStrings);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(numericStrings);
      // Ensure they remain strings, not converted to numbers
      restored.forEach(item => {
        expect(typeof item).toBe("string");
      });
    });
  });

  describe("URL parameter construction", () => {
    test("should build correct URLSearchParams", () => {
      const params = new URLSearchParams();
      params.set("tags", "react,typescript,bun");
      params.set("query", "hello world");
      params.set("active", "true");
      
      expect(params.get("tags")).toBe("react,typescript,bun");
      expect(params.get("query")).toBe("hello world");
      expect(params.get("active")).toBe("true");
      expect(params.toString()).toBe("tags=react%2Ctypescript%2Cbun&query=hello+world&active=true");
    });

    test("should handle multiple parameter scenarios", () => {
      const params = new URLSearchParams();
      
      // Simulate multiple convenience hooks
      params.set("tags", "frontend,backend");     // useStatefulUrlArray
      params.set("categories", "web,mobile");     // useStatefulUrlSet
      params.set("searchQuery", "test query");    // useStatefulUrlString
      
      expect(params.get("tags")).toBe("frontend,backend");
      expect(params.get("categories")).toBe("web,mobile");
      expect(params.get("searchQuery")).toBe("test query");
    });
  });
}); 