import { SCORE_PRINCIPLES } from "./landingContent.js";

function ScoreFormula() {
  return (
    <div className="mt-5 max-w-md border border-paper/15 bg-paper/[0.04] p-4 font-mono text-[10px] leading-5">
      <p className="text-paper/55">score = (matched weight / total weight) × 100</p>
      <p className="mt-1 text-paper/80">score = (13 / 18) × 100</p>
      <p className="text-score">score = 72</p>
    </div>
  );
}

function ScorePrinciples() {
  return (
    <ul className="space-y-6">
      {SCORE_PRINCIPLES.map((principle) => (
        <li className="flex gap-3" key={principle.title}>
          <span aria-hidden="true" className="font-mono text-match">
            +
          </span>
          <div>
            <h3 className="font-mono text-sm font-medium">{principle.title}</h3>
            <p className="mt-1 text-xs leading-5 text-paper/70">{principle.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ScoreSection() {
  return (
    <section className="bg-ink px-5 py-14 text-paper sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="font-mono text-[10px] text-paper/60">{"// the score"}</p>
          <h2 className="mt-3 font-mono text-2xl font-semibold sm:text-3xl">No black box.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-paper/75">
            Required skills weigh 2. Preferred skills weigh 1. The same CV and job description
            always give the same score.
          </p>
          <ScoreFormula />
        </div>
        <ScorePrinciples />
      </div>
    </section>
  );
}
