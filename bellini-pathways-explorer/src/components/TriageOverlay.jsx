import { motion } from "framer-motion";

const visionOptions = [
  {
    categoryId: "The Software Architect (CS, CSE)",
    categoryLabel: "Category A: The Software Architect (CS, CSE)",
    statements: [
      "I want to build systems so robust they can handle a billion users at once.",
      "I want to use advanced algorithms to solve global challenges like optimizing energy grids or mapping genomes.",
      "I want to write the complex code behind seamless experiences like instant global communication or real-time digital worlds.",
    ],
  },
  {
    categoryId: "The Systems Engineer (CpE, CSE)",
    categoryLabel: "Category B: The Systems Engineer (CpE, CSE)",
    statements: [
      "I want to forge the circuit-level intelligence and physical hardware inside the next world-changing device.",
      "I want to build \"smart\" infrastructure that allows every physical object to communicate over the internet.",
      "I want to engineer autonomous machines that can navigate the world and make decisions without a human pilot.",
    ],
  },
  {
    categoryId: "The Infrastructure Specialist (BSIT)",
    categoryLabel: "Category C: The Infrastructure Specialist (BSIT)",
    statements: [
      "I want to build and manage the high-speed networks that power the daily operations of an entire smart city.",
      "I want to control the massive cloud server environments that keep global platforms like Netflix or Google online.",
      "I want to lead the elite technical team that detects and fixes massive system outages before they affect the public.",
    ],
  },
  {
    categoryId: "The Cyber Guardian (BSCYS)",
    categoryLabel: "Category D: The Cyber Guardian (BSCYS)",
    statements: [
      "I want to develop unhackable security protocols that keep the private data of millions of people safe from any threat.",
      "I want to infiltrate systems as a \"friendly hacker\" to identify and patch vulnerabilities before criminals can find them.",
      "I want to hunt down international cyber-syndicates by tracking digital fingerprints across the global web.",
    ],
  },
  {
    categoryId: "The AI Pioneer (BSAI, MSAI)",
    categoryLabel: "Category E: The AI Pioneer (BSAI, MSAI)",
    statements: [
      "I want to build AI models that can predict the future—from stock market shifts to breakthroughs in medical cures.",
      "I want to grant machines the human-like ability to see, hear, and reason through massive amounts of information.",
      "I want to create synthetic minds that can hold natural, logical conversations with the nuance of a human.",
    ],
  },
  {
    categoryId: "The Digital Investigator (CS + Criminology)",
    categoryLabel: "Category F: The Digital Investigator (CS + Criminology)",
    statements: [
      "I want to extract hidden evidence from encrypted devices to solve high-stakes, real-world criminal cases.",
      "I want to study the behavioral patterns of cybercriminals to predict and stop their next move.",
      "I want to be the technical authority in the legal fight against identity theft and global financial fraud.",
    ],
  },
  {
    categoryId: "The Tech Business Leader (CS + Business)",
    categoryLabel: "Category G: The Tech Business Leader (CS + Business)",
    statements: [
      "I want to launch my own tech startup and transform a single prototype into a billion-dollar global company.",
      "I want to use data and algorithms to revolutionize how the world handles money and international banking.",
      "I want to lead a legion of engineers to design and ship the tech products that will define the next decade.",
    ],
  },
  {
    categoryId: "The Universal Technologist (CS + Social Science)",
    categoryLabel: "Category H: The Universal Technologist (CS + Social Science)",
    statements: [
      "I want to ensure the logic behind AI is built on a bedrock of transparency, reliability, and human values.",
      "I want to design technology that adapts to the needs of every society and culture across the world.",
      "I want to protect the fundamental right to privacy by advising world leaders on the digital boundaries of the future.",
    ],
  },
];

const visionStatements = visionOptions.flatMap((category) =>
  category.statements.map((statement) => ({
    statement,
    categoryId: category.categoryId,
  }))
);

const statementToCategory = Object.fromEntries(
  visionStatements.map(({ statement, categoryId }) => [statement, categoryId])
);

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
    triage.statementSelections.length === 3 &&
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

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {visionStatements.map(({ statement }) => {
            const active = triage.statementSelections.includes(statement);
            const disabled = !active && triage.statementSelections.length >= 3;
            return (
              <button
                key={statement}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-usf-green bg-usf-mist"
                    : "border-slate-200 hover:border-usf-green"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (disabled) return;
                  setTriage((prev) => {
                    const exists = prev.statementSelections.includes(statement);
                    const nextStatements = exists
                      ? prev.statementSelections.filter((item) => item !== statement)
                      : [...prev.statementSelections, statement];
                    const nextVisions = Array.from(
                      new Set(nextStatements.map((item) => statementToCategory[item]).filter(Boolean))
                    );
                    return {
                      ...prev,
                      statementSelections: nextStatements,
                      visions: nextVisions,
                    };
                  });
                }}
              >
                <div className="text-sm text-slate-700">{statement}</div>
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
            Choose exactly three statements. You can edit these later using the “Edit Triage” button.
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
