import { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthProviderButtons from "./AuthProviderButtons.jsx";
import { APP_NAME } from "../config/app.js";
import { authenticateUser, registerUser } from "../lib/auth.js";

const AUTH_MODES = {
  login: {
    title: "Sign in",
    description: "Track applications. Tailor CVs that pass ATS.",
    button: "Sign in",
    switchPrompt: "Don't have an account?",
    switchLabel: "Create one",
    switchPath: "/register",
  },
  register: {
    title: "Create an account",
    description: "Track applications. Tailor CVs that pass ATS.",
    button: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchPath: "/login",
  },
};

export default function AuthForm({ mode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", isError: false });
  const navigate = useNavigate();
  const isRegistering = mode === "register";
  const content = AUTH_MODES[mode];

  function handleUnavailableProvider(provider) {
    setFeedback({ message: `${provider} sign-in is not available yet.`, isError: false });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ message: "", isError: false });
    setIsSubmitting(true);
    const { fullName, email, password, confirmPassword } = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );

    if (isRegistering && password !== confirmPassword) {
      setFeedback({ message: "Passwords do not match.", isError: true });
      setIsSubmitting(false);
      return;
    }

    const credentials = isRegistering ? { fullName, email, password } : { email, password };

    try {
      await (isRegistering ? registerUser(credentials) : authenticateUser(credentials));
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
    <div className="w-full max-w-[440px]">
      <Link
        className="inline-flex items-center gap-2 font-mono text-xs text-ink focus-visible:outline-ink"
        to="/login"
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-score" />
        {APP_NAME.toLowerCase()}
      </Link>

      <header className="mt-8">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">{content.title}</h1>
        <p className="mt-1 text-xs leading-5 text-slate sm:text-sm">{content.description}</p>
      </header>

      {isRegistering && (
        <>
          <div className="mt-5">
            <AuthProviderButtons onUnavailable={handleUnavailableProvider} />
          </div>
          <div aria-hidden="true" className="my-3 flex items-center gap-3 text-xs text-slate">
            <span className="h-px flex-1 bg-slate/20" />
            or
            <span className="h-px flex-1 bg-slate/20" />
          </div>
        </>
      )}

      <form
        className={`space-y-4 ${isRegistering ? "mt-4" : "mt-7 space-y-5"}`}
        onSubmit={handleSubmit}
      >
        {isRegistering && (
          <label className="block">
            <span className="mb-1.5 block text-xs text-slate">Full name</span>
            <input
              autoComplete="name"
              className="auth-input"
              maxLength={120}
              name="fullName"
              placeholder="Your name"
              required
            />
          </label>
        )}

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
            {!isRegistering && (
              <button
                className="text-slate underline decoration-slate/50 underline-offset-2 hover:text-ink"
                onClick={() =>
                  setFeedback({ message: "Password reset is not available yet.", isError: false })
                }
                type="button"
              >
                Forgot password?
              </button>
            )}
            {isRegistering && (
              <button
                aria-pressed={isPasswordVisible}
                className="underline decoration-slate/50 underline-offset-2 hover:text-ink"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                type="button"
              >
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            )}
          </span>
          <input
            autoComplete={isRegistering ? "new-password" : "current-password"}
            className="auth-input"
            maxLength={isRegistering ? 128 : undefined}
            id="password"
            minLength={isRegistering ? 8 : undefined}
            name="password"
            placeholder={isRegistering ? "At least 8 characters" : ""}
            required
            type={isPasswordVisible ? "text" : "password"}
          />
          {isRegistering && (
            <span className="mt-1.5 block text-xs text-slate">Use at least 8 characters.</span>
          )}
        </label>

        {isRegistering && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-xs text-slate">Confirm password</span>
              <input
                autoComplete="new-password"
                className="auth-input"
                name="confirmPassword"
                required
                type={isPasswordVisible ? "text" : "password"}
              />
            </label>
            <label className="flex items-start gap-2 text-xs leading-5 text-slate">
              <input className="mt-1 accent-match" name="acceptTerms" required type="checkbox" />
              <span>
                I agree to the{" "}
                <span className="underline underline-offset-2">Terms of Service</span> and{" "}
                <span className="underline underline-offset-2">Privacy Policy</span>.
              </span>
            </label>
          </>
        )}

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
          {isSubmitting ? "Please wait..." : content.button}
        </button>
      </form>

      {!isRegistering && (
        <>
          <div aria-hidden="true" className="my-4 flex items-center gap-3 text-xs text-slate">
            <span className="h-px flex-1 bg-slate/20" />
            or
            <span className="h-px flex-1 bg-slate/20" />
          </div>
          <AuthProviderButtons onUnavailable={handleUnavailableProvider} />
        </>
      )}

      <p className="mt-6 text-center text-xs text-slate">
        {content.switchPrompt}{" "}
        <Link
          className="font-medium text-ink underline decoration-score decoration-2 underline-offset-2"
          to={content.switchPath}
        >
          {content.switchLabel}
        </Link>
      </p>
    </div>
  );
}
