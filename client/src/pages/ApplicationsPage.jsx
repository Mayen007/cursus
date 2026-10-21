import { useEffect, useState } from "react";
import ApplicationBoard from "../components/applications/ApplicationBoard.jsx";
import ApplicationCard from "../components/applications/ApplicationCard.jsx";
import ApplicationDialog from "../components/applications/ApplicationDialog.jsx";
import DeleteApplicationDialog from "../components/applications/DeleteApplicationDialog.jsx";
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
  updateApplicationStatus,
} from "../lib/applicationApi.js";
import WorkspaceNavigation from "../components/WorkspaceNavigation.jsx";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("board");
  const [selectedStatus, setSelectedStatus] = useState("Applied");
  const [editingApplication, setEditingApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  useEffect(() => {
    let isActive = true;
    getApplications()
      .then((records) => {
        if (isActive) setApplications(records);
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

  async function handleSave(application) {
    setIsSaving(true);
    setError("");
    try {
      const saved = editingApplication
        ? await updateApplication(application)
        : await createApplication(application);
      setApplications((current) =>
        editingApplication
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current]
      );
      setSelectedStatus(saved.status);
      setIsDialogOpen(false);
      setEditingApplication(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(application) {
    setEditingApplication(application);
    setIsDialogOpen(true);
  }

  async function handleDelete() {
    setError("");
    try {
      await deleteApplication(applicationToDelete.id);
      setApplications((current) =>
        current.filter((application) => application.id !== applicationToDelete.id)
      );
      setApplicationToDelete(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleStatusChange(applicationId, status) {
    setError("");
    try {
      const updated = await updateApplicationStatus(applicationId, status);
      setApplications((current) =>
        current.map((application) => (application.id === updated.id ? updated : application))
      );
      setSelectedStatus(status);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function openNewApplication() {
    setEditingApplication(null);
    setIsDialogOpen(true);
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-4 text-ink sm:px-8 sm:py-6">
      <WorkspaceNavigation />

      <section className="mx-auto max-w-7xl py-8 sm:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate">
              Workspace / Applications
            </p>
            <h1 className="mt-2 font-mono text-3xl font-semibold sm:text-4xl">Job applications</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate">
              Keep each opportunity moving, from application to outcome.
            </p>
          </div>
          <button
            className="min-h-11 w-full bg-score px-5 font-mono text-xs font-medium hover:bg-score/85 sm:w-auto"
            onClick={openNewApplication}
            type="button"
          >
            + Add application
          </button>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-y border-slate/20 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate">Applications are saved to your account.</p>
          <div aria-label="Application view" className="flex gap-1" role="group">
            {[
              { id: "board", label: "Board" },
              { id: "list", label: "List" },
            ].map(({ id, label }) => (
              <button
                aria-pressed={view === id}
                className="min-h-11 px-4 font-mono text-xs aria-pressed:bg-ink aria-pressed:text-paper"
                key={id}
                onClick={() => setView(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-4 border-l-2 border-gap py-1 pl-3 text-sm" role="alert">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="mt-5 text-sm text-slate" role="status">
            Loading applications...
          </p>
        )}

        {view === "board" ? (
          <div className="mt-5">
            <ApplicationBoard
              applications={applications}
              onDelete={setApplicationToDelete}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </div>
        ) : (
          <section aria-label="All applications" className="mt-5">
            <ul className="space-y-3">
              {applications.map((application) => (
                <li key={application.id}>
                  <ApplicationCard
                    application={application}
                    onDelete={setApplicationToDelete}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                  />
                </li>
              ))}
            </ul>
            {applications.length === 0 && (
              <p className="border border-dashed border-slate/25 px-4 py-8 text-sm text-slate">
                No applications yet. Add one to start tracking your search.
              </p>
            )}
          </section>
        )}

        {!isLoading && applications.length === 0 && view === "board" && (
          <p className="mt-4 text-xs text-slate">
            No applications yet. Add one to start tracking your search.
          </p>
        )}
      </section>

      {isDialogOpen && (
        <ApplicationDialog
          application={editingApplication}
          isSaving={isSaving}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
        />
      )}

      {applicationToDelete && (
        <DeleteApplicationDialog
          application={applicationToDelete}
          onClose={() => setApplicationToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
