import { useState } from "react";
import WorkspaceNavigation from "../components/WorkspaceNavigation.jsx";
import { clearSession, removeAccount, updateAccount, updatePassword } from "../lib/auth.js";
import { getThemePreference, saveThemePreference } from "../lib/theme.js";
import { useNavigate } from "react-router";

function readAccountDetails() {
  const savedUser = sessionStorage.getItem("sessionUser");
  return savedUser ? JSON.parse(savedUser) : {};
}

function SettingsSection({ id, title, description, children }) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="border-b border-slate/20 py-6 first:pt-0 last:border-b-0"
      id={id}
    >
      <div className="mb-5">
        <h2 className="font-mono text-xl font-semibold" id={`${id}-heading`}>
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate">{description}</p>
      </div>
      {children}
    </section>
  );
}

function AccountDetails({ account }) {
  return (
    <dl className="divide-y divide-slate/15 border-y border-slate/15">
      {[
        { label: "Full name", value: account.fullName },
        { label: "Email address", value: account.email },
      ].map(({ label, value }) => (
        <div className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4" key={label}>
          <dt className="text-xs text-slate">{label}</dt>
          <dd className="break-words font-mono text-sm">{value || "Not connected"}</dd>
        </div>
      ))}
    </dl>
  );
}

function AppearanceToggle({ theme, onChange }) {
  const isDark = theme === "dark";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate/15 py-4">
      <div>
        <p className="font-mono text-sm font-medium">Dark mode</p>
        <p className="mt-1 text-xs leading-5 text-slate">
          Use a darker palette across the workspace.
        </p>
      </div>
      <button
        aria-checked={isDark}
        aria-label="Dark mode"
        className="inline-flex min-h-11 items-center gap-3 font-mono text-xs"
        onClick={() => onChange(isDark ? "light" : "dark")}
        role="switch"
        type="button"
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-7 w-12 items-center border border-slate/50 transition-colors ${
            isDark ? "bg-match" : "bg-surface"
          }`}
        >
          <span
            className={`h-4 w-4 transition-transform ${
              isDark ? "translate-x-6 bg-ink" : "translate-x-1 bg-slate"
            }`}
          />
        </span>
        <span>{isDark ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [theme, setTheme] = useState(getThemePreference);
  const [account, setAccount] = useState(readAccountDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", isError: false });
  const navigate = useNavigate();

  function handleThemeChange(nextTheme) {
    saveThemePreference(nextTheme);
    setTheme(nextTheme);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback({ message: "", isError: false });
    const form = new FormData(event.currentTarget);
    try {
      setAccount(
        await updateAccount({
          fullName: form.get("fullName"),
          email: form.get("email"),
        })
      );
      setIsEditing(false);
      setFeedback({ message: "Account details saved.", isError: false });
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback({ message: "", isError: false });
    const form = new FormData(event.currentTarget);
    try {
      await updatePassword({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      });
      event.currentTarget.reset();
      setFeedback({ message: "Password changed.", isError: false });
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAccountDelete(event) {
    event.preventDefault();
    if (!window.confirm("Delete your account and all associated data? This cannot be undone.")) {
      return;
    }
    setIsSaving(true);
    const password = new FormData(event.currentTarget).get("deletePassword");
    try {
      await removeAccount(password);
      clearSession();
      navigate("/register", { replace: true });
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-4 text-ink sm:px-8 sm:py-6">
      <WorkspaceNavigation />

      <section className="mx-auto max-w-7xl py-8 sm:py-12">
        <header className="border-b border-slate/20 pb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-slate">
            Workspace / Settings
          </p>
          <h1 className="mt-2 font-mono text-3xl font-semibold sm:text-4xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
            Manage your account details, appearance, and security preferences.
          </p>
        </header>

        {feedback.message && (
          <p
            className={`mt-4 border-l-2 py-1 pl-3 text-sm ${feedback.isError ? "border-gap" : "border-match"}`}
            role={feedback.isError ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12">
          <nav
            aria-label="Settings sections"
            className="flex flex-wrap gap-x-5 border-b border-slate/15 pb-3 lg:block lg:border-b-0 lg:pb-0"
          >
            {[
              { href: "#account", label: "Account" },
              { href: "#appearance", label: "Appearance" },
              { href: "#security", label: "Security" },
            ].map(({ href, label }) => (
              <a
                className="inline-flex min-h-11 items-center font-mono text-xs text-slate underline-offset-4 hover:text-ink hover:underline lg:w-full"
                href={href}
                key={href}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="min-w-0">
            <SettingsSection
              description="Your account identity and contact details."
              id="account"
              title="Account"
            >
              {isEditing ? (
                <form className="space-y-4" onSubmit={handleProfileSubmit}>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate">Full name</span>
                    <input
                      className="auth-input"
                      defaultValue={account.fullName}
                      maxLength={120}
                      name="fullName"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate">Email address</span>
                    <input
                      className="auth-input"
                      defaultValue={account.email}
                      maxLength={254}
                      name="email"
                      required
                      type="email"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="min-h-11 bg-score px-4 font-mono text-xs disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      className="min-h-11 border border-slate/30 px-4 font-mono text-xs"
                      onClick={() => setIsEditing(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <AccountDetails account={account} />
                  <button
                    className="mt-4 min-h-11 border border-slate/30 px-4 font-mono text-xs"
                    onClick={() => setIsEditing(true)}
                    type="button"
                  >
                    Edit profile
                  </button>
                </>
              )}
            </SettingsSection>

            <SettingsSection
              description="Choose the workspace appearance that suits you."
              id="appearance"
              title="Appearance"
            >
              <AppearanceToggle onChange={handleThemeChange} theme={theme} />
              <p className="mt-3 text-xs leading-5 text-slate">
                Your choice is stored in this browser and applies across the site.
              </p>
            </SettingsSection>

            <SettingsSection
              description="Password and account lifecycle controls."
              id="security"
              title="Security"
            >
              <form
                className="space-y-4 border-y border-slate/15 py-4"
                onSubmit={handlePasswordSubmit}
              >
                <div>
                  <p className="font-mono text-sm font-medium">Change password</p>
                  <p className="mt-1 text-xs leading-5 text-slate">
                    Confirm your current password before choosing a new one.
                  </p>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate">Current password</span>
                  <input
                    autoComplete="current-password"
                    className="auth-input"
                    name="currentPassword"
                    required
                    type="password"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate">New password</span>
                  <input
                    autoComplete="new-password"
                    className="auth-input"
                    minLength={8}
                    maxLength={128}
                    name="newPassword"
                    required
                    type="password"
                  />
                </label>
                <button
                  className="min-h-11 border border-slate/30 px-4 font-mono text-xs disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  Change password
                </button>
              </form>
              <form
                className="mt-6 space-y-4 border-l-2 border-gap pl-4"
                onSubmit={handleAccountDelete}
              >
                <div>
                  <p className="font-mono text-sm font-medium">Delete account</p>
                  <p className="mt-1 text-xs leading-5 text-slate">
                    Permanently remove your account, applications, and CV data.
                  </p>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate">Confirm your password</span>
                  <input
                    autoComplete="current-password"
                    className="auth-input"
                    name="deletePassword"
                    required
                    type="password"
                  />
                </label>
                <button
                  className="min-h-11 border border-gap px-4 font-mono text-xs text-gap disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  Delete account
                </button>
              </form>
            </SettingsSection>
          </div>
        </div>
      </section>
    </main>
  );
}
