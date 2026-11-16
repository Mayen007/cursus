import { Link } from "react-router";
import { APP_NAME } from "../config/app.js";

export default function AuthFormFrame({
  alternateLabel,
  alternatePath,
  alternatePrompt,
  children,
  title,
}) {
  return (
    <div className="w-full max-w-[440px]">
      <Link
        className="inline-flex items-center gap-2 font-mono text-xs text-ink focus-visible:outline-ink"
        to="/login"
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-score" />
        {APP_NAME.toLowerCase()}
      </Link>

      <header className="mt-8">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-xs leading-5 text-slate sm:text-sm">
          Track applications. Tailor CVs that pass ATS.
        </p>
      </header>

      {children}

      <p className="mt-6 text-center text-xs text-slate">
        {alternatePrompt}{" "}
        <Link
          className="font-medium text-ink underline decoration-score decoration-2 underline-offset-2"
          to={alternatePath}
        >
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
