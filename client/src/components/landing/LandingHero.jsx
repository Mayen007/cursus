import { Link } from "react-router";
import { MATCHED_SKILLS, MISSING_SKILLS } from "./landingContent.js";

function SkillRows({ label, skills, statusClass }) {
  return skills.map((skill) => (
    <li className="flex items-center justify-between gap-3 font-mono text-[11px]" key={skill}>
      <span className={statusClass}>{label}</span>
      <span className="min-w-0 flex-1">{skill}</span>
      <span className="shrink-0 text-slate">
        {label === "+ Matched" ? "Required" : "Preferred"}
      </span>
    </li>
  ));
}

function MatchPreview() {
  return (
    <div className="w-full max-w-[440px] border border-slate/20 bg-paper p-4 text-ink shadow-xl sm:p-6">
      <p className="font-mono text-[10px] text-slate">base-cv.pdf → junior-mern-developer</p>
      <ul className="mt-5 space-y-2">
        <SkillRows label="+ Matched" skills={MATCHED_SKILLS} statusClass="text-match" />
        <SkillRows label="- Missing" skills={MISSING_SKILLS} statusClass="text-gap" />
      </ul>
      <div className="mt-5 border-t border-slate/20 pt-3">
        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-[10px] leading-4 text-slate">
            ATS match score
            <br />
            13 / 18 weighted skills
          </p>
          <p className="font-mono text-3xl font-semibold text-score">72</p>
        </div>
        <div aria-hidden="true" className="mt-3 h-1 bg-slate/15">
          <div className="h-full w-[72%] bg-score" />
        </div>
      </div>
    </div>
  );
}

export default function LandingHero({ isAuthenticated }) {
  return (
    <section className="bg-ink px-5 py-14 text-paper sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <p className="font-mono text-[10px] text-paper/65">
            {"// for student and junior developers in Kenya"}
          </p>
          <h1 className="mt-5 max-w-2xl font-mono text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Stop guessing.
            <br />
            Start <span className="text-match">matching.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-paper/80 sm:text-base">
            Track every application and see which skills your CV is missing for each job. Free to
            use.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center bg-score px-5 font-mono text-xs text-ink hover:bg-score/85"
              to={isAuthenticated ? "/dashboard" : "/register"}
            >
              {isAuthenticated ? "Open dashboard" : "Create free account"}
            </Link>
            {!isAuthenticated && (
              <Link
                className="inline-flex min-h-11 items-center border border-paper/50 px-5 font-mono text-xs text-paper hover:bg-paper/10"
                to="/login"
              >
                Sign in
              </Link>
            )}
          </div>
          <p className="mt-4 font-mono text-[10px] text-paper/55">
            No card needed. We keep your CV text, not the file.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <MatchPreview />
        </div>
      </div>
    </section>
  );
}
