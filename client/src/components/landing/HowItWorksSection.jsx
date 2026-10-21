import { WORKFLOW_STEPS } from "./landingContent.js";

export default function HowItWorksSection() {
  return (
    <section className="px-5 py-14 sm:px-8 sm:py-20" id="how-it-works">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] text-slate">{"// how it works"}</p>
        <h2 className="mt-3 font-mono text-2xl font-semibold sm:text-3xl">
          Track it. Match it. Tailor it.
        </h2>
        <div className="mt-7 border-t border-slate/15">
          {WORKFLOW_STEPS.map((step) => (
            <article
              className="grid gap-4 border-b border-slate/15 py-6 sm:grid-cols-[0.55fr_1fr_1.1fr] sm:items-start sm:gap-6 sm:py-7"
              key={step.number}
            >
              <div>
                <p className="font-mono text-[10px] text-slate">{step.number}</p>
                <h3 className="mt-1 font-mono text-lg font-semibold">{step.name}</h3>
              </div>
              <p className="text-sm leading-6 text-slate">{step.description}</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words border border-ink/10 bg-ink p-4 font-mono text-[10px] leading-5 text-paper sm:whitespace-pre">
                {step.sample.join("\n")}
              </pre>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
