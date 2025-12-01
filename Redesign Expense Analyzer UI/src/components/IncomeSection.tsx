import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

export function IncomeSection() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mb-8"
    >
      <h3 className="text-3xl text-slate-800 mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>Income</h3>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="glass-card p-6 rounded-2xl bg-gradient-to-r from-emerald-100/60 to-green-100/60 border border-emerald-200/50 inline-block cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-800">
            Total Income - <span className="text-emerald-600">$14.32</span> <span className="text-slate-600">(1 transaction)</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}