import { motion } from "framer-motion";

const startingPointOptions = [
  "High school or first-year",
  "Current USF student",
  "Transfer student",
  "Working professional / career switcher",
];

const interestOptions = [
  "Building software & apps",
  "Protecting systems & data",
  "Working with data & patterns",
  "Making computers learn",
  "Hardware & devices",
  "Tech + society/business",
];

const foundationOptions = [
  "Algebra & geometry",
  "Pre-Calculus / Trig",
  "AP Calculus or higher",
  "Some coding / basic math",
  "New to coding",
];

const preferenceOptions = ["BS", "MS", "PhD", "Minor", "Certificate", "Microcredential"];

const careerGoalOptions = ["Job in industry", "Government", "National labs", "Academia"];

function buildSteps(startingPoint) {
  const steps = [
    {
      key: "startingPoint",
      title: "Starting Point",
      options: startingPointOptions,
    },
  ];

  const interestTitle =
    startingPoint === "High school or first-year"
      ? "What sounds most interesting?"
      : "What type of work do you prefer?";

  steps.push({
    key: "interest",
    title: interestTitle,
    options: interestOptions,
  });

  const foundationTitle =
    startingPoint === "High school or first-year"
      ? "Math preparation"
      : "Math + coding readiness";

  steps.push({
    key: "foundation",
    title: foundationTitle,
    options: foundationOptions,
  });

  steps.push({
    key: "preference",
    title: "Preferred level",
    options: preferenceOptions,
  });

  steps.push({
    key: "careerGoal",
    title: "Career Goal",
    options: careerGoalOptions,
  });

  return steps;
}

export default function TriageOverlay({ triage, setTriage, onComplete }) {
  const steps = buildSteps(triage.startingPoint);
  const isComplete = steps.every((step) => triage[step.key]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[92%] max-w-2xl rounded-3xl bg-white shadow-card p-6 md:p-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-usf-green">Triage</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-display text-usf-ink">
          Tell us where you are headed
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Pick one option from each step to spotlight the pathways that match your background and goals.
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
                          ...(step.key === "startingPoint"
                            ? { interest: "", foundation: "", preference: "", careerGoal: "" }
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

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-slate-500">
            You can edit these choices later using the “Edit Triage” button.
          </p>
          <button
            className={`px-6 py-3 rounded-full text-white font-semibold transition ${
              isComplete ? "bg-usf-green hover:bg-[#00543b]" : "bg-slate-300 cursor-not-allowed"
            }`}
            disabled={!isComplete}
            onClick={onComplete}
          >
            Explore Paths
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
