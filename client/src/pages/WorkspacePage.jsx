import { useNavigate } from "react-router";
import { APP_NAME } from "../config/app.js";

export default function WorkspacePage() {
  const navigate = useNavigate();

  function handleSignOut() {
    sessionStorage.removeItem("sessionToken");
    sessionStorage.removeItem("sessionUser");
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-10 sm:py-8">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate/30 pb-4 sm:pb-5">
        <p className="min-w-0 font-mono text-xs uppercase tracking-widest sm:text-sm">
          {APP_NAME} / workspace
        </p>
        <button
          className="inline-flex min-h-11 shrink-0 items-center px-2 font-mono text-sm underline decoration-slate/50 underline-offset-4 hover:decoration-ink"
          onClick={handleSignOut}
          type="button"
        >
          Sign out
        </button>
      </header>
      <section className="mx-auto max-w-5xl py-12 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-match">Workspace / ready</p>
        <h1 className="mt-5 font-mono text-3xl font-medium leading-tight sm:text-5xl">
          You’re signed in.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate sm:text-lg sm:leading-8">
          Your application workspace is being prepared. You can sign out securely from here.
        </p>
      </section>
    </main>
  );
}
