import { motion } from "framer-motion";

export default function SuccessStoryModal({ story, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[92%] max-w-lg rounded-3xl bg-white shadow-card p-6 md:p-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-usf-green">Success Story</p>
            <h3 className="mt-2 text-2xl font-display text-usf-ink">{story.name}</h3>
            <p className="text-sm text-slate-600">{story.role}</p>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-usf-mist px-4 py-3 text-sm text-slate-700">
          “{story.quote}”
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Degree Path</div>
          <div className="mt-2 font-semibold text-usf-ink">{story.path}</div>
        </div>

        <button
          className="mt-6 w-full rounded-full bg-usf-green text-white py-3 font-semibold"
          onClick={onClose}
        >
          Back to Explorer
        </button>
      </motion.div>
    </motion.div>
  );
}
