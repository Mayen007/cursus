import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../lib/auth.js";

export default function ProtectedRoute() {
  const token = sessionStorage.getItem("sessionToken");
  const [status, setStatus] = useState(token ? "checking" : "unauthenticated");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return undefined;

    let isActive = true;
    getCurrentUser()
      .then((user) => {
        if (isActive) setStatus(user ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (isActive) setStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, [attempt, token]);

  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (status === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
        <p aria-live="polite" className="font-mono text-sm">
          Verifying your session...
        </p>
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
        <section aria-labelledby="session-error-heading" className="max-w-md">
          <h1 className="font-mono text-xl font-semibold" id="session-error-heading">
            Could not verify your session
          </h1>
          <p className="mt-2 text-sm text-slate">Check your connection and try again.</p>
          <button
            className="mt-5 min-h-11 border border-slate/30 px-4 font-mono text-xs"
            onClick={() => {
              setStatus("checking");
              setAttempt((current) => current + 1);
            }}
            type="button"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
