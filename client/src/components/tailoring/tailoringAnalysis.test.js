import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeResumeMatch,
  EXAMPLE_JOB_DESCRIPTION,
  EXAMPLE_RESUME_TEXT,
} from "./tailoringAnalysis.js";

test("scores required and preferred keywords with their configured weights", () => {
  const result = analyzeResumeMatch(EXAMPLE_RESUME_TEXT, EXAMPLE_JOB_DESCRIPTION);

  assert.equal(result.score, 70);
  assert.deepEqual(
    result.missingKeywords.map(({ label }) => label),
    ["TypeScript", "Node.js", "Unit testing"]
  );
  assert.ok(result.keywords.slice(3).every(({ type }) => type === "preferred"));
  assert.equal(result.missingKeywords[0].lineNumber, 6);
});

test("normalizes keyword aliases and preferred section headings", () => {
  const result = analyzeResumeMatch(
    "JavaScript and Node.js",
    "NICE TO HAVE:\n- JS and Node\nREQUIRED:\n- React"
  );

  assert.deepEqual(
    result.keywords.map(({ label, type }) => [label, type]),
    [
      ["JavaScript", "preferred"],
      ["Node.js", "preferred"],
      ["React", "required"],
    ]
  );
  assert.deepEqual(
    result.matchedKeywords.map(({ label }) => label),
    ["JavaScript", "Node.js"]
  );
});

test("does not mistake the .js suffix in Node.js for the JavaScript keyword", () => {
  const result = analyzeResumeMatch(
    "Node.js experience",
    "REQUIRED\nNode.js\nPREFERRED\nJavaScript"
  );

  assert.deepEqual(
    result.matchedKeywords.map(({ label }) => label),
    ["Node.js"]
  );
  assert.deepEqual(
    result.missingKeywords.map(({ label }) => label),
    ["JavaScript"]
  );
});

test("returns 100 and zero for complete and empty matches", () => {
  const complete = analyzeResumeMatch(
    "JavaScript React TypeScript Node REST API Git a11y unit tests",
    EXAMPLE_JOB_DESCRIPTION
  );
  const empty = analyzeResumeMatch("HTML CSS", EXAMPLE_JOB_DESCRIPTION);

  assert.equal(complete.score, 100);
  assert.equal(empty.score, 0);
});

test("returns a null score when the job description has no supported keywords", () => {
  const result = analyzeResumeMatch("React", "No supported terms here");

  assert.equal(result.score, null);
  assert.deepEqual(result.keywords, []);
});
