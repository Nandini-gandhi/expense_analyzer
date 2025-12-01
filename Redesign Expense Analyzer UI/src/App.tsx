import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Menu, MessageCircle } from 'lucide-react';
import { OverviewCards } from './components/OverviewCards';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { SpendingChart } from './components/SpendingChart';
import { CategoryPage } from './components/CategoryPage';
import { ForecastPage } from './components/ForecastPage';
import { AllExpensesPage } from './components/AllExpensesPage';
import { IncomePage } from './components/IncomePage';
import { InteractivePieChart } from './components/InteractivePieChart';
import { SettingsPage } from './components/SettingsPage';
import { OnboardingPage } from './components/OnboardingPage';
import { ChatBot } from './components/ChatBot';
import { getDateRange, listFiles } from './services/api';

export default function App() {
  // Get current month as default
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(formatDate(firstDay));
  const [endDate, setEndDate] = useState(formatDate(lastDay));
  const [selectedSource, setSelectedSource] = useState('All');
  const [currentView, setCurrentView] = useState<'main' | 'category' | 'forecast' | 'allExpenses' | 'income' | 'settings'>('main');
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; emoji: string; color: string } | null>(null);
  const [hasFiles, setHasFiles] = useState<boolean | null>(null); // null = loading, true/false = result
  const [chatOpen, setChatOpen] = useState(false);
  
  // Check if files exist on mount
  useEffect(() => {
    listFiles().then(data => {
      setHasFiles(data.files && data.files.length > 0);
    }).catch(() => {
      setHasFiles(false);
    });
  }, []);
  
  // Load date range from backend on mount
  useEffect(() => {
    getDateRange().then(range => {
      if (range.min_date && range.max_date) {
        // Default to current month or last month with data
        const maxDate = new Date(range.max_date);
        const monthStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        const monthEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        setStartDate(formatDate(monthStart));
        setEndDate(formatDate(monthEnd));
      }
    }).catch(console.error);
  }, []);

  const handleCategoryClick = (category: string, emoji: string, color: string) => {
    setSelectedCategory({ name: category, emoji, color });
    setCurrentView('category');
  };

  const handleViewForecast = () => {
    setCurrentView('forecast');
  };

  const handleIncomeClick = () => {
    setCurrentView('income');
  };

  const handleSpendClick = () => {
    setCurrentView('allExpenses');
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleBack = () => {
    setCurrentView('main');
    setSelectedCategory(null);
  };

  // Show loading while checking for files
  if (hasFiles === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe]">
        <div className="text-slate-600 text-lg">Loading...</div>
      </div>
    );
  }

  // Show onboarding if no files exist
  if (hasFiles === false) {
    return <OnboardingPage onComplete={() => setHasFiles(true)} />;
  }

  // Render settings page
  if (currentView === 'settings') {
    return <SettingsPage onBack={handleBack} startDate={startDate} endDate={endDate} />;
  }

  // Render category page
  if (currentView === 'category' && selectedCategory) {
    return <CategoryPage 
      category={selectedCategory.name} 
      emoji={selectedCategory.emoji} 
      color={selectedCategory.color} 
      onBack={handleBack}
      startDate={startDate}
      endDate={endDate}
      source={selectedSource}
    />;
  }

  // Render forecast page
  if (currentView === 'forecast') {
    return <ForecastPage onBack={handleBack} />;
  }

  // Render all expenses page
  if (currentView === 'allExpenses') {
    return <AllExpensesPage 
      onBack={handleBack}
      startDate={startDate}
      endDate={endDate}
      source={selectedSource}
    />;
  }

  // Render income page
  if (currentView === 'income') {
    return <IncomePage 
      onBack={handleBack}
      startDate={startDate}
      endDate={endDate}
      source={selectedSource}
    />;
  }

  // Render main page
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Softer, lighter gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />
      
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-56 p-6 pt-32 space-y-6 bg-white/80 backdrop-blur-sm border-r border-slate-200 z-10"
        >
          {/* Date Range */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-slate-800">Date Range</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 text-xs mb-1 block">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-600 text-xs mb-1 block">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* View Forecast Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20"
            onClick={handleViewForecast}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff', fontWeight: '500' }}>View Forecast</span>
            </div>
          </motion.button>

          {/* AI Chat Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => {
              console.log('AI Assistant button clicked!');
              console.log('Current chatOpen state:', chatOpen);
              setChatOpen(true);
              console.log('setChatOpen(true) called');
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #db2777)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #a855f7, #ec4899)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <MessageCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
              <span style={{ color: '#ffffff', fontWeight: '500' }}>AI Assistant</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Vertical Separator */}
        <div style={{ width: '2px' }} className="bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 my-8 shadow-sm" />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-6xl text-slate-800" style={{ fontFamily: "Crimson Pro, serif" }}>Expense Analyzer</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card p-3 rounded-xl hover:bg-white/60 transition-all"
                onClick={handleSettingsClick}
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </motion.button>
            </div>
            <div style={{ height: '6px' }} className="w-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
          </motion.div>

          {/* Overview Cards */}
          <OverviewCards 
            onIncomeClick={handleIncomeClick} 
            onSpendClick={handleSpendClick}
            startDate={startDate}
            endDate={endDate}
            source={selectedSource}
          />

          {/* Category and Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <CategoryBreakdown 
              onCategoryClick={handleCategoryClick}
              startDate={startDate}
              endDate={endDate}
              source={selectedSource}
            />
            <InteractivePieChart 
              startDate={startDate}
              endDate={endDate}
              source={selectedSource}
            />
          </div>

          {/* Spending Trend */}
          <SpendingChart 
            startDate={startDate}
            endDate={endDate}
            source={selectedSource}
          />
        </div>
      </div>

      {/* ChatBot Modal */}
      <ChatBot 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};