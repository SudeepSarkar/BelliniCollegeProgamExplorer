import { useMemo, useState, useEffect } from "react";

function normalizeText(text) {
  return (text || "").toLowerCase().trim();
}

function getFreeformMatches(text) {
  const normalized = normalizeText(text);
  const programIds = new Set();
  const visionIds = new Set();

  if (!normalized) return { programIds, visionIds };

  if (normalized.includes("video game") || normalized.includes("video games") || normalized.includes("game")) {
    programIds.add("bscs");
    visionIds.add("The Software Architect (CS, CSE)");
  }
  if (
    normalized.includes("bank") ||
    normalized.includes("finance") ||
    normalized.includes("fintech")
  ) {
    programIds.add("bscs_business");
    programIds.add("bsit");
    visionIds.add("The Tech Business Leader (CS + Business)");
  }
  if (
    normalized.includes("fix computer") ||
    normalized.includes("fix computers") ||
    normalized.includes("repair") ||
    normalized.includes("help desk") ||
    normalized.includes("tech support")
  ) {
    programIds.add("bsit");
    programIds.add("bscp");
    visionIds.add("The Infrastructure Specialist (BSIT)");
    visionIds.add("The Systems Engineer (CpE, CSE)");
  }
  if (
    normalized.includes("hardware") ||
    normalized.includes("circuit") ||
    normalized.includes("device")
  ) {
    programIds.add("bscp");
    visionIds.add("The Systems Engineer (CpE, CSE)");
  }
  if (
    normalized.includes("security") ||
    normalized.includes("cyber") ||
    normalized.includes("hacker")
  ) {
    programIds.add("bscys");
    visionIds.add("The Cyber Guardian (BSCYS)");
  }
  if (
    normalized.includes("ai") ||
    normalized.includes("artificial intelligence") ||
    normalized.includes("machine learning") ||
    normalized.includes("ml")
  ) {
    programIds.add("bsai");
    visionIds.add("The AI Pioneer (BSAI, MSAI)");
  }

  return { programIds, visionIds };
}

function matchesReadiness(node, mathLevel, codingExperience) {
  if (!mathLevel && !codingExperience) return true;
  if (!node.data?.foundations) return true;
  const matchesMath = mathLevel ? node.data.foundations.includes(mathLevel) : true;
  const matchesCoding = codingExperience ? node.data.foundations.includes(codingExperience) : true;
  return matchesMath && matchesCoding;
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

function allowedByStartingLine(node, startingLine) {
  if (!startingLine) return true;
  const kind = node.data?.kind || "";
  const isPhd = node.data?.label?.includes("PhD");

  switch (startingLine) {
    case "High School / First-Year":
      return ["undergraduate", "interdisciplinary"].includes(kind);
    case "Current USF Student":
      return ["undergraduate", "interdisciplinary", "minor"].includes(kind);
    case "Transfer Student":
      return ["undergraduate", "interdisciplinary"].includes(kind) || node.id === "cert_pathway";
    case "Working Professional / Career Switcher":
      return (
        ["graduate", "grad certificate", "microcredential", "pathway"].includes(kind) &&
        !isPhd
      );
    default:
      return true;
  }
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
        {program.data.visionTags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {program.data.visionTags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        {program.data.skills?.length > 0 && (
          <div className="mt-2 text-xs text-slate-600">
            {program.data.skills.slice(0, 4).join(" • ")}
          </div>
        )}
        {program.data.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {program.data.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
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
  const [showAdvisorCTA, setShowAdvisorCTA] = useState(false);
  const freeformMatches = useMemo(() => getFreeformMatches(triage.freeform), [triage.freeform]);
  const matchingPrograms = useMemo(() => {
    if (!active) return [];
    const programs = data.nodes.filter((node) => {
      if (node.type !== "degreeNode" && node.type !== "bridgeNode") return false;
      if (!allowedByStartingLine(node, triage.startingLine)) return false;
      const matchesVision =
        triage.visions?.length > 0
          ? triage.visions.some((vision) => node.data?.visions?.includes(vision))
          : true;
      const matchesFreeformProgram = freeformMatches.programIds.has(node.id);
      const matchesFreeformVision =
        freeformMatches.visionIds.size > 0
          ? node.data?.visions?.some((vision) => freeformMatches.visionIds.has(vision))
          : false;
      if (!matchesVision && !matchesFreeformProgram && !matchesFreeformVision) return false;

      if (!matchesReadiness(node, triage.mathLevel, triage.codingExperience)) return false;

      const preference =
        triage.credentialType === "Micro-Pathway" ? triage.microPath : triage.degreeLevel;
      if (preference && !matchesPreference(node, preference)) {
        if (!(triage.startingLine === "Transfer Student" && node.id === "cert_pathway")) {
          return false;
        }
      }
      return true;
    });

    return programs.sort((a, b) => a.data.label.localeCompare(b.data.label));
  }, [
    active,
    data.nodes,
    triage.visions,
    triage.mathLevel,
    triage.codingExperience,
    triage.startingLine,
    triage.credentialType,
    triage.microPath,
    triage.degreeLevel,
    freeformMatches,
  ]);

  const fallbackProgram = useMemo(
    () => data.nodes.find((node) => node.id === "general_overview") || null,
    [data.nodes]
  );
  const displayedPrograms =
    matchingPrograms.length > 0 ? matchingPrograms : fallbackProgram ? [fallbackProgram] : [];

  useEffect(() => {
    if (!active) {
      setShowAdvisorCTA(false);
      return;
    }
    if (matchingPrograms.length === 0) {
      setShowAdvisorCTA(true);
    } else {
      setShowAdvisorCTA(false);
    }
  }, [active, matchingPrograms.length]);

  useEffect(() => {
    if (matchingPrograms.length === 0) {
      if (fallbackProgram) {
        setSelectedProgramId(fallbackProgram.id);
      } else {
        setSelectedProgramId(null);
      }
      return;
    }
    if (!selectedProgramId || !matchingPrograms.find((p) => p.id === selectedProgramId)) {
      setSelectedProgramId(matchingPrograms[0].id);
    }
  }, [matchingPrograms, selectedProgramId, fallbackProgram]);

  const selectedProgram = useMemo(
    () => displayedPrograms.find((program) => program.id === selectedProgramId) || null,
    [displayedPrograms, selectedProgramId]
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
            {matchingPrograms.length === 0 && fallbackProgram && (
              <div className="text-sm text-slate-500">
                We’re building a custom path for your unique goals. Here’s a general Bellini overview to get you started.
              </div>
            )}
            {displayedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                selected={selectedProgramId === program.id}
                recommended={
                  (triage.visions?.length
                    ? triage.visions.some((vision) => program.data?.visions?.includes(vision))
                    : false) ||
                  (triage.startingLine === "Transfer Student" && program.id === "cert_pathway") ||
                  matchesReadiness(program, triage.mathLevel, triage.codingExperience) ||
                  freeformMatches.programIds.has(program.id) ||
                  program.data?.visions?.some((vision) => freeformMatches.visionIds.has(vision))
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

      {showAdvisorCTA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-card">
            <div className="text-xs uppercase tracking-[0.3em] text-usf-green">Let’s Build Your Path</div>
            <h3 className="mt-3 text-2xl font-display text-usf-ink">Your goals are unique—and that’s a good thing.</h3>
            <p className="mt-2 text-sm text-slate-600">
              While there isn’t a standard path for this exact combination, we build custom pathways for students like you every day.
              Let’s map your personal roadmap together.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <a
                className="inline-flex items-center justify-center rounded-full bg-usf-green px-5 py-3 text-white font-semibold"
                href="https://www.usf.edu/ai-cybersecurity-computing/"
                target="_blank"
                rel="noreferrer"
              >
                Chat with a Bellini Peer Advisor
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-usf-green px-5 py-3 text-usf-green font-semibold"
                href="https://www.usf.edu/ai-cybersecurity-computing/academics/"
                target="_blank"
                rel="noreferrer"
              >
                Schedule a 15-min Career Strategy Session
              </a>
              <button
                className="text-sm text-slate-500 hover:text-slate-700"
                onClick={() => setShowAdvisorCTA(false)}
              >
                Continue exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
