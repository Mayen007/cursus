import SignupForm from "../components/SignupForm.jsx";
import AuthPage from "./AuthPage.jsx";

export default function SignupPage() {
  return (
    <AuthPage
      promotion={
        <>
          <h2 className="font-mono text-2xl font-semibold leading-[1.8]">
            Build a clearer path
            <br />
            <span className="text-match">to your next role.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-xs leading-5 text-paper/65">
            Track each opportunity and see how your CV fits the role.
          </p>
          <div className="mx-auto mt-6 max-w-[320px] border border-paper/10 bg-paper/[0.04] px-5 py-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] text-paper/55">sample match · junior developer</p>
              <span className="font-mono text-[10px] text-score">EXAMPLE</span>
            </div>
            <p className="mt-4 font-mono text-[11px] text-paper/55">
              skills: <span className="text-match underline">react</span>,{" "}
              <span className="text-match underline">node.js</span>,{" "}
              <span className="text-gap line-through">mongodb</span>
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-paper/10 pt-3">
              <span className="text-[11px] text-paper/60">CV match score · example</span>
              <span className="font-mono text-xl font-semibold text-score">72</span>
            </div>
          </div>
        </>
      }
    >
      <SignupForm />
    </AuthPage>
  );
}
