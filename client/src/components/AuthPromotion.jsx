const PROMOTIONS = {
  login: {
    headline: "Your job search,",
    highlight: "right where you left it.",
    description: "Pick up your applications and review your CV matches.",
  },
  register: {
    headline: "Build a clearer path",
    highlight: "to your next role.",
    description: "Track each opportunity and see how your CV fits the role.",
  },
};

export default function AuthPromotion({ mode }) {
  const promotion = PROMOTIONS[mode];

  return (
    <aside className="hidden min-h-dvh items-center justify-center bg-ink px-8 text-paper md:flex">
      <div className="w-full max-w-[520px] text-center">
        <h2 className="font-mono text-2xl font-semibold leading-[1.8]">
          {promotion.headline}
          <br />
          <span className="text-match">{promotion.highlight}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-xs leading-5 text-paper/65">
          {promotion.description}
        </p>
        {mode === "register" ? (
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
        ) : (
          <div className="mx-auto mt-6 max-w-[320px] border border-paper/10 bg-paper/[0.04] px-5 py-4 text-left">
            <p className="font-mono text-[11px] text-paper/55">YOUR WORKSPACE</p>
            <p className="mt-3 text-xs leading-5 text-paper/75">
              Applications, follow-ups, and CV matches—ready when you are.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
