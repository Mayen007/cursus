import { useEffect, useRef } from "react";
import { APPLICATION_STATUSES } from "./applicationsData.js";

function getLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function FormField({ children, label, name, ...inputProps }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs text-slate">{label}</span>
      {children || <input className="auth-input" name={name} {...inputProps} />}
    </label>
  );
}

export default function ApplicationDialog({ application, isSaving, onClose, onSave }) {
  const dialogRef = useRef(null);
  const isEditing = Boolean(application);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    onSave({ ...application, ...values, id: application?.id });
  }

  return (
    <dialog
      aria-labelledby="application-dialog-title"
      className="w-[min(100%-2rem,38rem)] border border-slate/30 bg-paper p-0 text-ink shadow-xl backdrop:bg-ink/60"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <form className="space-y-5 p-5 sm:p-7" onSubmit={handleSubmit}>
        <header className="border-b border-slate/20 pb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            Applications / {isEditing ? "Edit" : "New"}
          </p>
          <h2 className="mt-2 font-mono text-xl font-semibold" id="application-dialog-title">
            {isEditing ? "Edit application" : "Add an application"}
          </h2>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            autoComplete="organization"
            defaultValue={application?.company || ""}
            label="Company"
            maxLength={160}
            name="company"
            placeholder="e.g. Safaricom"
            required
          />
          <FormField
            defaultValue={application?.jobTitle || ""}
            label="Job title"
            maxLength={160}
            name="jobTitle"
            placeholder="e.g. Frontend developer"
            required
          />
          <FormField
            defaultValue={application?.platform || ""}
            label="Platform"
            maxLength={100}
            name="platform"
            placeholder="e.g. LinkedIn"
          />
          <FormField
            defaultValue={application?.appliedDate || getLocalDate()}
            label="Date applied"
            name="appliedDate"
            required
            type="date"
          />
          <FormField label="Status" name="status">
            <select
              className="auth-input"
              defaultValue={application?.status || "Applied"}
              name="status"
            >
              {APPLICATION_STATUSES.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            defaultValue={application?.followUpDate || ""}
            label="Follow-up date"
            name="followUpDate"
            type="date"
          />
        </div>

        <FormField label="Job description" name="jobDescription">
          <textarea
            className="auth-input min-h-24 resize-y"
            defaultValue={application?.jobDescription || ""}
            maxLength={50000}
            name="jobDescription"
            placeholder="Paste the job description when you are ready to tailor your CV."
            rows={4}
          />
        </FormField>

        <footer className="flex flex-col-reverse justify-end gap-3 border-t border-slate/20 pt-4 sm:flex-row">
          <button
            className="min-h-11 border border-slate/30 px-4 font-mono text-xs hover:bg-slate/5"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-11 bg-score px-4 font-mono text-xs font-medium hover:bg-score/85 disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving..." : isEditing ? "Save changes" : "Add application"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
