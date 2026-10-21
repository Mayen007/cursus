function getScoreBand(score) {
  if (score >= 75) return { label: "Match", color: "text-match" };
  if (score >= 50) return { label: "Score", color: "text-score" };
  return { label: "Gap", color: "text-gap" };
}

function KeywordRow({ keyword, isMatched }) {
  const sign = isMatched ? "+" : "-";
  const status = isMatched ? "Matched" : "Missing";
  const color = isMatched ? "border-match" : "border-gap";

  return (
    <li className={`border-l-2 ${color} py-2 pl-3`}>
      <p className="font-mono text-xs">
        <span aria-hidden="true">{sign} </span>
        {status}: {keyword.label}
        <span className="ml-2 text-[10px] text-slate">({keyword.type})</span>
      </p>
      {!isMatched && (
        <p className="mt-1 text-[11px] leading-5 text-slate">
          JD line {keyword.lineNumber}: “{keyword.sourceLine}”
        </p>
      )}
    </li>
  );
}

function ScoreSummary({ score }) {
  const band = getScoreBand(score);

  return (
    <section
      aria-label={`Match score ${score} out of 100, ${band.label}`}
      className="flex flex-wrap items-end justify-between gap-3 border-y border-slate/20 py-4"
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate">Match score</p>
        <p className="mt-1 font-mono text-3xl font-semibold">
          {score}
          <span className="text-sm text-slate"> / 100</span>
        </p>
      </div>
      <p className={`font-mono text-xs font-medium ${band.color}`}>
        {band.label} · calculated from keyword weights
      </p>
    </section>
  );
}

export default function AnalysisResults({ isSaving, onSave, result, savedResume }) {
  if (!result) {
    return (
      <section aria-label="Analysis results" className="border border-dashed border-slate/30 p-5">
        <p className="font-mono text-xs font-medium">Results appear here</p>
        <p className="mt-2 text-xs leading-5 text-slate">
          Run an analysis to see the score, matched keywords, missing keywords, and source lines.
        </p>
      </section>
    );
  }

  if (result.score === null) {
    return (
      <section aria-label="Analysis results" className="border-l-2 border-score bg-surface p-4">
        <p className="font-mono text-xs font-medium">No supported keywords found</p>
        <p className="mt-2 text-xs leading-5 text-slate">
          Add keywords from the built-in list (JavaScript, React, TypeScript, Node.js, REST APIs,
          Git, accessibility, or unit testing) to the job description.
        </p>
      </section>
    );
  }

  const matchedLabels = new Set(result.matchedKeywords.map(({ label }) => label));

  return (
    <section aria-label="Analysis results" aria-live="polite" className="space-y-5">
      {result.application && (
        <p className="font-mono text-xs text-slate">
          Application: {result.application.company} — {result.application.jobTitle}
        </p>
      )}
      <ScoreSummary score={result.score} />
      <div className="border-l-2 border-score bg-surface px-4 py-3 text-xs leading-5 text-slate">
        This score is calculated on the server from your saved CV text. Your CV is not sent to an AI
        service.
      </div>

      <section aria-labelledby="keyword-diff-heading">
        <h2 className="font-mono text-lg font-semibold" id="keyword-diff-heading">
          Keyword diff
        </h2>
        <ul className="mt-3 space-y-1">
          {result.keywords.map((keyword) => (
            <KeywordRow
              isMatched={matchedLabels.has(keyword.label)}
              key={keyword.label}
              keyword={keyword}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="recommendations-heading">
        <h2 className="font-mono text-lg font-semibold" id="recommendations-heading">
          Recommendations
        </h2>
        {result.missingKeywords.length ? (
          <ul className="mt-3 space-y-3">
            {result.missingKeywords.map((keyword) => (
              <li className="border border-slate/20 bg-surface p-3" key={keyword.label}>
                <p className="font-mono text-xs">
                  - {keyword.label} <span className="text-slate">({keyword.type})</span>
                </p>
                <p className="mt-2 text-xs leading-5 text-slate">
                  The job description asks for this on line {keyword.lineNumber}: “
                  {keyword.sourceLine}”
                </p>
                <p className="mt-2 text-xs leading-5 text-ink">
                  Add it only if your actual experience supports it. Do not claim a skill you do not
                  have.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 border-l-2 border-match pl-3 text-xs leading-5 text-slate">
            + All supported keywords appear in the CV text.
          </p>
        )}
      </section>
      {result.recommendationId && (
        <section className="border-t border-slate/20 pt-4">
          <p className="text-xs leading-5 text-slate">
            Saving keeps an unchanged copy of your base CV with this analysis. No skills or
            experience are added automatically.
          </p>
          {savedResume ? (
            <p className="mt-3 text-xs text-match" role="status">
              Saved {savedResume.fileName}.
            </p>
          ) : (
            <button
              className="mt-3 min-h-11 bg-score px-4 font-mono text-xs font-medium disabled:opacity-60"
              disabled={isSaving}
              onClick={() => onSave(result.recommendationId)}
              type="button"
            >
              {isSaving ? "Saving..." : "Save analyzed CV copy"}
            </button>
          )}
        </section>
      )}
    </section>
  );
}
