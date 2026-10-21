import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { APP_NAME } from "../config/app.js";
import { clearSession } from "../lib/auth.js";

const WORKSPACE_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/resumes", label: "CV manager" },
  { href: "/tailoring", label: "Tailor a CV" },
  { href: "/settings", label: "Settings" },
];

export default function WorkspaceNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between border-b border-slate/25 pb-3 sm:pb-4">
      <Link
        aria-label={`${APP_NAME} home`}
        className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest"
        to="/"
      >
        {APP_NAME.toLowerCase()}
      </Link>
      <button
        aria-controls="workspace-navigation-links"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate/30 text-ink focus-visible:outline-offset-2 lg:hidden"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          {isOpen ? (
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
      </button>
      <nav
        aria-label="Workspace"
        className={`${isOpen ? "flex" : "hidden"} mt-3 w-full flex-col border-t border-slate/20 lg:mt-0 lg:flex lg:w-auto lg:flex-row lg:border-0`}
        id="workspace-navigation-links"
      >
        {WORKSPACE_LINKS.map(({ href, label }) => (
          <Link
            aria-current={pathname === href ? "page" : undefined}
            className="inline-flex min-h-11 items-center border-b border-slate/15 font-mono text-xs underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:decoration-score aria-[current=page]:decoration-2 lg:mx-2 lg:border-0"
            onClick={() => setIsOpen(false)}
            key={href}
            to={href}
          >
            {label}
          </Link>
        ))}
        <button
          className="inline-flex min-h-11 items-center font-mono text-xs text-slate underline underline-offset-4 hover:text-ink lg:mx-2 lg:px-2"
          onClick={() => {
            clearSession();
            navigate("/login", { replace: true });
          }}
          type="button"
        >
          Sign out
        </button>
      </nav>
    </header>
  );
}
