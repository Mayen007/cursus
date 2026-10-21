# Product Requirements Document: devtrack

Developer Job Tracker and Intelligent CV Tailoring System

Author: Mayen Akech (BIT/2024/44537). Version 0.1 (draft). Date: 10 October 2026.

## 1. Overview

### 1.1 Purpose

This document says what devtrack must do, for whom, and how we know it works. The build and the implementation documentation use it. It does not change the submitted proposal.

### 1.2 Problem

Student and junior developers in Kenya apply to many jobs on many platforms. They miss deadlines and lose the status of applications. They send one generic CV to all employers, and Applicant Tracking Systems (ATS) filter generic CVs. Existing tools keep tracking and CV work apart, put key features behind a subscription, and serve foreign markets.

### 1.3 Product summary

devtrack is a web application. It joins a job application tracker and a CV tailoring tool. The user compares a CV with a job description. The system shows a match score, the missing keywords, and recommendations. The user saves a tailored CV that is linked to the application.

### 1.4 Working title

"devtrack" is a working title. The name is set in two config files only (`client/src/config/app.js` and `server/src/config/app.js`). A rename must not need other code changes.

## 2. Goals, non-goals, and success measures

### 2.1 Goals

- Give the user one place for all job applications and their status.
- Give the user a fast, explainable way to fit a CV to one job.
- Link each tailored CV to the application it was sent with.
- Keep the product free to use and usable on a phone.

### 2.2 Non-goals

- Automatic job application submission.
- Direct integration with job platforms.
- Interview scheduling.
- Visual CV design. Tailoring changes text only.
- Team or multi-user features.
- A guarantee of ATS results. Advice follows general ATS practice, not one employer's system.

### 2.3 Success measures

| Measure                                     | Target                             | How we measure                |
| ------------------------------------------- | ---------------------------------- | ----------------------------- |
| Time to add an application                  | Under 60 seconds                   | Timed user test               |
| Time from CV and job description to results | Under 30 seconds (90th percentile) | Server logs                   |
| Core task completion                        | 90% or more                        | User acceptance test, 5 tasks |
| Usability                                   | SUS score of 68 or more            | SUS questionnaire             |
| Users who rate recommendations as useful    | 70% or more                        | Post-test questionnaire       |
| Accessibility                               | WCAG 2.1 AA, no contrast failures  | Audit                         |
| Evaluation sample                           | 20 or more participants (proposed) | Participant log               |

## 3. Users

### 3.1 Primary user

A student or junior developer in Kenya. The user applies to about 6 or more jobs each month. The user applies on LinkedIn, BrighterMonday, Fuzu, Indeed, and company career sites, for local and remote roles. The user works on a phone and a laptop, has a small budget, and pays for data.

### 3.2 User stories

- As a user, I record each application so I can see all of them in one place.
- As a user, I see my applications by status so I know where to act.
- As a user, I get a reminder before a follow-up is late.
- As a user, I upload my CV once and use it for every application.
- As a user, I paste a job description and see how well my CV matches.
- As a user, I see which keywords are missing and why they matter.
- As a user, I save a tailored CV for one job and find it again later.
- As a user, I trust the tool because it does not invent skills for me.

## 4. Scope

### 4.1 In scope

Accounts, application tracking, CV upload and storage, job description analysis, tailored CV generation, a dashboard, follow-up reminders, and summary reports. The product works in modern browsers on desktop and mobile.

### 4.2 Additions to the proposal

These items are not in the submitted proposal. Record them in the implementation documentation only.

- Landing page and Settings page.
- Dark mode with a user toggle.
- GitHub sign-in (priority P2, decision open).
- Application fields `platform` and `followUpDate`. Tables 5.1 and FR8 need them.
- A status history on each application. The proposal lists "view application history".

## 5. Functional requirements

Priority: P0 is required for the first release. P1 is needed before evaluation. P2 is optional. "Proposal" shows the matching requirement in Table 4.1 of the proposal.

### 5.1 Accounts

| ID    | Requirement                             | Priority | Proposal | Acceptance criteria                                                       |
| ----- | --------------------------------------- | -------- | -------- | ------------------------------------------------------------------------- |
| ACC-1 | Register with name, email, and password | P0       | FR1      | Password has 8 or more characters. A duplicate email gives a clear error. |
| ACC-2 | Log in and log out                      | P0       | FR1      | A wrong login gives one generic message. The session ends after 7 days.   |
| ACC-3 | Edit profile and change password        | P1       | FR2      | The user must enter the current password to change it.                    |
| ACC-4 | Reset a forgotten password by email     | P1       | FR1      | The reset link works once and expires in 1 hour.                          |
| ACC-5 | Delete account and all data             | P1       | n/a      | All four collections lose the user's records.                             |
| ACC-6 | Sign in with GitHub                     | P2       | n/a      | Decision open. See section 14.                                            |

### 5.2 Applications

| ID    | Requirement                                                                                     | Priority | Proposal | Acceptance criteria                                             |
| ----- | ----------------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------------------------------- |
| APP-1 | Add an application: company, job title, platform, date, status, job description, follow-up date | P0       | FR4, FR5 | Company and job title are required. Status starts as Applied.   |
| APP-2 | Edit and delete an application                                                                  | P0       | FR4      | Delete needs a confirmation.                                    |
| APP-3 | Change status: Applied, Interview, Offer, Rejected                                              | P0       | FR4      | A Kanban drag works. A menu works on touch screens.             |
| APP-4 | Search by company or title and filter by status                                                 | P1       | FR4      | Results update as the user types.                               |
| APP-5 | Warn about a likely duplicate (same company and title within 90 days)                           | P1       | n/a      | The warning does not block the save.                            |
| APP-6 | Show the status history of an application                                                       | P1       | FR4      | Each change shows the old status, the new status, and the date. |

### 5.3 CV management

| ID   | Requirement                                          | Priority | Proposal | Acceptance criteria                                                                     |
| ---- | ---------------------------------------------------- | -------- | -------- | --------------------------------------------------------------------------------------- |
| CV-1 | Upload a base CV (PDF or DOCX, 5 MB maximum)         | P0       | FR3      | The system extracts the text and shows a preview.                                       |
| CV-2 | Detect unreadable files                              | P0       | FR3      | If fewer than 100 characters are extracted, show a message about image-only files.      |
| CV-3 | Replace the base CV                                  | P0       | FR3      | One base CV for each user. Old tailored CVs stay linked.                                |
| CV-4 | List tailored CVs with their application and base CV | P0       | FR7      | Each item opens its application.                                                        |
| CV-5 | Copy or download a tailored CV as text and DOCX      | P1       | FR7      | The file has the same text as the screen.                                               |
| CV-6 | Delete a tailored CV                                 | P1       | n/a      | The base CV cannot be deleted while it has tailored versions, unless the user confirms. |

### 5.4 Intelligent CV tailoring

| ID     | Requirement                                                                      | Priority | Proposal | Acceptance criteria                                                                             |
| ------ | -------------------------------------------------------------------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------- |
| TAI-1  | Start an analysis from an application and the base CV                            | P0       | FR6      | The user can paste a new job description.                                                       |
| TAI-2  | Extract keywords from the job description and mark each as required or preferred | P0       | FR6      | Output is a list with a type for each keyword.                                                  |
| TAI-3  | Calculate a match score from 0 to 100                                            | P0       | FR6      | The same input always gives the same score.                                                     |
| TAI-4  | Show matched and missing keywords in a diff view                                 | P0       | FR7      | Matches show in the Match color. Gaps show in the Gap color.                                    |
| TAI-5  | Show recommendations with a reason for each                                      | P0       | FR7      | Each item names the keyword and the job description line that caused it.                        |
| TAI-6  | Generate and save a tailored CV                                                  | P0       | FR7      | The saved CV links to the application and the base CV.                                          |
| TAI-7  | Never add a skill or experience that is not in the base CV                       | P0       | n/a      | Missing keywords appear as suggestions. The user must confirm each one before it enters the CV. |
| TAI-8  | Keep working when the AI service is down                                         | P0       | n/a      | The score and missing keywords still show. A notice says AI suggestions are off.                |
| TAI-9  | Remove contact details and personal data before any AI call                      | P0       | n/a      | Name, email, phone, and address never leave the server.                                         |
| TAI-10 | Limit AI use and cache results                                                   | P1       | n/a      | A user can run 20 analyses a day. The same input uses the cache.                                |
| TAI-11 | Re-run the analysis after the user edits the CV                                  | P1       | FR6      | The new score shows next to the old score.                                                      |

### 5.5 Dashboard and reports

| ID    | Requirement                                                      | Priority | Proposal | Acceptance criteria                 |
| ----- | ---------------------------------------------------------------- | -------- | -------- | ----------------------------------- |
| DSH-1 | Show total applications and the count for each status            | P0       | FR8      | Numbers match the application list. |
| DSH-2 | Show follow-ups due in 7 days and overdue follow-ups             | P0       | FR8      | Overdue items show first.           |
| DSH-3 | Show recent applications and recent tailored CVs                 | P0       | FR8      | The last 5 of each.                 |
| DSH-4 | Show a summary by status and platform, and the tailoring history | P1       | FR9      | The user can export it as CSV.      |
| DSH-5 | Send follow-up reminders by email                                | P2       | FR8      | Needs an email service.             |

## 6. Tailoring design

### 6.1 Principle

The score must be explainable. Code calculates the score from keywords. The AI service helps in two places only: it extracts keywords, and it suggests rewrites. The AI service does not decide the score.

### 6.2 Process

1. The server reads the job description and the base CV text.
2. The server removes contact details from the CV text.
3. The AI service extracts keywords from the job description. Each keyword is required or preferred. If the AI service is down, a built-in skills list does this step.
4. The server normalizes keywords with an alias list (for example, "JS" and "JavaScript", or "Node" and "Node.js").
5. The server checks which keywords appear in the CV.
6. The server calculates the score.
7. The AI service suggests rewrites for lines that can include a missing keyword. The user accepts or rejects each one.
8. The server saves the tailored CV, the score, and the recommendations.

### 6.3 Score

Score = 100 x (weight of matched keywords) / (weight of all keywords). A required keyword has weight 2. A preferred keyword has weight 1.

Example: a job has 6 required and 4 preferred keywords. The CV matches 4 required and 2 preferred. Matched weight = 4 x 2 + 2 x 1 = 10. Total weight = 6 x 2 + 4 x 1 = 16. Score = 62.

Score bands use the brand colors: 0 to 49 is Gap, 50 to 74 is Score, 75 to 100 is Match.

### 6.4 Rules for the AI service

- Return JSON only, with a fixed schema.
- Never invent experience, employers, dates, or qualifications.
- Never use name, gender, age, or origin in any decision. Studies show AI screening tools can show bias, so the design keeps this data out.
- Give a reason with each suggestion.
- Tell entry-level users when a missing keyword needs real experience. Do not suggest that they add it.

## 7. Data requirements

| Collection      | Key fields                                                                                                               | Notes                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| users           | fullName, email (unique), password (bcrypt hash), createdAt                                                              | The hash is never returned by the API.                         |
| resumes         | userId, fileName, extractedText, isBaseResume, tailoredFromResumeId, applicationId                                       | One collection for base and tailored CVs.                      |
| applications    | userId, companyName, jobTitle, jobDescription, applicationStatus, applicationDate, platform, followUpDate, statusHistory | `platform`, `followUpDate`, and `statusHistory` are additions. |
| recommendations | userId, applicationId, resumeId, matchScore, missingKeywords, recommendations                                            | One for each tailored CV.                                      |

Every query must filter by `userId`. The original uploaded file is not stored. The system keeps only the extracted text.

## 8. API

All routes start with `/api`. All routes except health, register, and login need a valid token.

| Area         | Routes                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Health       | GET /health                                                                                                |
| Auth         | POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/forgot-password, POST /auth/reset-password |
| Applications | GET, POST /applications. GET, PATCH, DELETE /applications/:id. PATCH /applications/:id/status              |
| Resumes      | POST /resumes/base (upload). GET /resumes. GET, DELETE /resumes/:id. GET /resumes/:id/download             |
| Tailoring    | POST /tailoring/analyze. POST /tailoring/save                                                              |
| Dashboard    | GET /dashboard. GET /reports/summary                                                                       |

## 9. UX and design requirements

### 9.1 Pages

Landing, Registration, Login, Dashboard, Job Application Management (Kanban and list), Resume Tailoring, and Settings.

### 9.2 Design rules

- The comparison view works like a code diff. Matches use a + line and gaps use a - line. This is the main idea of the product.
- Avoid generic SaaS dashboard patterns such as rounded metric cards, avatar circles, and pill tags. The interface uses a terminal and log style.
- Colors: Ink #0E211F, Paper #F4F5F1, Match #2DBE8B, Gap #F0563A, Score #F2AE2E, Slate #4B5F62. Kanban columns map to Slate (Applied), Score (Interview), Match (Offer), and Gap (Rejected).
- Type: IBM Plex Mono for display and data. IBM Plex Sans for body text.
- Color is never the only signal. Each match and gap also has a + or - sign and a text label.

### 9.3 Quality rules

- WCAG 2.1 AA. The audit found contrast failures for Match, Gap, and Score on Paper. Fix them before evaluation.
- Works from 360 px width. Keyboard focus is always visible. Reduced motion is respected.
- Empty and error screens say what happened and what to do next. Use sentence case and active voice.

## 10. Non-functional requirements

| Area            | Requirement                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Performance     | Page load under 3 seconds on a 4G connection. Analysis results under 30 seconds for 90% of requests.                              |
| Reliability     | The product still works for tracking when the AI service is down.                                                                 |
| Security        | bcrypt password hashing, JWT, HTTPS, server-side input validation, file type and size checks, rate limits on login and AI routes. |
| Privacy         | The user can see, export, and delete their data. The privacy notice is in plain language.                                         |
| Scalability     | The first release supports 500 users without code changes.                                                                        |
| Maintainability | One name config. Separate routes, models, and middleware. A README that a new developer can follow.                               |
| Compatibility   | Current Chrome, Firefox, Edge, and Safari. Android and iOS browsers.                                                              |

## 11. Architecture and technology

The system has three tiers: presentation, application, and data.

| Layer        | Technology                                                              |
| ------------ | ----------------------------------------------------------------------- |
| Presentation | React, Vite, Tailwind CSS, React Router                                 |
| Application  | Node.js, Express, JWT, bcrypt                                           |
| Data         | MongoDB, Mongoose                                                       |
| AI           | An external API (OpenAI or Gemini). Decision open.                      |
| File parsing | A PDF text library and a DOCX text library. Choose in the Resumes step. |

The repository is one monorepo with `client/` and `server/` folders. The scaffold is complete.

## 12. Risks

| Risk                                               | Effect                        | Response                                                                        |
| -------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| AI service outage or price change                  | Tailoring stops or costs rise | Fallback mode (TAI-8), cache, daily limit, KES 12,000 budget alert              |
| Poor CV parsing                                    | Wrong score                   | Text preview and edit (CV-1, CV-2)                                              |
| Users do not trust the site with their CV          | Low adoption                  | Clear privacy notice, delete option, no file storage                            |
| Existing tools that combine tracking and tailoring | Weaker position               | Focus on Kenya, developers, and free access. Prepare an answer for the defense. |
| Scope growth                                       | Late delivery                 | Hold P0 first. Move P2 items to later releases.                                 |
| Short schedule                                     | Less time to test             | Build in the planned order. Test each step before the next.                     |

## 13. Delivery plan

The project follows the Waterfall model. The build runs in this order. The Gantt chart in the proposal holds the dates.

1. Scaffold and models.
2. Authentication: ACC-1, ACC-2, protected routes.
3. Applications: APP-1 to APP-3, Kanban page.
4. CV upload: CV-1 to CV-4.
5. Tailoring: TAI-1 to TAI-9.
6. Dashboard and reminders: DSH-1 to DSH-3.
7. P1 items, accessibility fixes, and deployment.
8. Testing and user evaluation.

Testing has four levels: unit tests for the score and the alias list, integration tests for each API route, system tests for the full tailoring flow, and a user acceptance test with the participants.

## 14. Open questions

- Final product name. Candidates: Aptus, Sartor, Rebase, Kazini. A KIPI trademark search is needed first.
- Authentication: email and password only, or GitHub sign-in as well?
- AI provider and model. Check cost against the KES 12,000 budget.
- Email service for password reset and reminders.
- Hosting provider within the KES 7,500 budget.
- Dark mode surface colors from the Figma file.
- Evaluation sample size and the ethics approval process.
- Export formats for tailored CVs.
