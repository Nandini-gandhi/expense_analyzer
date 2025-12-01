/**
 * Shared transaction page component for CategoryPage, AllExpensesPage, IncomePage
 * This reduces code duplication and ensures consistent behavior
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTransactions, Transaction } from '../services/api';

interface TransactionPageProps {
  title: string;
  emoji: string;
  onBack: () => void;
  startDate: string;
  endDate: string;
  source: string;
  category?: string; // If specified, filter by this category
  showCategoryColumn?: boolean; // Whether to show category column in table
}

export function TransactionPage({ 
  title, 
  emoji, 
  onBack, 
  startDate, 
  endDate, 
  source,
  category,
  showCategoryColumn = false
}: TransactionPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'count'>('amount');
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(10000);
  const [merchantFilter, setMerchantFilter] = useState('');

  console.log('TransactionPage rendered with props:', {
    title,
    category,
    startDate,
    endDate,
    source,
    showCategoryColumn
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await getTransactions({
          start_date: startDate,
          end_date: endDate,
          source,
          category,
          min_amount: minAmount,
          max_amount: maxAmount,
          merchant_search: merchantFilter
        });
        
        console.log('TransactionPage received data:', {
          count: result.count,
          transactionsLength: result.transactions?.length,
          firstTransaction: result.transactions?.[0]
        });
        
        let sorted = [...result.transactions];
        if (sortBy === 'amount') {
          sorted.sort((a, b) => b.amount_spend - a.amount_spend);
        } else if (sortBy === 'date') {
          sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        
        setTransactions(sorted);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [startDate, endDate, source, category, minAmount, maxAmount, merchantFilter, sortBy]);

  // Calculate summary stats
  const total = transactions.reduce((sum, t) => sum + (category === 'Income' ? t.amount_signed : t.amount_spend), 0);
  const count = transactions.length;
  const average = count > 0 ? total / count : 0;
  const uniqueMerchants = new Set(transactions.map(t => t.merchant)).size;

  // Top merchants data
  const merchantTotals: Record<string, number> = {};
  transactions.forEach(t => {
    const amt = category === 'Income' ? t.amount_signed : t.amount_spend;
    merchantTotals[t.merchant] = (merchantTotals[t.merchant] || 0) + amt;
  });
  const topMerchantsData = Object.entries(merchantTotals)
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Daily trend data
  const dailyTotals: Record<string, number> = {};
  transactions.forEach(t => {
    const dateKey = t.date.split(' ')[0];
    const amt = category === 'Income' ? t.amount_signed : t.amount_spend;
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + amt;
  });
  const dailyTrendData = Object.entries(dailyTotals)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />
      
      <div className="flex min-h-screen">
        {/* Left Sidebar - Filter & Sort */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-56 p-6 pt-32 space-y-6"
        >
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📅</span>
              <span className="text-slate-800">Date Range</span>
            </div>
            <div className="text-slate-700 text-sm">{startDate} to {endDate}</div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔍</span>
              <span className="text-slate-800">Filter & Sort</span>
            </div>
            
            <div className="space-y-3">
              <div className="text-slate-700 text-sm mb-2">Sort by:</div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="sort" 
                  checked={sortBy === 'amount'} 
                  onChange={() => setSortBy('amount')}
                  className="text-blue-500" 
                />
                <span>Amount (High→Low)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="sort" 
                  checked={sortBy === 'date'}
                  onChange={() => setSortBy('date')}
                  className="text-blue-500" 
                />
                <span>Date (Newest)</span>
              </label>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="text-slate-700 text-sm mb-2">Min ($)</div>
            <input 
              type="number" 
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="text-slate-700 text-sm mb-2">Max ($)</div>
            <input 
              type="number" 
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <div className="text-slate-700 text-sm mb-3">Merchant/Description</div>
            <input 
              type="text"
              placeholder="Filter..."
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
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
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl">{emoji}</span>
              <h1 className="text-5xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Expense Analyzer</h1>
            </div>
            
            <div className="flex items-center justify-between">
              <h2 className="text-3xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>{title}</h2>
              <button
                onClick={onBack}
                className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 text-slate-700 hover:bg-white/60 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-4 gap-6 mb-8"
          >
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-slate-600 text-sm mb-2">Total</div>
              <div className="text-3xl text-slate-800">
                {loading ? '...' : `$${total.toFixed(2)}`}
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-slate-600 text-sm mb-2">Transactions</div>
              <div className="text-3xl text-slate-800">{loading ? '...' : count}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-slate-600 text-sm mb-2">Average</div>
              <div className="text-3xl text-slate-800">
                {loading ? '...' : `$${average.toFixed(2)}`}
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-slate-600 text-sm mb-2">Unique Merchants</div>
              <div className="text-3xl text-slate-800">{loading ? '...' : uniqueMerchants}</div>
            </div>
          </motion.div>

          {/* Transactions Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-card p-8 rounded-3xl mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📋</span>
              <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Transactions</h3>
            </div>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No transactions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 text-slate-600 text-sm">Date</th>
                      <th className="text-left py-3 text-slate-600 text-sm">Merchant</th>
                      <th className="text-left py-3 text-slate-600 text-sm">Amount</th>
                      {showCategoryColumn && <th className="text-left py-3 text-slate-600 text-sm">Category</th>}
                      <th className="text-left py-3 text-slate-600 text-sm">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-white/40 transition-colors">
                        <td className="py-3 text-slate-700 text-sm">{transaction.date}</td>
                        <td className="py-3 text-slate-700 text-sm">{transaction.merchant}</td>
                        <td className="py-3 text-slate-700 text-sm">
                          ${(category === 'Income' ? transaction.amount_signed : transaction.amount_spend).toFixed(2)}
                        </td>
                        {showCategoryColumn && <td className="py-3 text-slate-700 text-sm">{transaction.category}</td>}
                        <td className="py-3 text-slate-700 text-sm">{transaction.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Charts Section */}
          {!loading && transactions.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="glass-card p-8 rounded-3xl mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📊</span>
                <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Charts</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Top Merchants */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📈</span>
                    <h4 className="text-xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Top Merchants</h4>
                  </div>
                  <div className="text-slate-600 text-sm mb-4">Top Merchants in {title}</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topMerchantsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="merchant" type="category" width={100} stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#f97316" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Trend */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📅</span>
                    <h4 className="text-xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Daily Trend</h4>
                  </div>
                  <div className="text-slate-600 text-sm mb-4">Daily Breakdown</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#4ade80" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
