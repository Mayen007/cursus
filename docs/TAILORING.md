# Tailoring specification

The match score is deterministic code, not an AI output. Required keywords have weight 2;
preferred keywords have weight 1.

```text
score = round(100 * matched keyword weight / total keyword weight)
```

Score bands are Gap (0–49), Score (50–74), and Match (75–100). Matching first normalizes
keywords using aliases such as `JS` → `JavaScript` and `Node` → `Node.js`.

The server removes name, email, phone, and address from CV text before any AI call. The AI
service may extract job-description keywords and suggest rewrites. It cannot assign a score
or introduce unverified skills, work, dates, or qualifications. Users confirm suggestions
before they become part of a tailored CV. Without an AI service, keyword matching and scoring
continue with the built-in skills list.

Each recommendation identifies its keyword, reason, and the source line in the job description.
