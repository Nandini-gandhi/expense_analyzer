import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingDown, Wallet, Receipt } from 'lucide-react';
import { getSummary, Summary } from '../services/api';

interface OverviewCardsProps {
  onIncomeClick: () => void;
  onSpendClick: () => void;
  startDate: string;
  endDate: string;
  source: string;
}

export function OverviewCards({ onIncomeClick, onSpendClick, startDate, endDate, source }: OverviewCardsProps) {
  const [summary, setSummary] = useState<Summary>({
    total_income: 0,
    total_spend: 0,
    net_balance: 0,
    total_transactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getSummary({ start_date: startDate, end_date: endDate, source });
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [startDate, endDate, source]);

  const cards = [
    {
      label: 'Total Income',
      value: loading ? '...' : `$${summary.total_income.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-emerald-400 to-green-500',
      delay: 0.3,
      onClick: onIncomeClick
    },
    {
      label: 'Total Spend',
      value: loading ? '...' : `$${summary.total_spend.toFixed(2)}`,
      icon: TrendingDown,
      color: 'from-rose-400 to-red-500',
      delay: 0.4,
      onClick: onSpendClick
    },
    {
      label: 'Net Balance',
      value: loading ? '...' : `$${summary.net_balance.toFixed(2)}`,
      subtitle: loading ? '' : `${summary.net_balance.toFixed(2)}`,
      icon: Wallet,
      color: 'from-amber-400 to-orange-500',
      negative: summary.net_balance < 0,
      delay: 0.5
    },
    {
      label: 'Transactions',
      value: loading ? '...' : `${summary.total_transactions}`,
      icon: Receipt,
      color: 'from-blue-400 to-cyan-500',
      delay: 0.6
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: card.delay, duration: 0.6 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass-card p-6 rounded-3xl relative overflow-hidden group cursor-pointer"
          onClick={card.onClick}
        >
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 text-sm tracking-wide uppercase">{card.label}</span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="text-4xl text-slate-800 mb-1">{card.value}</div>
            
            {card.subtitle && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <TrendingDown className="w-3 h-3" />
                <span>{card.subtitle}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}