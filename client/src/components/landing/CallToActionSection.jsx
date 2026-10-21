import { Link } from "react-router";

export default function CallToActionSection({ isAuthenticated }) {
  return (
    <section className="bg-ink px-5 py-12 text-paper sm:px-8 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="max-w-lg font-mono text-2xl font-semibold leading-tight sm:text-3xl">
            {isAuthenticated ? "Pick up where you left off." : "Start with one job description."}
          </h2>
          <p className="mt-3 text-sm text-paper/75">
            {isAuthenticated
              ? "Review your applications and CV analysis."
              : "Create a free account. Add an application. See your score."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center bg-score px-5 font-mono text-xs text-ink hover:bg-score/85"
            to={isAuthenticated ? "/dashboard" : "/register"}
          >
            {isAuthenticated ? "Open dashboard" : "Create free account"}
          </Link>
          {!isAuthenticated && (
            <Link
              className="inline-flex min-h-11 items-center border border-paper/50 px-5 font-mono text-xs text-paper hover:bg-paper/10"
              to="/login"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
