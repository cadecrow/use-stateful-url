/**
 * Core useStatefulUrl tests converted for Bun - Pure Functions Only
 */

import { test, describe, expect } from "bun:test";
import { hashSerializers } from "../src/useStatefulUrl";

describe("useStatefulUrl - Pure Functions", () => {
  
  describe("hashSerializers", () => {
    test("stringArray serializer", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;

      expect(serialize(["a", "b", "c"])).toBe("a,b,c");
      expect(deserialize("a,b,c")).toEqual(["a", "b", "c"]);
      expect(deserialize("")).toEqual([]);
    });

    test("stringSet serializer", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;

      expect(serialize(new Set(["a", "b", "c"]))).toBe("a,b,c");
      expect(deserialize("a,b,c")).toEqual(new Set(["a", "b", "c"]));
      expect(deserialize("")).toEqual(new Set<string>());
    });

    test("boolean serializer", () => {
      const { serialize, deserialize } = hashSerializers.boolean;

      expect(serialize(true)).toBe("true");
      expect(serialize(false)).toBe("false");
      expect(deserialize("true")).toBe(true);
      expect(deserialize("false")).toBe(false);
    });

    test("number serializer", () => {
      const { serialize, deserialize } = hashSerializers.number;

      expect(serialize(42)).toBe("42");
      expect(serialize(3.14)).toBe("3.14");
      expect(deserialize("42")).toBe(42);
      expect(deserialize("3.14")).toBe(3.14);
      expect(deserialize("invalid")).toBe(0);
    });

    test("json serializer", () => {
      const { serialize, deserialize } = hashSerializers.json;
      const obj = { name: "test", value: 42 };

      expect(serialize(obj)).toBe(JSON.stringify(obj));
      expect(deserialize(JSON.stringify(obj))).toEqual(obj);
      expect(deserialize("invalid")).toBe(null);
    });
  });

  describe("URL parameter parsing", () => {
    test("should handle URLSearchParams correctly", () => {
      const params = new URLSearchParams("count=5&name=test&tags=a%2Cb%2Cc");
      
      expect(params.get("count")).toBe("5");
      expect(params.get("name")).toBe("test");
      expect(params.get("tags")).toBe("a,b,c");
    });

    test("should handle encoded values", () => {
      const params = new URLSearchParams("query=hello+world&special=cats+%26+dogs");
      
      expect(params.get("query")).toBe("hello world");
      expect(params.get("special")).toBe("cats & dogs");
    });

    test("should handle empty and missing values", () => {
      const params = new URLSearchParams("empty=&missing");
      
      expect(params.get("empty")).toBe("");
      expect(params.get("missing")).toBe("");
      expect(params.get("nonexistent")).toBe(null);
    });
  });

  describe("JSON serialization edge cases", () => {
    test("should handle complex objects", () => {
      const complex = {
        user: { name: "John", age: 30 },
        preferences: { theme: "dark", notifications: true },
        tags: ["react", "typescript"]
      };

      const serialized = JSON.stringify(complex);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized).toEqual(complex);
    });

    test("should handle arrays with mixed types", () => {
      const mixed = ["string", 42, true, null];
      const serialized = JSON.stringify(mixed);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized).toEqual(mixed);
    });

    test("should handle special characters in strings", () => {
      const special = { message: "Hello & goodbye! 50% off + free shipping" };
      const serialized = JSON.stringify(special);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized).toEqual(special);
    });
  });

  describe("Set operations", () => {
    test("should maintain uniqueness in Sets", () => {
      const set = new Set(["a", "b", "a", "c", "b"]);
      
      expect(set.size).toBe(3);
      expect(Array.from(set)).toEqual(["a", "b", "c"]);
    });

    test("should handle Set serialization with duplicates", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;
      const original = new Set(["x", "y", "x", "z", "y"]);
      
      const serialized = serialize(original);
      const restored = deserialize(serialized);
      
      expect(restored.size).toBe(3);
      expect(restored).toEqual(new Set(["x", "y", "z"]));
    });
  });

  describe("Array operations", () => {
    test("should handle empty arrays", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      expect(serialize([])).toBe("");
      expect(deserialize("")).toEqual([]);
    });

    test("should handle arrays with empty strings", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      const arrayWithEmpties = ["a", "", "b", "", "c"];
      
      const serialized = serialize(arrayWithEmpties);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(arrayWithEmpties);
    });

    test("should handle single item arrays", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      expect(serialize(["single"])).toBe("single");
      expect(deserialize("single")).toEqual(["single"]);
    });
  });

  describe("Type coercion", () => {
    test("number serializer should handle edge cases", () => {
      const { deserialize } = hashSerializers.number;
      
      expect(deserialize("0")).toBe(0);
      expect(deserialize("-42")).toBe(-42);
      expect(deserialize("3.14159")).toBe(3.14159);
      expect(deserialize("")).toBe(0);
      expect(deserialize("NaN")).toBe(0);
      expect(deserialize("infinity")).toBe(0);
    });

    test("boolean serializer should handle string variations", () => {
      const { deserialize } = hashSerializers.boolean;
      
      expect(deserialize("true")).toBe(true);
      expect(deserialize("false")).toBe(false);
      expect(deserialize("TRUE")).toBe(false); // case sensitive
      expect(deserialize("1")).toBe(false); // not "true"
      expect(deserialize("")).toBe(false);
    });
  });
}); 