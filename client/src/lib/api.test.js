import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { apiRequest } from "./api.js";

afterEach(() => {
  delete globalThis.fetch;
  delete globalThis.sessionStorage;
});

test("includes server validation details in request errors", async () => {
  globalThis.sessionStorage = { getItem: () => null };
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: "Please check the submitted details.",
        details: ["fileName must be 255 characters or fewer."],
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

  await assert.rejects(
    apiRequest("/resumes/base"),
    /Please check the submitted details\. fileName must be 255 characters or fewer\./
  );
});
