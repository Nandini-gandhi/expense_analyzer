import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategories } from '../services/api';

interface InteractivePieChartProps {
  startDate: string;
  endDate: string;
  source: string;
}

const categoryColors: Record<string, string> = {
  'Groceries': '#4ade80',
  'Dining': '#fbbf24',
  'Personal': '#a78bfa',
  'Bills': '#f87171',
  'Travel': '#38bdf8',
  'Entertainment': '#fb923c',
  'Shopping': '#84cc16',
  'Education': '#2dd4bf',
  'Health': '#f472b6',
  'Home': '#818cf8',
  'Finance': '#22d3ee',
  'Other': '#94a3b8'
};

export function InteractivePieChart({ startDate, endDate, source }: InteractivePieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getCategories({ start_date: startDate, end_date: endDate, source });
        const chartData = result.categories.map(cat => ({
          name: cat.category,
          value: cat.amount,
          color: categoryColors[cat.category] || categoryColors['Other']
        }));
        setData(chartData);
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, source]);

  if (loading) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="glass-card p-8 rounded-3xl"
      >
        <h3 className="text-3xl text-slate-800 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>Breakdown</h3>
        <div className="text-slate-600 text-sm mb-6">Spending by Category</div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-slate-500">Loading...</div>
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="glass-card p-8 rounded-3xl"
      >
        <h3 className="text-3xl text-slate-800 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>Breakdown</h3>
        <div className="text-slate-600 text-sm mb-6">Spending by Category</div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-slate-500">No expenses in this period</div>
        </div>
      </motion.div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="glass-card p-3 rounded-xl">
          <p className="text-slate-800">{data.name}</p>
          <p className="text-slate-600 text-sm">${data.value}</p>
          <p className="text-slate-500 text-xs">
            {((data.value / total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="glass-card p-8 rounded-3xl"
    >
      <h3 className="text-3xl text-slate-800 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>Breakdown</h3>
      <div className="text-slate-600 text-sm mb-6">Spending by Category</div>
      
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.3}
                style={{ 
                  filter: hoveredIndex === index ? 'brightness(1.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}