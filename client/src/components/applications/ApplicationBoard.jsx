import ApplicationCard from "./ApplicationCard.jsx";
import { APPLICATION_STATUSES } from "./applicationsData.js";

function ApplicationColumn({ applications, status, onDrop, ...cardProps }) {
  function handleDrop(event) {
    event.preventDefault();
    const applicationId = event.dataTransfer.getData("text/plain");
    if (applicationId) onDrop(applicationId, status.id);
  }

  return (
    <section
      aria-label={`${status.label}: ${applications.length}`}
      className="min-w-0"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <header className={`flex items-center justify-between border-t-2 ${status.color} py-3`}>
        <h2 className="font-mono text-xs font-medium">{status.label}</h2>
        <span className="font-mono text-xs text-slate">{applications.length}</span>
      </header>
      <ul className="space-y-3">
        {applications.map((application) => (
          <li
            draggable
            key={application.id}
            onDragStart={(event) => event.dataTransfer.setData("text/plain", application.id)}
          >
            <ApplicationCard application={application} {...cardProps} />
          </li>
        ))}
      </ul>
      {applications.length === 0 && (
        <p className="border border-dashed border-slate/25 px-3 py-5 text-xs text-slate">
          No applications in this status.
        </p>
      )}
    </section>
  );
}

export default function ApplicationBoard({
  applications,
  onDelete,
  onEdit,
  onStatusChange,
  selectedStatus,
  setSelectedStatus,
}) {
  const cardProps = { onDelete, onEdit, onStatusChange };

  return (
    <div>
      <div
        aria-label="Filter board by status"
        className="grid grid-cols-2 gap-2 lg:hidden"
        role="group"
      >
        {APPLICATION_STATUSES.map(({ id, label, color }) => {
          const count = applications.filter((application) => application.status === id).length;
          return (
            <button
              aria-pressed={selectedStatus === id}
              className={`min-h-11 border-l-2 ${color} px-3 text-left font-mono text-xs aria-pressed:bg-ink aria-pressed:text-paper`}
              key={id}
              onClick={() => setSelectedStatus(id)}
              type="button"
            >
              {label} <span className="ml-1">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 lg:hidden">
        {APPLICATION_STATUSES.filter(({ id }) => id === selectedStatus).map((status) => (
          <ApplicationColumn
            applications={applications.filter((application) => application.status === status.id)}
            key={status.id}
            onDrop={onStatusChange}
            status={status}
            {...cardProps}
          />
        ))}
      </div>

      <div className="mt-5 hidden gap-4 lg:grid lg:grid-cols-4">
        {APPLICATION_STATUSES.map((status) => (
          <ApplicationColumn
            applications={applications.filter((application) => application.status === status.id)}
            key={status.id}
            onDrop={onStatusChange}
            status={status}
            {...cardProps}
          />
        ))}
      </div>
    </div>
  );
}
