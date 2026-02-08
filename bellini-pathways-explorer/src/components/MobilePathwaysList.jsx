import { useMemo, useState } from "react";

const steps = [
  { id: "inputs", label: "Inputs" },
  { id: "programs", label: "Programs" },
  { id: "credentials", label: "Credentials" },
  { id: "outcomes", label: "Outcomes" },
];

function categorize(node) {
  if (node.type === "careerNode") return "outcomes";
  if (node.type === "inputNode") return "inputs";
  const kind = node.data?.kind || "";
  if (kind.includes("microcredential") || kind.includes("grad certificate")) return "credentials";
  if (kind.includes("undergraduate") || kind.includes("interdisciplinary") || kind.includes("minor")) return "programs";
  if (kind.includes("graduate")) return "programs";
  if (kind.includes("input")) return "inputs";
  return "programs";
}

export default function MobilePathwaysList({ data, triage, active }) {
  const [activeStep, setActiveStep] = useState("inputs");

  const grouped = useMemo(() => {
    return data.nodes.reduce(
      (acc, node) => {
        const group = categorize(node);
        acc[group].push(node);
        return acc;
      },
      { inputs: [], programs: [], credentials: [], outcomes: [] }
    );
  }, [data.nodes]);

  return (
    <div className="rounded-3xl bg-white shadow-card p-4">
      <div className="flex gap-2 overflow-x-auto pb-3">
        {steps.map((step) => (
          <button
            key={step.id}
            className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap ${
              activeStep === step.id
                ? "bg-usf-green text-white border-usf-green"
                : "bg-white text-slate-700 border-slate-200"
            }`}
            onClick={() => setActiveStep(step.id)}
          >
            {step.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {grouped[activeStep].map((node) => (
          <div key={node.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-800">{node.data.label}</div>
            <div className="text-xs text-slate-500 mt-1">{node.data.kind}</div>
            {node.data.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {node.data.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {node.data.skills?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {node.data.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <button
          className="px-3 py-1.5 rounded-full border border-slate-200"
          onClick={() => {
            const index = steps.findIndex((step) => step.id === activeStep);
            const next = steps[Math.max(0, index - 1)];
            setActiveStep(next.id);
          }}
          disabled={activeStep === steps[0].id}
        >
          Back
        </button>
        <div>{active ? "Personalized" : "Browse"} view</div>
        <button
          className="px-3 py-1.5 rounded-full border border-slate-200"
          onClick={() => {
            const index = steps.findIndex((step) => step.id === activeStep);
            const next = steps[Math.min(steps.length - 1, index + 1)];
            setActiveStep(next.id);
          }}
          disabled={activeStep === steps[steps.length - 1].id}
        >
          Next
        </button>
      </div>
    </div>
  );
}
