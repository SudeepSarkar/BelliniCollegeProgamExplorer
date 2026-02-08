import { useState } from "react";

function InfoCard({ title, skills = [], jobs = [], jobsDetailed = [], align = "right" }) {
  return (
    <div className={`info-card ${align === "left" ? "info-card-left" : ""}`}>
      <h4>{title}</h4>
      {skills.length > 0 && (
        <div className="mb-2">
          {skills.map((skill) => (
            <span className="tag" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      )}
      {jobsDetailed.length > 0 ? (
        <div className="space-y-3 text-xs text-slate-700">
          {jobsDetailed.map((job) => (
            <div key={job.title}>
              <div className="font-semibold text-slate-800">{job.title}</div>
              <div className="text-slate-600">{job.description}</div>
              <div className="mt-1 text-slate-500">{job.salaryRange}</div>
            </div>
          ))}
        </div>
      ) : (
        jobs.length > 0 && (
          <div className="text-xs text-slate-600">
            {jobs.join(" • ")}
          </div>
        )
      )}
    </div>
  );
}

function CategoryPill({ kind }) {
  if (!kind) return null;
  const label = kind
    .replace("undergraduate", "UG")
    .replace("graduate", "GR")
    .replace("grad certificate", "CERT")
    .replace("microcredential", "MICRO")
    .replace("minor", "MINOR")
    .replace("interdisciplinary", "INTERDISC")
    .replace("pathway", "PATHWAY")
    .toUpperCase();

  return <span className="node-pill">{label}</span>;
}

function BaseNode({ data, className, showInfo, children }) {
  return (
    <div className={`node-shell ${className} ${data.interdisciplinary ? "interdisciplinary" : ""} ${data.kind ? `kind-${data.kind.replace(/\\s+/g, "-")}` : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="node-title">{data.label}</div>
          <div className="flex flex-wrap gap-2 items-center">
            {data.kind && <div className="node-subtle">{data.kind.toUpperCase()}</div>}
            <CategoryPill kind={data.kind} />
            {data.availableToAll && <span className="node-pill node-pill-accent">Open to All</span>}
          </div>
          {data.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {data.isNew && <span className="node-badge">New 2026</span>}
      </div>
      {children}
      {showInfo && (
        <InfoCard
          title={data.label}
          skills={data.skills}
          jobs={data.jobs}
          jobsDetailed={data.jobsDetailed}
          align={data.infoSide}
        />
      )}
    </div>
  );
}

export function InputNode({ data }) {
  return (
    <BaseNode data={data} className="">
      <div className="mt-2 text-xs text-slate-500">Entry point</div>
    </BaseNode>
  );
}

export function BridgeNode({ data }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <BaseNode data={data} className="bridge" showInfo={hovered}>
        <div className="mt-2 text-xs text-slate-600">Connector pathway</div>
      </BaseNode>
    </div>
  );
}

export function DegreeNode({ data }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <BaseNode data={data} className="" showInfo={hovered}>
        <div className="mt-2 text-xs text-slate-600">Degree</div>
      </BaseNode>
    </div>
  );
}

export function CareerNode({ data }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <BaseNode data={data} className="career" showInfo={hovered}>
        <div className="mt-2 text-xs text-slate-600">Outcome</div>
      </BaseNode>
    </div>
  );
}
