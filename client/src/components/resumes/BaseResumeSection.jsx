import { useRef, useState } from "react";
import { ACCEPTED_RESUME_TYPES, MAX_RESUME_FILE_SIZE } from "./resumeData.js";

function getFileError(file) {
  const extension = `.${file.name.split(".").pop().toLowerCase()}`;
  const acceptedType = ACCEPTED_RESUME_TYPES.find((type) => type.extension === extension);

  if (!acceptedType || (file.type && file.type !== acceptedType.mimeType)) {
    return "Choose a PDF or DOCX file.";
  }
  if (file.size > MAX_RESUME_FILE_SIZE) {
    return "The file must be 5 MB or smaller.";
  }
  return "";
}

export default function BaseResumeSection({ baseResume, onUpload }) {
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = getFileError(file);
    if (validationError) {
      setError(true);
      setFeedback(validationError);
      input.value = "";
      return;
    }

    setIsUploading(true);
    setError(false);
    setFeedback("");
    try {
      await onUpload(file);
      setFeedback("CV uploaded and text extracted. The original file was not stored.");
    } catch (uploadError) {
      setError(true);
      setFeedback(uploadError.message);
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  }

  function handleReplace() {
    fileInputRef.current?.click();
  }

  return (
    <section aria-labelledby="base-resume-heading" className="min-w-0">
      <div className="flex flex-col justify-between gap-4 border-b border-slate/20 pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            CV library / base CV
          </p>
          <h2 className="mt-2 font-mono text-lg font-semibold" id="base-resume-heading">
            Your base CV
          </h2>
        </div>
        <button
          className="min-h-11 w-full border border-ink px-4 font-mono text-xs hover:bg-ink hover:text-paper sm:w-auto"
          disabled={isUploading}
          onClick={handleReplace}
          type="button"
        >
          {isUploading ? "Uploading..." : baseResume ? "Replace CV" : "Choose a CV"}
        </button>
      </div>

      <label className="mt-4 block border border-dashed border-slate/40 bg-surface p-4 sm:p-5">
        <span className="block font-mono text-xs font-medium">
          {baseResume?.fileName || "Select a PDF or DOCX"}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate">
          Maximum file size: 5 MB. Only extracted text is kept.
        </span>
        {baseResume?.updatedAt && (
          <span className="mt-2 block font-mono text-[10px] text-slate">
            Last updated{" "}
            {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(
              new Date(baseResume.updatedAt)
            )}
          </span>
        )}
        <input
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-label="Choose base CV file"
          className="mt-3 block min-h-11 w-full max-w-full text-xs file:mr-3 file:min-h-10 file:border-0 file:bg-ink file:px-3 file:font-mono file:text-[10px] file:text-paper"
          disabled={isUploading}
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </label>

      {feedback && (
        <p
          className={`mt-3 border-l-2 py-1 pl-3 text-xs leading-5 ${
            error ? "border-gap" : "border-score"
          }`}
          role={error ? "alert" : "status"}
        >
          {feedback}
        </p>
      )}

      <div className="mt-5 border border-slate/20 bg-surface">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate/15 px-4 py-3">
          <div>
            <h3 className="font-mono text-xs font-medium">
              {baseResume?.fileName || "No base CV uploaded"}
            </h3>
            <p className="mt-1 text-[10px] text-slate">
              {baseResume?.updatedAt
                ? new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(
                    new Date(baseResume.updatedAt)
                  )
                : "Upload a CV to show extracted text"}
            </p>
          </div>
          <span className="font-mono text-[10px] text-score">{baseResume ? "SAVED" : "EMPTY"}</span>
        </div>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-5 text-slate">
          {baseResume?.extractedText || "Your extracted CV text will appear here after upload."}
        </pre>
      </div>
      <p className="mt-3 text-[10px] leading-5 text-slate">
        Your CV text should be reviewed before tailoring. Uploaded source files will not be kept.
      </p>
    </section>
  );
}
