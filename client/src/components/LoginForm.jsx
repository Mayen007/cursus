import { useState } from "react";
import { useNavigate } from "react-router";
import AuthFormFrame from "./AuthFormFrame.jsx";
import AuthProviderButtons from "./AuthProviderButtons.jsx";
import { authenticateUser } from "../lib/auth.js";

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", isError: false });
  const navigate = useNavigate();

  function handleUnavailableProvider(provider) {
    setFeedback({ message: `${provider} sign-in is not available yet.`, isError: false });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ message: "", isError: false });
    setIsSubmitting(true);
    const { email, password } = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      await authenticateUser({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "We could not complete your request.",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormFrame
      alternateLabel="Create one"
      alternatePath="/register"
      alternatePrompt="Don't have an account?"
      title="Sign in"
    >
      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-xs text-slate">Email</span>
          <input
            autoComplete="email"
            className="auth-input"
            maxLength={254}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs text-slate">
            Password
            <button
              className="text-slate underline decoration-slate/50 underline-offset-2 hover:text-ink"
              onClick={() =>
                setFeedback({ message: "Password reset is not available yet.", isError: false })
              }
              type="button"
            >
              Forgot password?
            </button>
          </span>
          <input
            autoComplete="current-password"
            className="auth-input"
            id="password"
            name="password"
            required
            type="password"
          />
        </label>

        {feedback.message && (
          <p
            className={`border-l-2 py-1 pl-3 text-sm text-ink ${feedback.isError ? "border-gap" : "border-score"}`}
            role={feedback.isError ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        )}

        <button
          className="w-full bg-score px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-score/85 disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Please wait..." : "Sign in"}
        </button>
      </form>

      <div aria-hidden="true" className="my-4 flex items-center gap-3 text-xs text-slate">
        <span className="h-px flex-1 bg-slate/20" />
        or
        <span className="h-px flex-1 bg-slate/20" />
      </div>
      <AuthProviderButtons onUnavailable={handleUnavailableProvider} />
    </AuthFormFrame>
  );
}
