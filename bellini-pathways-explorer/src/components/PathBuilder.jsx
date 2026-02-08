import { useMemo, useState, useEffect } from "react";

function matchesFoundation(node, foundation) {
  if (!foundation) return true;
  if (!node.data?.foundations) return true;
  return node.data.foundations.includes(foundation);
}

function matchesInterest(node, interest) {
  if (!interest) return true;
  if (!node.data?.interests) return true;
  return node.data.interests.includes(interest);
}

function matchesPreference(node, preference) {
  if (!preference) return true;
  const kind = node.data?.kind || "";
  if (preference === "BS") return ["undergraduate", "interdisciplinary"].includes(kind);
  if (preference === "MS") return (kind === "graduate" && !node.data?.label?.includes("PhD")) || kind === "pathway";
  if (preference === "PhD") return kind === "graduate" && node.data?.label?.includes("PhD");
  if (preference === "Minor") return kind === "minor";
  if (preference === "Certificate") return kind === "grad certificate";
  if (preference === "Microcredential") return kind === "microcredential";
  return true;
}

function matchesCareerGoal(job, careerGoal) {
  if (!careerGoal) return true;
  if (!job.goals || job.goals.length === 0) return true;
  return job.goals.includes(careerGoal);
}

function ProgramCard({ program, selected, recommended, onSelect }) {
  return (
    <div
      className={`program-card ${selected ? "program-card-selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      <div>
        <div className="program-title">{program.data.label}</div>
        <div className="program-meta">{program.data.kind}</div>
        {recommended && <div className="program-recommend">Recommended</div>}
        {program.data.skills?.length > 0 && (
          <div className="mt-2 text-xs text-slate-600">
            {program.data.skills.slice(0, 4).join(" • ")}
          </div>
        )}
      </div>
      {program.data.url && (
        <a className="program-link" href={program.data.url} target="_blank" rel="noreferrer">
          View program
        </a>
      )}
    </div>
  );
}

function JobCard({ job }) {
  return (
    <div className="info-block">
      <div className="info-title">{job.title}</div>
      <div className="info-subtitle">{job.source}</div>
      <div className="info-body">{job.description}</div>
      <div className="info-salary">{job.salary}</div>
      {job.sourceUrl && (
        <a className="program-link mt-2 inline-flex" href={job.sourceUrl} target="_blank" rel="noreferrer">
          Source
        </a>
      )}
    </div>
  );
}

function GradCard({ grad }) {
  return (
    <div className="info-block">
      <div className="info-title">{grad.name}</div>
      <div className="info-subtitle">{grad.title}</div>
      <div className="info-body">{grad.summary}</div>
      <div className="info-salary">{grad.date}</div>
      {grad.url && (
        <a className="program-link mt-2 inline-flex" href={grad.url} target="_blank" rel="noreferrer">
          Read story
        </a>
      )}
    </div>
  );
}

export default function PathBuilder({ data, triage, active }) {
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const matchingPrograms = useMemo(() => {
    if (!active) return [];
    const programs = data.nodes.filter((node) => {
      if (node.type !== "degreeNode" && node.type !== "bridgeNode") return false;
      if (triage.foundation && !matchesFoundation(node, triage.foundation)) return false;
      if (triage.interest && !matchesInterest(node, triage.interest)) return false;
      if (triage.preference && !matchesPreference(node, triage.preference)) return false;
      return true;
    });

    return programs.sort((a, b) => a.data.label.localeCompare(b.data.label));
  }, [active, data.nodes, triage.foundation, triage.interest, triage.preference]);

  useEffect(() => {
    if (matchingPrograms.length === 0) {
      setSelectedProgramId(null);
      return;
    }
    if (!selectedProgramId || !matchingPrograms.find((p) => p.id === selectedProgramId)) {
      setSelectedProgramId(matchingPrograms[0].id);
    }
  }, [matchingPrograms, selectedProgramId]);

  const selectedProgram = useMemo(
    () => matchingPrograms.find((program) => program.id === selectedProgramId) || null,
    [matchingPrograms, selectedProgramId]
  );

  const jobBlocks = useMemo(() => {
    if (!selectedProgram?.data?.jobs) return [];
    return selectedProgram.data.jobs.filter((job) => matchesCareerGoal(job, triage.careerGoal));
  }, [selectedProgram, triage.careerGoal]);

  const programTags = useMemo(() => {
    if (!selectedProgram) return [];
    const label = selectedProgram.data.label.toLowerCase();
    const tags = new Set();
    if (label.includes("artificial intelligence") || selectedProgram.id.includes("ai")) {
      tags.add("Artificial Intelligence");
    }
    if (label.includes("cyber") || selectedProgram.id.includes("cys")) {
      tags.add("Cybersecurity");
    }
    if (label.includes("computer") || label.includes("computing") || label.includes("information technology")) {
      tags.add("Computing");
    }
    return Array.from(tags);
  }, [selectedProgram]);

  const recentGrads = useMemo(() => {
    const grads = data.grads || [];
    if (!selectedProgram) return grads;
    return grads.filter((grad) => grad.tags?.some((tag) => programTags.includes(tag)));
  }, [data.grads, programTags, selectedProgram]);

  if (!active) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <div className="text-sm text-slate-600">Complete the triage to see matched programs.</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Matched Programs</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {matchingPrograms.length === 0 && (
              <div className="text-sm text-slate-500">No programs match these triage choices yet.</div>
            )}
            {matchingPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                selected={selectedProgramId === program.id}
                recommended={
                  (triage.interest && matchesInterest(program, triage.interest)) ||
                  (triage.foundation && matchesFoundation(program, triage.foundation))
                }
                onSelect={() => setSelectedProgramId(program.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Career Paths & Salaries</div>
          <div className="mt-4 space-y-3">
            {jobBlocks.length === 0 && (
              <div className="text-sm text-slate-500">Choose a program to see career outcomes.</div>
            )}
            {jobBlocks.map((job) => (
              <JobCard key={job.title} job={job} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent Grads</div>
          <div className="mt-4 space-y-3">
            {recentGrads.length === 0 && (
              <div className="text-sm text-slate-500">No recent grad spotlights for this selection yet.</div>
            )}
            {recentGrads.map((grad) => (
              <GradCard key={grad.name} grad={grad} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
