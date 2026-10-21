import { useState } from "react";

export default function TailoringForm({
  applications,
  baseResume,
  initialApplicationId,
  onAnalyze,
}) {
  const [applicationId, setApplicationId] = useState(
    initialApplicationId || applications[0]?.id || ""
  );
  const selectedApplication = applications.find(({ id }) => id === applicationId);
  const [jobDescription, setJobDescription] = useState(selectedApplication?.jobDescription || "");

  function handleSubmit(event) {
    event.preventDefault();
    onAnalyze({ applicationId, jobDescription: jobDescription.trim() });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="font-mono text-xs font-medium">Application</span>
        <span className="mt-1 block text-[11px] leading-5 text-slate">
          Choose the opportunity this CV is for.
        </span>
        <select
          className="auth-input mt-2"
          onChange={(event) => {
            const nextApplicationId = event.target.value;
            setApplicationId(nextApplicationId);
            setJobDescription(
              applications.find(({ id }) => id === nextApplicationId)?.jobDescription || ""
            );
          }}
          value={applicationId}
        >
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.company} — {application.jobTitle}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-mono text-xs font-medium">Base CV text</span>
        <span className="mt-1 block text-[11px] leading-5 text-slate">
          Using the extracted text from your saved base CV.
        </span>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words border border-slate/20 bg-surface p-3 font-mono text-xs leading-5 text-slate">
          {baseResume.extractedText}
        </pre>
      </label>

      <label className="block">
        <span className="font-mono text-xs font-medium">Job description</span>
        <span className="mt-1 block text-[11px] leading-5 text-slate">
          The description from this application is loaded automatically. You can update it here
          before running the analysis. Use “preferred” or “nice to have” for preferred keywords.
        </span>
        <textarea
          className="auth-input mt-2 min-h-48 resize-y font-mono text-xs leading-5"
          maxLength={50000}
          onChange={(event) => setJobDescription(event.target.value)}
          required
          value={jobDescription}
          rows={8}
        />
      </label>

      <button
        className="min-h-11 w-full bg-score px-5 font-mono text-xs font-medium hover:bg-score/85 sm:w-auto"
        disabled={!applications.length}
        type="submit"
      >
        Analyze match
      </button>
    </form>
  );
}
