import { useEffect, useRef } from "react";

export default function DeleteApplicationDialog({ application, onClose, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      aria-labelledby="delete-dialog-title"
      className="w-[min(100%-2rem,28rem)] border border-slate/30 bg-paper p-6 text-ink shadow-xl backdrop:bg-ink/60"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <h2 className="font-mono text-lg font-semibold" id="delete-dialog-title">
        Delete application?
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate">
        Delete the {application.jobTitle} application at {application.company}? This cannot be
        undone.
      </p>
      <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          className="min-h-11 border border-slate/30 px-4 font-mono text-xs"
          onClick={onClose}
          type="button"
        >
          Keep application
        </button>
        <button
          className="min-h-11 bg-gap px-4 font-mono text-xs font-medium text-ink hover:bg-gap/85"
          onClick={onConfirm}
          type="button"
        >
          Delete application
        </button>
      </div>
    </dialog>
  );
}
