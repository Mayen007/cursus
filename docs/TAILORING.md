# Tailoring: current behavior and target

## Current implementation

Tailoring is deterministic and does not call an AI service. The server requires an application
owned by the signed-in user and a saved base CV. It analyzes the application's saved job
description, or a non-empty replacement supplied with the request.

The server recognizes a fixed catalog of eight skills: JavaScript, React, TypeScript, Node.js,
REST APIs, Git, Accessibility, and Unit testing. It recognizes the aliases defined in
`server/src/services/tailoringService.js` (for example, `JS` for JavaScript and `Node` for
Node.js). A line marked `preferred`, `nice-to-have`, or `bonus` is preferred; other recognized
keywords are required. A standalone `required` heading switches subsequent lines back to required.
Only the first occurrence of each catalog keyword is included in an analysis.

Required keywords have weight 2 and preferred keywords weight 1:

```text
score = round(100 * matched keyword weight / total keyword weight)
```

The response contains the score, all recognized keywords, matched and missing keywords, and
the job-description source line and line number for each. If no catalog keyword is found, the
score and recommendation ID are `null`; no analysis record is created. Otherwise, the server
stores a recommendation/analysis record containing the score, missing keywords, and explanatory
text.

The client displays the results and lets the user save the analysis. Saving creates a CV record
containing the unchanged base-CV text, linked to the analysis's application and source CV. It is
an analysis snapshot, not a rewritten or genuinely tailored CV. The resume library and dashboard
label it as an unchanged snapshot. There are no generated rewrites or user-confirmed edits.

The server stores extracted CV text, not the uploaded file. It makes no third-party AI calls, so
no CV text or personal details are currently sent to an AI provider. The PDF/DOCX upload limits
and extraction behavior are documented in [API.md](./API.md).

## Target behavior not implemented

The product requirements describe a future rewrite flow. It must not add skills or experience
that the user cannot substantiate, should let the user review and confirm suggestions, and should
remove personal details before any external AI request. These are not current system guarantees:
AI integration, personal-data redaction, rewrite generation, and per-suggestion confirmation have
not been implemented. Track delivery status in [ROADMAP.md](./ROADMAP.md).
