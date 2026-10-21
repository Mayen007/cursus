import { APPLICATION_STATUSES } from "./applicationsData.js";

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function ApplicationCard({ application, onDelete, onEdit, onStatusChange }) {
  return (
    <article className="border border-slate/20 bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-mono text-sm font-medium">{application.company}</h3>
          <p className="mt-1 break-words text-xs leading-5 text-slate">{application.jobTitle}</p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-slate">
          {formatDate(application.appliedDate)}
        </span>
      </div>

      <dl className="mt-3 space-y-1 border-t border-slate/10 pt-3 text-[11px]">
        {application.platform && (
          <div className="flex gap-2">
            <dt className="text-slate">Platform</dt>
            <dd>{application.platform}</dd>
          </div>
        )}
        {application.followUpDate && (
          <div className="flex gap-2">
            <dt className="text-slate">Follow up</dt>
            <dd>{formatDate(application.followUpDate)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate/10 pt-3">
        <label className="flex min-h-11 items-center gap-2 text-[10px] text-slate">
          Status
          <select
            aria-label={`Change ${application.company} status`}
            className="min-h-9 max-w-36 border border-slate/30 bg-paper px-2 font-mono text-[10px] text-ink"
            onChange={(event) => onStatusChange(application.id, event.target.value)}
            value={application.status}
          >
            {APPLICATION_STATUSES.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <button
            aria-label={`Edit ${application.company} application`}
            className="min-h-11 px-2 font-mono text-[10px] underline underline-offset-4 hover:text-slate"
            onClick={() => onEdit(application)}
            type="button"
          >
            Edit
          </button>
          <button
            aria-label={`Delete ${application.company} application`}
            className="min-h-11 px-2 font-mono text-[10px] text-gap underline underline-offset-4 hover:text-ink"
            onClick={() => onDelete(application)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
