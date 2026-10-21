import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getDashboardData } from "../components/dashboard/dashboardData.js";
import WorkspaceNavigation from "../components/WorkspaceNavigation.jsx";
import { getApplications } from "../lib/applicationApi.js";
import { getResumes } from "../lib/resumeApi.js";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getFollowUpLabel(daysUntilFollowUp) {
  if (daysUntilFollowUp < 0) {
    const daysOverdue = Math.abs(daysUntilFollowUp);
    return `Overdue by ${daysOverdue} ${daysOverdue === 1 ? "day" : "days"}`;
  }
  if (daysUntilFollowUp === 0) return "Due today";
  return `Due in ${daysUntilFollowUp} days`;
}

function StatusSummary({ statusCounts, totalApplications }) {
  return (
    <section aria-labelledby="status-summary-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate/20 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            Applications / overview
          </p>
          <h2 className="mt-1 font-mono text-xl font-semibold" id="status-summary-heading">
            Status summary
          </h2>
        </div>
        <p className="font-mono text-xs text-slate">
          <span className="text-2xl font-semibold text-ink">{totalApplications}</span> total
        </p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
        {statusCounts.map(({ id, label, count }) => (
          <div className="border-l-2 border-slate/30 py-1 pl-3" key={id}>
            <dt className="font-mono text-xs text-slate">{label}</dt>
            <dd className="mt-1 font-mono text-2xl font-medium">{count}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FollowUpList({ followUps, overdueFollowUps, upcomingFollowUps }) {
  return (
    <section aria-labelledby="follow-ups-heading">
      <div className="border-b border-slate/20 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate">Next actions</p>
        <h2 className="mt-1 font-mono text-xl font-semibold" id="follow-ups-heading">
          Follow-ups
        </h2>
        <p className="mt-1 text-xs text-slate">
          {overdueFollowUps} overdue · {upcomingFollowUps} due in the next 7 days
        </p>
      </div>
      {followUps.length ? (
        <ul className="divide-y divide-slate/15">
          {followUps.map((application) => {
            const isOverdue = application.daysUntilFollowUp < 0;
            return (
              <li
                className="flex flex-wrap items-center justify-between gap-3 py-3"
                key={application.id}
              >
                <div className="min-w-0">
                  <p className="break-words font-mono text-xs font-medium">{application.company}</p>
                  <p className="mt-1 break-words text-xs text-slate">{application.jobTitle}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`font-mono text-[11px] ${isOverdue ? "text-gap" : "text-ink"}`}>
                    {isOverdue ? "- " : ""}
                    {getFollowUpLabel(application.daysUntilFollowUp)}
                  </p>
                  <p className="mt-1 text-[10px] text-slate">
                    {formatDate(application.followUpDate)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-5 text-xs leading-5 text-slate">
          No overdue follow-ups or reminders due in the next 7 days.
        </p>
      )}
    </section>
  );
}

function RecentApplications({ applications }) {
  return (
    <section aria-labelledby="recent-applications-heading">
      <div className="flex items-end justify-between gap-3 border-b border-slate/20 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            Job search / latest
          </p>
          <h2 className="mt-1 font-mono text-xl font-semibold" id="recent-applications-heading">
            Recent applications
          </h2>
        </div>
        <Link
          className="inline-flex min-h-11 items-center font-mono text-[10px] underline underline-offset-4"
          to="/applications"
        >
          View all
        </Link>
      </div>
      {applications.length ? (
        <ul className="divide-y divide-slate/15">
          {applications.map((application) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 py-3"
              key={application.id}
            >
              <div className="min-w-0">
                <p className="break-words font-mono text-xs font-medium">{application.company}</p>
                <p className="mt-1 break-words text-xs text-slate">{application.jobTitle}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-mono text-[10px]">{application.status}</p>
                <p className="mt-1 text-[10px] text-slate">{formatDate(application.appliedDate)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-5 text-xs leading-5 text-slate">
          No applications yet. Add an opportunity to start tracking your search.
        </p>
      )}
    </section>
  );
}

function RecentTailoredResumes({ resumes }) {
  return (
    <section aria-labelledby="recent-tailored-heading">
      <div className="flex items-end justify-between gap-3 border-b border-slate/20 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
            CV library / saved
          </p>
          <h2 className="mt-1 font-mono text-xl font-semibold" id="recent-tailored-heading">
            Recent saved CV copies
          </h2>
        </div>
        <Link
          className="inline-flex min-h-11 items-center font-mono text-[10px] underline underline-offset-4"
          to="/resumes"
        >
          CV manager
        </Link>
      </div>
      {resumes.length ? (
        <ul className="divide-y divide-slate/15">
          {resumes.map((resume) => (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={resume.id}>
              <div className="min-w-0">
                <p className="break-words font-mono text-xs font-medium">{resume.company}</p>
                <p className="mt-1 break-words text-xs text-slate">{resume.jobTitle}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="mt-1 text-[10px] text-slate">{formatDate(resume.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-5 text-xs leading-5 text-slate">
          No saved CV copies yet. Analyze a CV to save an unchanged snapshot here.
        </p>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [tailoredResumes, setTailoredResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    Promise.all([getApplications(), getResumes()])
      .then(([applicationRecords, resumeRecords]) => {
        if (!isActive) return;
        setApplications(applicationRecords);
        setTailoredResumes(resumeRecords.tailoredResumes);
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

  const dashboard = getDashboardData(applications, tailoredResumes);

  return (
    <main className="min-h-screen bg-paper px-4 py-4 text-ink sm:px-8 sm:py-6">
      <WorkspaceNavigation />

      <section className="mx-auto max-w-7xl py-8 sm:py-12">
        <header className="flex flex-col justify-between gap-5 border-b border-slate/20 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
              Workspace / Dashboard
            </p>
            <h1 className="mt-2 font-mono text-3xl font-semibold sm:text-4xl">Your job search</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
              Review your applications, follow-ups, and saved CV analysis snapshots in one place.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center bg-score px-5 font-mono text-xs font-medium hover:bg-score/85 sm:w-auto"
            to="/applications"
          >
            + Add application
          </Link>
        </header>

        {isLoading && (
          <p className="mt-4 text-sm text-slate" role="status">
            Loading your data...
          </p>
        )}
        {error && (
          <p className="mt-4 border-l-2 border-gap py-1 pl-3 text-sm" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:gap-12">
          <div className="space-y-8">
            <StatusSummary
              statusCounts={dashboard.statusCounts}
              totalApplications={dashboard.totalApplications}
            />
            <RecentApplications applications={dashboard.recentApplications} />
          </div>
          <div className="space-y-8">
            <FollowUpList
              followUps={dashboard.followUps}
              overdueFollowUps={dashboard.overdueFollowUps}
              upcomingFollowUps={dashboard.upcomingFollowUps}
            />
            <RecentTailoredResumes resumes={dashboard.recentTailoredResumes} />
          </div>
        </div>
      </section>
    </main>
  );
}
