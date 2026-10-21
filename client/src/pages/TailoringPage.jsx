import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSearchParams } from "react-router";
import WorkspaceNavigation from "../components/WorkspaceNavigation.jsx";
import AnalysisResults from "../components/tailoring/AnalysisResults.jsx";
import TailoringForm from "../components/tailoring/TailoringForm.jsx";
import { getApplications } from "../lib/applicationApi.js";
import { getResumes } from "../lib/resumeApi.js";
import { analyzeTailoring, saveAnalyzedResume } from "../lib/tailoringApi.js";

export default function TailoringPage() {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [baseResume, setBaseResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [savedResume, setSavedResume] = useState(null);
  const initialApplicationId = searchParams.get("applicationId");

  useEffect(() => {
    let isActive = true;
    Promise.all([getApplications(), getResumes()])
      .then(([applicationRecords, resumeRecords]) => {
        if (!isActive) return;
        setApplications(applicationRecords);
        setBaseResume(resumeRecords.baseResume);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleAnalyze({ applicationId, jobDescription }) {
    setIsAnalyzing(true);
    setError("");
    setSavedResume(null);
    try {
      setResult(await analyzeTailoring(applicationId, jobDescription));
    } catch (requestError) {
      setError(requestError.message);
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSave(recommendationId) {
    setIsSaving(true);
    setError("");
    try {
      const resume = await saveAnalyzedResume(recommendationId);
      setSavedResume(resume);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-4 text-ink sm:px-8 sm:py-6">
      <WorkspaceNavigation />

      <section className="mx-auto max-w-7xl py-8 sm:py-12">
        <header className="border-b border-slate/20 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            Workspace / Resume tailoring
          </p>
          <h1 className="mt-2 font-mono text-3xl font-semibold sm:text-4xl">Tailor your CV</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
            Compare a CV with a job description and review an explainable match score.
          </p>
        </header>

        {isLoading && (
          <p className="mt-4 text-sm text-slate" role="status">
            Loading your CV and applications...
          </p>
        )}
        {error && (
          <p className="mt-4 border-l-2 border-gap py-1 pl-3 text-sm" role="alert">
            {error}
          </p>
        )}
        {!isLoading && !baseResume && (
          <p className="mt-6 text-sm text-slate">
            Upload a base CV before starting an analysis.{" "}
            <Link className="underline underline-offset-4" to="/resumes">
              Open CV manager
            </Link>
          </p>
        )}
        {!isLoading && applications.length === 0 && (
          <p className="mt-6 text-sm text-slate">
            Add an application before starting an analysis.{" "}
            <Link className="underline underline-offset-4" to="/applications">
              Open applications
            </Link>
          </p>
        )}
        {!isLoading && baseResume && applications.length > 0 && (
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <TailoringForm
                applications={applications}
                baseResume={baseResume}
                initialApplicationId={initialApplicationId}
                onAnalyze={handleAnalyze}
              />
              {isAnalyzing && (
                <p className="mt-3 text-xs text-slate" role="status">
                  Analyzing...
                </p>
              )}
            </div>
            <AnalysisResults
              isSaving={isSaving}
              onSave={handleSave}
              result={result}
              savedResume={savedResume}
            />
          </div>
        )}
      </section>
    </main>
  );
}
