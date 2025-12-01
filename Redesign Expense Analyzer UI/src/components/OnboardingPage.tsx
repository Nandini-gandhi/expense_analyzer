import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, ArrowRight, TrendingUp, PieChart, Calendar, Settings } from 'lucide-react';
import { uploadFiles } from '../services/api';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(Array.from(files));
      setError(null);
    }
  };

  const handleStartAnalyzing = async () => {
    if (selectedFile.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      await uploadFiles(selectedFile);
      // Reload the page to show the dashboard with the new data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />
      
      <div className="max-w-4xl mx-auto p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-card p-12 rounded-3xl"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="text-6xl">💰</span>
              <h1 className="text-6xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>
                Expense Analyzer
              </h1>
            </motion.div>
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-6"
            />
          </div>

          {/* Introduction */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-slate-700 text-center mb-8 text-lg">
              Take control of your finances with intelligent expense tracking and forecasting.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <h3 className="text-slate-800 text-lg font-medium">Category Breakdown</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  View spending across 8 categories with interactive charts
                </p>
              </div>

              <div className="bg-white/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-slate-800 text-lg font-medium">Smart Forecasting</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Get AI-powered predictions for future spending trends
                </p>
              </div>

              <div className="bg-white/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-slate-800 text-lg font-medium">Date Range Filter</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Analyze expenses for any time period you choose
                </p>
              </div>

              <div className="bg-white/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="text-slate-800 text-lg font-medium">Category Management</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Change merchant categories and make one-time transaction fixes
                </p>
              </div>
            </div>
          </motion.div>

          {/* File Upload Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-8"
            style={{ marginTop: '4rem' }}
          >
            <h2 className="text-4xl text-slate-800 mb-4 text-center font-bold" style={{ fontFamily: "'Crimson Pro', serif" }}>
              Get Started
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Upload your bank statement CSV to begin analyzing your expenses
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-28 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
              <div className="flex flex-col items-center justify-center gap-4">
                <Upload className="w-12 h-12 text-blue-500" />
                {selectedFile.length > 0 ? (
                  <div className="text-center">
                    <div className="text-slate-800 mb-2">
                      {selectedFile.map((file, idx) => (
                        <div key={idx}>✓ {file.name}</div>
                      ))}
                    </div>
                    <button 
                      onClick={() => document.getElementById('file-input-change')?.click()}
                      className="text-blue-600 cursor-pointer hover:underline text-sm bg-transparent border-0"
                    >
                      Choose different files
                    </button>
                    <input
                      id="file-input-change"
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute opacity-0 pointer-events-none"
                      style={{ width: 0, height: 0 }}
                      disabled={uploading}
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-slate-700 mb-1">Drag and drop your CSV file here</div>
                      <div className="text-slate-500 text-sm">or</div>
                    </div>
                    <button
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                    >
                      Browse files
                    </button>
                    <input
                      id="file-input"
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute opacity-0 pointer-events-none"
                      style={{ width: 0, height: 0 }}
                    />
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-6 mb-4 p-3 rounded-xl bg-red-100 text-red-800 border border-red-200 text-center text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileHover={selectedFile.length > 0 && !uploading ? { scale: 1.02 } : {}}
              whileTap={selectedFile.length > 0 && !uploading ? { scale: 0.98 } : {}}
              onClick={handleStartAnalyzing}
              disabled={selectedFile.length === 0 || uploading}
              className={`w-full p-4 rounded-xl transition-all flex items-center justify-center gap-3 mt-6 ${
                selectedFile.length > 0 && !uploading
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {uploading ? 'Uploading and processing...' : selectedFile.length > 0 ? 'Start Analyzing' : 'Upload files to continue'}
              </span>
              {selectedFile.length > 0 && !uploading && <ArrowRight className="w-5 h-5" style={{ color: '#ffffff' }} />}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
