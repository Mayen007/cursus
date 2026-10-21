import { Link } from "react-router";
import { APP_NAME } from "../../config/app.js";

export default function LandingFooter({ isAuthenticated }) {
  return (
    <footer className="border-t border-paper/25 bg-ink px-5 py-5 text-paper/65 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <Link aria-label={`${APP_NAME} home`} className="font-mono text-xs text-paper" to="/">
          <span className="text-score">●</span> {APP_NAME.toLowerCase()}
        </Link>
        <nav
          aria-label="Footer navigation"
          className="flex justify-center gap-5 font-mono text-[10px] sm:gap-6"
        >
          <Link className="hover:text-paper" to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
          <a className="hover:text-paper" href="#privacy">
            Privacy
          </a>
          <a className="hover:text-paper" href="#how-it-works">
            How it works
          </a>
        </nav>
        <p className="font-mono text-[9px]">Made for student and junior developers in Kenya.</p>
      </div>
    </footer>
  );
}
