import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDailySpend } from '../services/api';

interface SpendingChartProps {
  startDate: string;
  endDate: string;
  source: string;
}

export function SpendingChart({ startDate, endDate, source }: SpendingChartProps) {
  const [data, setData] = useState<{ date: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDailySpend({ start_date: startDate, end_date: endDate, source });
        setData(result.daily_spend);
      } catch (error) {
        console.error('Error fetching daily spend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, source]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="glass-card p-8 rounded-3xl"
    >
      <h3 className="text-3xl text-slate-800 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>Spending Trend</h3>
      <div className="text-slate-600 text-sm mb-8">Daily spending over time</div>
      
      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-slate-500">Loading...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-slate-500">No spending data for this period</div>
        </div>
      ) : (
        <div className="h-[400px] -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(71, 85, 105, 0.5)"
                tick={{ fill: 'rgba(71, 85, 105, 0.8)', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}-${date.getDate()}`;
                }}
              />
              <YAxis 
                stroke="rgba(71, 85, 105, 0.5)"
                tick={{ fill: 'rgba(71, 85, 105, 0.8)', fontSize: 12 }}
                label={{ 
                  value: 'Daily Spend ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'rgba(71, 85, 105, 0.8)', fontSize: 12 }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '12px',
                  color: '#1e293b',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#3b82f6' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}