import { useState } from "react";
import { useNavigate } from "react-router";
import AuthFormFrame from "./AuthFormFrame.jsx";
import AuthProviderButtons from "./AuthProviderButtons.jsx";
import { registerUser } from "../lib/auth.js";

export default function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", isError: false });
  const navigate = useNavigate();

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

    if (password !== confirmPassword) {
      setFeedback({ message: "Passwords do not match.", isError: true });
      setIsSubmitting(false);
      return;
    }

    try {
      await registerUser({ fullName, email, password });
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
      alternateLabel="Sign in"
      alternatePath="/login"
      alternatePrompt="Already have an account?"
      title="Create an account"
    >
      <div className="mt-5">
        <AuthProviderButtons onUnavailable={handleUnavailableProvider} />
      </div>
      <div aria-hidden="true" className="my-3 flex items-center gap-3 text-xs text-slate">
        <span className="h-px flex-1 bg-slate/20" />
        or
        <span className="h-px flex-1 bg-slate/20" />
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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
              aria-pressed={isPasswordVisible}
              className="underline decoration-slate/50 underline-offset-2 hover:text-ink"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              type="button"
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </span>
          <input
            autoComplete="new-password"
            className="auth-input"
            maxLength={72}
            id="password"
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            required
            type={isPasswordVisible ? "text" : "password"}
          />
          <span className="mt-1.5 block text-xs text-slate">
            Use at least 8 characters and no more than 72 UTF-8 bytes.
          </span>
        </label>

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
          {isSubmitting ? "Please wait..." : "Create account"}
        </button>
      </form>
    </AuthFormFrame>
  );
}
