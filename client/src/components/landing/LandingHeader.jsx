import { Link } from "react-router";
import { APP_NAME } from "../../config/app.js";

const SECTION_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
];

function SectionLinks({ className }) {
  return (
    <nav aria-label="Page sections" className={className}>
      {SECTION_LINKS.map(({ href, label }) => (
        <a className="font-mono text-xs text-slate hover:text-ink" href={href} key={href}>
          {label}
        </a>
      ))}
    </nav>
  );
}

export default function LandingHeader({ isAuthenticated }) {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
      <Link
        aria-label={`${APP_NAME} home`}
        className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-ink"
        to="/"
      >
        <span aria-hidden="true" className="h-2 w-2 bg-score" />
        {APP_NAME.toLowerCase()}
      </Link>
      <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
        <SectionLinks className="hidden items-center gap-6 sm:flex" />
        {!isAuthenticated && (
          <Link
            className="inline-flex min-h-11 items-center px-1 font-mono text-xs text-ink hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        )}
        <Link
          className="inline-flex min-h-11 items-center bg-score px-4 font-mono text-xs text-ink hover:bg-score/85"
          to={isAuthenticated ? "/dashboard" : "/register"}
        >
          {isAuthenticated ? "Dashboard" : "Get started"}
        </Link>
      </nav>
      <SectionLinks className="flex min-h-10 w-full items-center gap-6 border-t border-slate/15 pt-2 sm:hidden" />
    </header>
  );
}
