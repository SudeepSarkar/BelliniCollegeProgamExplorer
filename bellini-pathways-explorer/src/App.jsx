import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PathBuilder from "./components/PathBuilder.jsx";
import TriageOverlay from "./components/TriageOverlay.jsx";
import SuccessStoryModal from "./components/SuccessStoryModal.jsx";
import data from "./data.json";

const successStories = {
  alumni_industry: {
    name: "Maya Alvarez",
    role: "Security Engineer, Sentinel Labs",
    quote:
      "The Bellini bridge program gave me the confidence to shift from biology into cyber. I landed my first security role before graduation.",
    path: "Non-Computing BS → Bridge Program → MS in Cybersecurity",
  },
  alumni_research: {
    name: "Ravi Deshmukh",
    role: "AI Researcher, Coastal Innovation Lab",
    quote:
      "I went from the AI undergraduate track to publishing with faculty in my second year. The pathway kept me focused.",
    path: "High School → BS in Artificial Intelligence → MS in Artificial Intelligence",
  },
  alumni_academia: {
    name: "Elena Cruz",
    role: "Assistant Professor, State University",
    quote:
      "The PhD pathway connected me with interdisciplinary mentors and prepared me to teach and lead research teams.",
    path: "High School → BS in Data Science → PhD in Computing",
  },
};

export default function App() {
  const [triage, setTriage] = useState({
    visions: [],
    startingLine: "",
    mathLevel: "",
    codingExperience: "",
    credentialType: "",
    degreeLevel: "",
    microPath: "",
    careerGoal: "",
  });
  const [triageComplete, setTriageComplete] = useState(false);
  const [activeStory, setActiveStory] = useState(null);

  const handleNodeSelect = (node) => {
    if (node?.data?.storyId && successStories[node.data.storyId]) {
      setActiveStory(successStories[node.data.storyId]);
      return;
    }
  };

  const graphData = useMemo(() => data, []);

  return (
    <div className="min-h-screen">
      <header className="px-6 pt-8 pb-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm uppercase tracking-[0.4em] text-usf-green">Bellini College</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-display text-usf-ink">
            Pathways Explorer
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-600 max-w-3xl">
            Map your background to programs and careers. Explore left-to-right pathways and spotlight the opportunities that fit your goals.
          </p>
        </div>
      </header>

      <main className="px-4 pb-12 md:px-12">
        <div className="max-w-6xl mx-auto relative">
          <PathBuilder
            data={graphData}
            triage={triage}
            active={triageComplete}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </main>

      <AnimatePresence>
        {!triageComplete && (
          <TriageOverlay
            triage={triage}
            setTriage={setTriage}
            onComplete={() => setTriageComplete(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStory && (
          <SuccessStoryModal
            story={activeStory}
            onClose={() => setActiveStory(null)}
          />
        )}
      </AnimatePresence>

      {triageComplete && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="fixed bottom-6 right-6 px-4 py-2 rounded-full bg-usf-green text-white shadow-card"
          onClick={() => setTriageComplete(false)}
        >
          Edit Triage
        </motion.button>
      )}
    </div>
  );
}
