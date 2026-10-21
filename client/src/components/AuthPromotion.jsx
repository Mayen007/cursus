export default function AuthPromotion() {
  return (
    <aside className="hidden min-h-dvh items-center justify-center bg-ink px-8 text-paper md:flex">
      <div className="w-full max-w-[520px] text-center">
        <h2 className="font-mono text-2xl font-semibold leading-[1.8]">
          Stop guessing.
          <br />
          Start <span className="text-match">matching.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-xs leading-5 text-paper/65">
          See exactly which skills your CV is missing before a recruiter does.
        </p>
        <div className="mx-auto mt-6 max-w-[320px] border border-paper/10 bg-paper/[0.04] px-5 py-4 text-left">
          <p className="font-mono text-[11px] text-paper/55">
            skills: <span className="text-match underline">react</span>,{" "}
            <span className="text-match underline">node.js</span>,{" "}
            <span className="text-gap line-through">mongodb</span>
          </p>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-paper/60">
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border-2 border-score border-r-transparent"
            />
            ATS match score
          </p>
        </div>
      </div>
    </aside>
  );
}
