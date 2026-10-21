import { useEffect, useState } from "react";
import { Link } from "react-router";
import BaseResumeSection from "../components/resumes/BaseResumeSection.jsx";
import TailoredResumeList from "../components/resumes/TailoredResumeList.jsx";
import WorkspaceNavigation from "../components/WorkspaceNavigation.jsx";
import { deleteResume, getResumes, uploadBaseResume } from "../lib/resumeApi.js";

export default function ResumeLibraryPage() {
  const [baseResume, setBaseResume] = useState(null);
  const [tailoredResumes, setTailoredResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    getResumes()
      .then((result) => {
        if (!isActive) return;
        setBaseResume(result.baseResume);
        setTailoredResumes(result.tailoredResumes);
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

  async function handleUpload(file) {
    setError("");
    const saved = await uploadBaseResume(file);
    setBaseResume(saved);
  }

  async function handleDelete(resume) {
    setError("");
    try {
      await deleteResume(resume.id);
      setTailoredResumes((current) => current.filter((item) => item.id !== resume.id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-4 text-ink sm:px-8 sm:py-6">
      <WorkspaceNavigation />

      <section className="mx-auto max-w-7xl py-8 sm:py-12">
        <div className="flex flex-col justify-between gap-4 border-b border-slate/20 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
              Workspace / CV manager
            </p>
            <h1 className="mt-2 font-mono text-3xl font-semibold sm:text-4xl">Your CVs</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate">
              Keep a base CV and review saved analysis snapshots beside their applications.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center bg-score px-5 font-mono text-xs font-medium hover:bg-score/85 sm:w-auto"
            to="/applications"
          >
            Go to applications
          </Link>
        </div>

        {isLoading && (
          <p className="mt-4 text-sm text-slate" role="status">
            Loading saved CVs...
          </p>
        )}
        {error && (
          <p className="mt-4 border-l-2 border-gap py-1 pl-3 text-sm" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
          <BaseResumeSection baseResume={baseResume} onUpload={handleUpload} />
          <TailoredResumeList onDelete={handleDelete} resumes={tailoredResumes} />
        </div>
      </section>
    </main>
  );
}
