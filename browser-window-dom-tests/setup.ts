/**
 * Setup file for DOM-dependent tests
 * Sets up DOM environment using happy-dom for useStatefulUrl hook testing
 */

import { beforeAll, beforeEach, afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";
import { Window } from "happy-dom";

// Set up DOM environment
beforeAll(() => {
  // Create a new Window instance from happy-dom
  const happyWindow = new Window({
    url: 'http://localhost:3000',
    settings: {
      navigator: {
        userAgent: 'Mozilla/5.0 (Node.js) useStatefulUrl Test Environment'
      }
    }
  });
  
  // Set up global DOM objects with any to avoid type conflicts
  (global as any).window = happyWindow;
  (global as any).document = happyWindow.document;
  (global as any).navigator = happyWindow.navigator;
  (global as any).location = happyWindow.location;
  (global as any).history = happyWindow.history;
  (global as any).HTMLElement = happyWindow.HTMLElement;
  (global as any).Element = happyWindow.Element;
  (global as any).Node = happyWindow.Node;
  (global as any).Event = happyWindow.Event;
  (global as any).CustomEvent = happyWindow.CustomEvent;
  (global as any).HashChangeEvent = happyWindow.HashChangeEvent;
  (global as any).URLSearchParams = happyWindow.URLSearchParams;
  
  // Set initial hash to empty
  happyWindow.location.hash = "";
});

// Reset before each test
beforeEach(() => {
  if (typeof (global as any).window !== "undefined" && (global as any).window.location) {
    (global as any).window.location.hash = "";
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
  if (typeof (global as any).window !== "undefined" && (global as any).window.location) {
    (global as any).window.location.hash = "";
  }
}); 