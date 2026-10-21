import { APPLICATION_COLUMNS } from "./landingContent.js";

function ApplicationColumn({ column }) {
  return (
    <section aria-label={`${column.status}: ${column.items.length}`} className="min-w-0">
      <div className={`flex justify-between border-t-2 ${column.color} py-2 font-mono text-[10px]`}>
        <h3>{column.status}</h3>
        <span>{column.items.length}</span>
      </div>
      <ul className="space-y-2">
        {column.items.map((item) => (
          <li className="border border-slate/15 bg-surface p-3" key={item.company}>
            <p className="font-mono text-xs font-medium">{item.company}</p>
            <p className="mt-1 text-[10px] leading-4 text-slate">{item.role}</p>
            {item.followUp && (
              <p className="mt-1 font-mono text-[9px] text-slate">! {item.followUp}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ApplicationsSection() {
  return (
    <section className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] text-slate">{"// applications"}</p>
        <h2 className="mt-3 font-mono text-2xl font-semibold sm:text-3xl">
          See where every application stands.
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {APPLICATION_COLUMNS.map((column) => (
            <ApplicationColumn column={column} key={column.status} />
          ))}
        </div>
      </div>
    </section>
  );
}
