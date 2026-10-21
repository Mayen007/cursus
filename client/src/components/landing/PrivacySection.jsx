const PRIVACY_PROMISES = [
  "We keep CV text, not the uploaded file.",
  "Personal details stay out of AI requests.",
  "Matching works without an AI service.",
  "Delete your account and records with it.",
];

function PrivacyChecklist() {
  return (
    <div className="border border-paper/10 bg-ink p-4 font-mono text-[10px] leading-5 text-paper/80 sm:p-5">
      <p className="text-paper/45"># privacy.md</p>
      {PRIVACY_PROMISES.map((promise) => (
        <p className="mt-2" key={promise}>
          <span className="text-match">+</span> {promise}
        </p>
      ))}
    </div>
  );
}

export default function PrivacySection() {
  return (
    <section className="border-t border-slate/15 px-5 py-14 sm:px-8 sm:py-20" id="privacy">
      <div className="mx-auto grid max-w-6xl gap-7 sm:grid-cols-2 sm:items-center sm:gap-12">
        <div>
          <p className="font-mono text-[10px] text-slate">{"// privacy"}</p>
          <h2 className="mt-3 font-mono text-2xl font-semibold sm:text-3xl">
            Your CV stays yours.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate">
            Job hunting is personal. We keep only what is needed to match and tailor.
          </p>
        </div>
        <PrivacyChecklist />
      </div>
    </section>
  );
}
