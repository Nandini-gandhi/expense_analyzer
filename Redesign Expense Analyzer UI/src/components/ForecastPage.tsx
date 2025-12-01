import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getForecast, ForecastData } from '../services/api';

interface ForecastPageProps {
  onBack: () => void;
}

export function ForecastPage({ onBack }: ForecastPageProps) {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthsLookback, setMonthsLookback] = useState(6);
  const [excludeMonths, setExcludeMonths] = useState<string[]>([]);
  const [excludeCategories, setExcludeCategories] = useState<string[]>([]);
  
  // Generate last 12 months for exclusion options
  const [availableMonths] = useState(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const displayName = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push({ value: yearMonth, display: displayName });
    }
    return months;
  });
  
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        
        const data = await getForecast({
          months_lookback: monthsLookback,
          exclude_months: excludeMonths,
          exclude_categories: excludeCategories
        });
        setForecastData(data);
        
        // Extract unique categories and keep all categories even if excluded
        if (data.by_category.length > 0) {
          const cats = data.by_category
            .map(c => c.category)
            .filter(c => c !== 'Income' && c !== 'EXCLUDE');
          
          // Merge with existing categories to keep excluded ones visible
          setAllCategories(prev => {
            const combined = new Set([...prev, ...cats, ...excludeCategories]);
            return Array.from(combined).filter(c => c !== 'Income' && c !== 'EXCLUDE');
          });
        }
      } catch (error) {
        console.error('Error fetching forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [monthsLookback, excludeMonths, excludeCategories]);

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthsLookback(Number(e.target.value));
  };

  const toggleExcludeMonth = (month: string) => {
    setExcludeMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const toggleExcludeCategory = (category: string) => {
    setExcludeCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Prepare chart data
  const totalSpendData = forecastData ? [
    { label: 'Low\n(±1σ)', value: Math.round(forecastData.total.confidence_low), color: '#fb923c' },
    { label: 'Expected', value: Math.round(forecastData.total.avg_spend), color: '#4ade80' },
    { label: 'High\n(±1σ)', value: Math.round(forecastData.total.confidence_high), color: '#f87171' },
  ] : [];

  const categoryForecastData = forecastData?.by_category
    .filter(c => c.category !== 'Income' && c.category !== 'EXCLUDE')
    .map(c => ({
      category: c.category,
      avg: Math.round(c.avg_spend),
      low: Math.round(c.confidence_low),
      high: Math.round(c.confidence_high)
    })) || [];

  const categoryBarData = categoryForecastData.map(c => ({
    category: c.category,
    value: c.avg,
    color: '#60a5fa'
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />
      
      <div className="flex min-h-screen">
        {/* Left Sidebar - Forecast Settings */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-56 p-6 pt-32 space-y-6"
        >
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔮</span>
              <span className="text-slate-800">Forecast Settings</span>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="text-slate-700 text-sm mb-3">Months to analyze:</div>
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={monthsLookback}
              onChange={handleMonthsChange}
              className="w-full accent-blue-500"
            />
            <div className="text-slate-600 text-xs text-center mt-1">{monthsLookback} months</div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="text-slate-700 text-sm mb-3">Exclude anomaly months:</div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {availableMonths.map(month => (
                <label key={month.value} className="flex items-center gap-2 cursor-pointer hover:bg-white/40 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={excludeMonths.includes(month.value)}
                    onChange={() => toggleExcludeMonth(month.value)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-slate-700 text-sm">{month.display}</span>
                </label>
              ))}
            </div>
            {excludeMonths.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                {excludeMonths.length} month{excludeMonths.length !== 1 ? 's' : ''} excluded
              </div>
            )}
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="text-slate-700 text-sm mb-3">Exclude Categories</div>
            <div className="text-slate-600 text-xs mb-2">Exclude from forecast:</div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {allCategories.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-white/40 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={excludeCategories.includes(category)}
                    onChange={() => toggleExcludeCategory(category)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-slate-700 text-sm">{category}</span>
                </label>
              ))}
            </div>
            {excludeCategories.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                {excludeCategories.length} categor{excludeCategories.length !== 1 ? 'ies' : 'y'} excluded
              </div>
            )}
          </div>
        </motion.div>

        {/* Vertical Separator */}
        <div className="w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 my-8 shadow-sm" />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">🔮</span>
                <h1 className="text-5xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Forecast</h1>
              </div>
              <button
                onClick={onBack}
                className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 text-slate-700 hover:bg-white/60 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </motion.div>

          {/* Total Spend Forecast & By Category Forecast Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Total Spend Forecast */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="glass-card p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">💰</span>
                <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Total Spend Forecast</h3>
              </div>

              <div className="mb-6">
                <div className="text-slate-600 text-sm mb-2">Predicted Monthly Avg</div>
                <div className="text-4xl text-slate-800 mb-1">
                  {loading ? '...' : `$${forecastData ? forecastData.total.avg_spend.toFixed(0) : '0'}`}
                </div>
                {forecastData && (
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>📈 Range (±1σ): ${forecastData.total.confidence_low.toFixed(0)} – ${forecastData.total.confidence_high.toFixed(0)}</div>
                    <div>📉 Min: ${forecastData.total.min_spend.toFixed(0)} | Max: ${forecastData.total.max_spend.toFixed(0)}</div>
                    <div>📊 Std Dev: ${forecastData.total.std_dev.toFixed(0)}</div>
                    <div>📅 Based on {forecastData.total.num_months} months</div>
                  </div>
                )}
              </div>

              <div className="text-slate-700 text-sm mb-4">Total Monthly Spend Forecast</div>
              {loading ? (
                <div className="flex items-center justify-center h-[300px] text-slate-500">Loading forecast...</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={totalSpendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {totalSpendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-2">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                      Target: ${forecastData?.total.confidence_high.toFixed(0)}
                    </span>
                  </div>
                </>
              )}
            </motion.div>

            {/* By Category Forecast */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="glass-card p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📊</span>
                <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>By Category Forecast</h3>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center h-[200px] text-slate-500">Loading categories...</div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 text-slate-600">Category</th>
                          <th className="text-left py-2 text-slate-600">Avg</th>
                          <th className="text-left py-2 text-slate-600">Low (±1σ)</th>
                          <th className="text-left py-2 text-slate-600">High (±1σ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryForecastData.map((item, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-white/40 transition-colors">
                            <td className="py-2 text-slate-700">{item.category}</td>
                            <td className="py-2 text-slate-700">${item.avg}</td>
                            <td className="py-2 text-slate-700">${item.low}</td>
                            <td className="py-2 text-slate-700">${item.high}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="text-slate-700 text-sm mb-4">Forecast by Category</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="category" type="category" width={100} stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#60a5fa" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}