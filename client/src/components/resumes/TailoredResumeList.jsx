import { Link } from "react-router";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function TailoredResumeRow({ onDelete, resume }) {
  return (
    <li className="grid gap-3 border-b border-slate/15 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium">{resume.company}</p>
        <p className="mt-1 break-words text-xs leading-5 text-slate">{resume.jobTitle}</p>
        <p className="mt-1 text-[10px] text-slate">
          Based on {resume.baseResume || "base CV"} · {formatDate(resume.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          {resume.applicationId && (
            <Link
              className="inline-flex min-h-11 items-center px-2 font-mono text-[10px] underline decoration-slate/40 underline-offset-4 hover:decoration-ink"
              to={`/tailoring?applicationId=${resume.applicationId}`}
            >
              View analysis
            </Link>
          )}
          <button
            className="inline-flex min-h-11 items-center px-2 font-mono text-[10px] text-gap underline underline-offset-4"
            onClick={() => onDelete(resume)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export default function TailoredResumeList({ onDelete, resumes }) {
  return (
    <section aria-labelledby="tailored-resumes-heading" className="min-w-0">
      <div className="border-b border-slate/20 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
          CV library / saved copies
        </p>
        <h2 className="mt-2 font-mono text-xl font-semibold" id="tailored-resumes-heading">
          Saved CV copies
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate">
          Each unchanged snapshot stays linked to its analysis, application, and source CV.
        </p>
      </div>
      <ul aria-label="Saved CV copies" className="mt-1">
        {resumes.map((resume) => (
          <TailoredResumeRow key={resume.id} onDelete={onDelete} resume={resume} />
        ))}
      </ul>
      {resumes.length === 0 && <p className="mt-4 text-xs text-slate">No saved CV versions yet.</p>}
    </section>
  );
}
