/**
 * URL Encoding Edge Cases Tests - Pure Functions Only
 */

import { test, describe, expect } from "bun:test";
import { hashSerializers } from "../useStatefulUrl";

describe("URL Encoding Edge Cases - Pure Functions", () => {
  
  describe("URLSearchParams encoding behavior", () => {
    test("should handle ampersand (&) characters correctly", () => {
      const params = new URLSearchParams();
      params.set("text", "cats & dogs & birds");
      
      expect(params.get("text")).toBe("cats & dogs & birds");
      expect(params.toString()).toBe("text=cats+%26+dogs+%26+birds");
    });

    test("should handle equals (=) characters in values", () => {
      const params = new URLSearchParams();
      params.set("formula", "x = y + z");
      
      expect(params.get("formula")).toBe("x = y + z");
      expect(params.toString()).toBe("formula=x+%3D+y+%2B+z");
    });

    test("should handle hash (#) characters in values", () => {
      const params = new URLSearchParams();
      params.set("tags", "#react #javascript #bun");
      
      expect(params.get("tags")).toBe("#react #javascript #bun");
      expect(params.toString()).toBe("tags=%23react+%23javascript+%23bun");
    });

    test("should handle plus (+) characters in values", () => {
      const params = new URLSearchParams();
      params.set("math", "2 + 2 = 4");
      
      expect(params.get("math")).toBe("2 + 2 = 4");
      expect(params.toString()).toBe("math=2+%2B+2+%3D+4");
    });

    test("should handle spaces and special encoding", () => {
      const params = new URLSearchParams();
      params.set("query", "hello world");
      params.set("special", "50% off");
      
      expect(params.get("query")).toBe("hello world");
      expect(params.get("special")).toBe("50% off");
      expect(params.toString()).toBe("query=hello+world&special=50%25+off");
    });
  });

  describe("Array serialization with problematic characters", () => {
    test("should handle commas in array-like strings safely", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      // Arrays with items that contain commas would be problematic
      // but our serializer treats commas as separators
      const simpleArray = ["item1", "item2", "item3"];
      const serialized = serialize(simpleArray);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(simpleArray);
      expect(serialized).toBe("item1,item2,item3");
    });

    test("should handle arrays with special characters", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      const specialArray = ["hello world", "50% off", "cats & dogs"];
      const serialized = serialize(specialArray);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(specialArray);
    });
  });

  describe("Set serialization with special characters", () => {
    test("should handle Sets with encoded characters", () => {
      const { serialize, deserialize } = hashSerializers.stringSet;
      
      const specialSet = new Set(["#tag1", "#tag2", "@user"]);
      const serialized = serialize(specialSet);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(specialSet);
      expect(restored.size).toBe(3);
    });
  });

  describe("JSON serialization with problematic characters", () => {
    test("should handle objects with special characters", () => {
      const { serialize, deserialize } = hashSerializers.json;
      
      const complex = {
        title: "Hello & Welcome!",
        formula: "x = y + z",
        tags: ["#react", "#javascript"],
        url: "https://example.com?param=value&other=test"
      };
      
      const serialized = serialize(complex);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(complex);
    });

         test("should handle arrays with mixed content", () => {
       const { serialize, deserialize } = hashSerializers.json;
       
       const mixed = {
         items: [
           "string with spaces",
           "string & with & ampersands", 
           "string=with=equals",
           "#hashtag",
           "50% discount"
         ]
       };
       
       const serialized = serialize(mixed);
       const restored = deserialize(serialized);
       
       expect(restored).toEqual(mixed);
     });
  });

  describe("Unicode and international characters", () => {
    test("should handle Unicode characters", () => {
      const params = new URLSearchParams();
      params.set("unicode", "café naïve résumé");
      params.set("emoji", "🚀 🎉 ✨");
      params.set("chinese", "你好世界");
      
      expect(params.get("unicode")).toBe("café naïve résumé");
      expect(params.get("emoji")).toBe("🚀 🎉 ✨");
      expect(params.get("chinese")).toBe("你好世界");
    });

    test("should handle Unicode in arrays", () => {
      const { serialize, deserialize } = hashSerializers.stringArray;
      
      const unicodeArray = ["café", "naïve", "résumé", "🚀", "你好"];
      const serialized = serialize(unicodeArray);
      const restored = deserialize(serialized);
      
      expect(restored).toEqual(unicodeArray);
    });
  });

  describe("Edge cases and malformed data", () => {
    test("should handle empty and null-like values correctly", () => {
      const params = new URLSearchParams();
      params.set("empty", "");
      params.set("space", " ");
      params.set("null", "null");
      params.set("undefined", "undefined");
      
      expect(params.get("empty")).toBe("");
      expect(params.get("space")).toBe(" ");
      expect(params.get("null")).toBe("null");
      expect(params.get("undefined")).toBe("undefined");
    });

         test("should handle malformed JSON gracefully", () => {
       const { deserialize } = hashSerializers.json;
       
       expect(deserialize("")).toBe(null);
       expect(deserialize("{invalid")).toBe(null);
       expect(deserialize("not json at all")).toBe(null);
       expect(deserialize('{"valid": "json"}')).toEqual({"valid": "json"}); // Valid JSON object
       expect(deserialize('{"number": 123}')).toEqual({"number": 123}); // Valid JSON object with number
     });

    test("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const params = new URLSearchParams();
      params.set("long", longString);
      
      expect(params.get("long")).toBe(longString);
      expect(params.get("long")?.length).toBe(1000);
    });
  });

  describe("URL encoding/decoding round trips", () => {
    test("should preserve data through encoding/decoding cycles", () => {
      const testData = [
        "hello world",
        "cats & dogs",
        "50% off + free shipping",
        "query=value&other=test",
        "#hashtag @mention",
        "café naïve résumé 🚀",
        ""
      ];
      
      testData.forEach(original => {
        const encoded = encodeURIComponent(original);
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(original);
      });
    });

    test("should handle URLSearchParams round trips", () => {
      const testPairs = [
        ["simple", "value"],
        ["spaces", "hello world"],
        ["special", "cats & dogs + birds"],
        ["unicode", "café 🚀 你好"],
        ["formula", "x = y + z"],
        ["empty", ""],
        ["percent", "50% off"]
      ];
      
      const params = new URLSearchParams();
      testPairs.forEach(([key, value]) => {
        params.set(key, value);
      });
      
      const serialized = params.toString();
      const restored = new URLSearchParams(serialized);
      
      testPairs.forEach(([key, value]) => {
        expect(restored.get(key)).toBe(value);
      });
    });
  });
}); 