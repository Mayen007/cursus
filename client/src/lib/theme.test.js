import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getThemePreference, initializeTheme, saveThemePreference } from "./theme.js";

let storedValues;
let themeClass;
let colorScheme;

beforeEach(() => {
  storedValues = new Map();
  themeClass = false;
  colorScheme = "light";

  globalThis.localStorage = {
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, value),
  };
  globalThis.document = {
    documentElement: {
      classList: {
        toggle: (className, isEnabled) => {
          if (className === "dark-theme") themeClass = isEnabled;
        },
      },
      style: {
        set colorScheme(value) {
          colorScheme = value;
        },
      },
    },
  };
});

afterEach(() => {
  delete globalThis.localStorage;
  delete globalThis.document;
});

test("defaults to light and applies the saved preference on startup", () => {
  assert.equal(getThemePreference(), "light");
  storedValues.set("appearance", "dark");

  initializeTheme();

  assert.equal(themeClass, false);
  assert.equal(colorScheme, "light");

  storedValues.set("appearancePreference", "dark");
  initializeTheme();

  assert.equal(themeClass, true);
  assert.equal(colorScheme, "dark");
});

test("saves and applies a selected theme", () => {
  saveThemePreference("dark");

  assert.equal(getThemePreference(), "dark");
  assert.equal(storedValues.get("appearancePreference"), "dark");
  assert.equal(themeClass, true);
  assert.equal(colorScheme, "dark");

  saveThemePreference("light");

  assert.equal(getThemePreference(), "light");
  assert.equal(themeClass, false);
  assert.equal(colorScheme, "light");
});
