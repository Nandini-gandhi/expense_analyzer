import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCategories, CategoryData } from '../services/api';

interface CategoryBreakdownProps {
  onCategoryClick: (category: string, emoji: string, color: string) => void;
  startDate: string;
  endDate: string;
  source: string;
}

// Category emoji and color mapping
const categoryConfig: Record<string, { emoji: string; color: string; chartColor: string }> = {
  'Groceries': { emoji: '🛒', color: 'from-emerald-400 to-green-500', chartColor: '#4ade80' },
  'Dining': { emoji: '🍽️', color: 'from-yellow-400 to-amber-500', chartColor: '#fbbf24' },
  'Personal': { emoji: '💆', color: 'from-purple-400 to-violet-500', chartColor: '#a78bfa' },
  'Bills': { emoji: '📄', color: 'from-rose-400 to-red-500', chartColor: '#f87171' },
  'Travel': { emoji: '✈️', color: 'from-sky-400 to-blue-500', chartColor: '#38bdf8' },
  'Entertainment': { emoji: '🎭', color: 'from-orange-400 to-red-500', chartColor: '#fb923c' },
  'Shopping': { emoji: '🛍️', color: 'from-lime-400 to-green-600', chartColor: '#84cc16' },
  'Education': { emoji: '📚', color: 'from-teal-400 to-cyan-500', chartColor: '#2dd4bf' },
  'Health': { emoji: '🏥', color: 'from-pink-400 to-rose-500', chartColor: '#f472b6' },
  'Home': { emoji: '🏠', color: 'from-indigo-400 to-blue-500', chartColor: '#818cf8' },
  'Finance': { emoji: '💳', color: 'from-cyan-400 to-teal-500', chartColor: '#22d3ee' },
  'Other': { emoji: '📦', color: 'from-gray-400 to-slate-500', chartColor: '#94a3b8' }
};

export function CategoryBreakdown({ onCategoryClick, startDate, endDate, source }: CategoryBreakdownProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories({ start_date: startDate, end_date: endDate, source });
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [startDate, endDate, source]);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="glass-card p-8 rounded-3xl"
    >
      <h3 className="text-3xl text-slate-800 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>By Category</h3>
      <div className="text-slate-600 text-sm mb-6">Expense breakdown by category</div>
      
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No expenses in this period</div>
      ) : (
        <div className="space-y-3">
          {categories.map((category, index) => {
            const config = categoryConfig[category.category] || categoryConfig['Other'];
            return (
              <motion.div
                key={category.category}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                whileHover={{ x: 8, scale: 1.02 }}
                className="relative group"
                onClick={() => onCategoryClick(category.category, config.emoji, config.chartColor)}
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-all cursor-pointer overflow-hidden border border-slate-200/50">
                  {/* Background progress bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ delay: 0.9 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                    className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-15 rounded-xl`}
                  />
                  
                  <div className="relative z-10 flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color} shadow-lg`} />
                    <span className="text-slate-800">{category.category}</span>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <span className="text-slate-800">${category.amount.toFixed(0)}</span>
                    <span className="text-slate-600 text-sm min-w-[3rem] text-right">({category.percentage}%)</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}