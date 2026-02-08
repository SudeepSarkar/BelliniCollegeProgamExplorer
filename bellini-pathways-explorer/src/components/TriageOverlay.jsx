import { motion } from "framer-motion";

const visionOptions = [
  {
    id: "The Architect (CS/CSE)",
    label: "The Architect",
    description: "Build apps and platforms millions use; solve complex puzzles with code.",
  },
  {
    id: "The Designer (CpE/CSE)",
    label: "The Designer",
    description: "Design hardware and circuits; build smart connected devices.",
  },
  {
    id: "The Expert (IT)",
    label: "The Expert",
    description: "Manage networks and cloud infrastructure for large organizations.",
  },
  {
    id: "The Guardian (CyS)",
    label: "The Guardian",
    description: "Create secure systems; act as a friendly hacker to find holes.",
  },
  {
    id: "The Pioneer (AI)",
    label: "The Pioneer",
    description: "Build AI that predicts and learns; create next-gen chatbots.",
  },
  {
    id: "The Investigator (CS+Criminology)",
    label: "The Investigator",
    description: "Find digital evidence and study cybercriminal behavior.",
  },
  {
    id: "The Leader (CS+Business)",
    label: "The Leader",
    description: "Launch a startup; lead teams building the future.",
  },
  {
    id: "The Ethicist (CS+Social Sciences)",
    label: "The Ethicist",
    description: "Make AI fair and advise on privacy and policy.",
  },
];

const startingLineOptions = [
  "High School / First-Year",
  "Current USF Student",
  "Transfer Student",
  "Working Professional / Career Switcher",
];

const mathLevelOptions = [
  "Foundational: Algebra & Geometry",
  "Intermediate: Pre-Calculus / Trigonometry",
  "Advanced: AP Calculus or higher",
];

const codingExperienceOptions = ["New to coding", "Some coding background"];

const credentialTypeOptions = ["Degree", "Micro-Pathway"];

const degreeOptions = ["BS", "MS", "PhD"];
const microOptions = ["Minor", "Certificate", "Microcredential"];

const careerGoalOptions = ["Industry", "Public Sector", "Academia"];

function buildSteps(startingLine, credentialType) {
  return [
    {
      key: "startingLine",
      title: "Step A: The Starting Line",
      options: startingLineOptions,
    },
    {
      key: "mathLevel",
      title: "Step B: Math Readiness",
      options: mathLevelOptions,
    },
    {
      key: "codingExperience",
      title: "Step B: Coding Experience",
      options: codingExperienceOptions,
    },
    {
      key: "credentialType",
      title: "Step C: Preferred Credential",
      options: credentialTypeOptions,
    },
    {
      key: credentialType === "Micro-Pathway" ? "microPath" : "degreeLevel",
      title: credentialType === "Micro-Pathway" ? "Step C: Micro-Pathway Type" : "Step C: Degree Level",
      options: credentialType === "Micro-Pathway" ? microOptions : degreeOptions,
    },
    {
      key: "careerGoal",
      title: "Step D: Career Goal",
      options: careerGoalOptions,
    },
  ];
}

export default function TriageOverlay({ triage, setTriage, onComplete }) {
  const steps = buildSteps(triage.startingLine, triage.credentialType);
  const isComplete =
    triage.visions.length === 3 &&
    steps.every((step) => triage[step.key]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[92%] max-w-3xl rounded-3xl bg-white shadow-card p-6 md:p-10 my-10 max-h-[88vh] overflow-y-auto"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-usf-green">Future-Maker Quiz</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-display text-usf-ink">
          Build your vision
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Pick your top three “I want” statements. Then we’ll map your vision to an achievable pathway.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visionOptions.map((vision) => {
            const active = triage.visions.includes(vision.id);
            const disabled = !active && triage.visions.length >= 3;
            return (
              <button
                key={vision.id}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-usf-green bg-usf-mist"
                    : "border-slate-200 hover:border-usf-green"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (disabled) return;
                  setTriage((prev) => {
                    const exists = prev.visions.includes(vision.id);
                    const next = exists
                      ? prev.visions.filter((item) => item !== vision.id)
                      : [...prev.visions, vision.id];
                    return { ...prev, visions: next };
                  });
                }}
              >
                <div className="font-semibold text-slate-800">{vision.label}</div>
                <div className="mt-2 text-sm text-slate-600">{vision.description}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-usf-green">Background Triage</p>
          <h3 className="mt-2 text-xl font-display text-usf-ink">Map vision to reality</h3>
          <p className="mt-2 text-sm text-slate-600">
            We’ll filter by readiness and destination to recommend realistic next steps.
          </p>

          <div className="mt-6 grid gap-6">
            {steps.map((step) => (
              <div key={step.key}>
                <div className="text-sm font-semibold text-slate-700">{step.title}</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {step.options.map((option) => {
                    const active = triage[step.key] === option;
                    return (
                      <button
                        key={option}
                        className={`px-4 py-2 rounded-full border transition ${
                          active
                            ? "bg-usf-green text-white border-usf-green"
                            : "bg-white text-slate-700 border-slate-200 hover:border-usf-green"
                        }`}
                        onClick={() =>
                          setTriage((prev) => ({
                            ...prev,
                            [step.key]: option,
                            ...(step.key === "startingLine"
                              ? {
                                  mathLevel: "",
                                  codingExperience: "",
                                  credentialType: "",
                                  degreeLevel: "",
                                  microPath: "",
                                  careerGoal: "",
                                }
                              : {}),
                            ...(step.key === "credentialType"
                              ? { degreeLevel: "", microPath: "" }
                              : {}),
                          }))
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky bottom-0 bg-white/95 py-4">
          <p className="text-xs text-slate-500">
            Choose exactly three vision statements. You can edit these later using the “Edit Triage” button.
          </p>
          <button
            className={`px-6 py-3 rounded-full text-white font-semibold transition ${
              isComplete ? "bg-usf-green hover:bg-[#00543b]" : "bg-slate-300 cursor-not-allowed"
            }`}
            disabled={!isComplete}
            onClick={onComplete}
          >
            Submit & See Programs
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
