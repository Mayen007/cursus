import LoginForm from "../components/LoginForm.jsx";
import AuthPage from "./AuthPage.jsx";

export default function LoginPage() {
  return (
    <AuthPage
      promotion={
        <>
          <h2 className="font-mono text-2xl font-semibold leading-[1.8]">
            Your job search,
            <br />
            <span className="text-match">right where you left it.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-xs leading-5 text-paper/65">
            Pick up your applications and review your CV matches.
          </p>
          <div className="mx-auto mt-6 max-w-[320px] border border-paper/10 bg-paper/[0.04] px-5 py-4 text-left">
            <p className="font-mono text-[11px] text-paper/55">YOUR WORKSPACE</p>
            <p className="mt-3 text-xs leading-5 text-paper/75">
              Applications, follow-ups, and CV matches—ready when you are.
            </p>
          </div>
        </>
      }
    >
      <LoginForm />
    </AuthPage>
  );
}
