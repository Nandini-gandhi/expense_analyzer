import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, Trash2, Menu } from 'lucide-react';
import { 
  getMerchants, 
  getTransactions, 
  addMerchantRule, 
  addOneOffOverride, 
  uploadFiles, 
  listFiles, 
  deleteFile 
} from '../services/api';

interface SettingsPageProps {
  onBack: () => void;
  startDate: string;
  endDate: string;
}

export function SettingsPage({ onBack, startDate, endDate }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'merchant' | 'onetime' | 'upload'>('merchant');
  
  // Merchant Rules state
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [merchantChangeCategory, setMerchantChangeCategory] = useState('Bills');
  const [merchantLoading, setMerchantLoading] = useState(false);
  
  // One-time Fixes state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [onetimeChangeCategory, setOnetimeChangeCategory] = useState('Bills');
  const [onetimeLoading, setOnetimeLoading] = useState(false);
  
  // File Management state
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const categories = ['Groceries', 'Dining', 'Personal', 'Bills', 'Travel', 'Entertainment', 'Shopping', 'Education', 'EXCLUDE'];

  // Fetch merchants
  useEffect(() => {
    if (activeTab === 'merchant') {
      fetchMerchants();
    }
  }, [activeTab, startDate, endDate]);

  // Fetch transactions
  useEffect(() => {
    if (activeTab === 'onetime') {
      fetchTransactions();
    }
  }, [activeTab, startDate, endDate]);

  // Fetch files
  useEffect(() => {
    if (activeTab === 'upload') {
      fetchFiles();
    }
  }, [activeTab]);

  const fetchMerchants = async () => {
    try {
      setMerchantLoading(true);
      const data = await getMerchants({ start_date: startDate, end_date: endDate });
      setMerchants(data.merchants);
      if (data.merchants.length > 0 && !selectedMerchant) {
        setSelectedMerchant(data.merchants[0].name);
        setMerchantChangeCategory(data.merchants[0].current_category);
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
    } finally {
      setMerchantLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setOnetimeLoading(true);
      const data = await getTransactions({ start_date: startDate, end_date: endDate });
      setTransactions(data.transactions);
      if (data.transactions.length > 0 && !selectedTransaction) {
        setSelectedTransaction(data.transactions[0].txn_id);
        setOnetimeChangeCategory(data.transactions[0].category);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setOnetimeLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      console.log('Fetching files...');
      const data = await listFiles();
      console.log('Files fetched:', data.files);
      setFiles(data.files || []);
      if (data.files && data.files.length > 0) {
        if (!selectedFile || !data.files.includes(selectedFile)) {
          setSelectedFile(data.files[0]);
        }
      } else {
        setSelectedFile('');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
      setSelectedFile('');
    }
  };

  const handleApplyMerchantRule = async () => {
    if (!selectedMerchant) return;
    
    try {
      setMerchantLoading(true);
      const result = await addMerchantRule(selectedMerchant, merchantChangeCategory);
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => setMessage(null), 3000);
      await fetchMerchants();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to apply rule' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setMerchantLoading(false);
    }
  };

  const handleApplyOneOffOverride = async () => {
    if (!selectedTransaction) return;
    
    try {
      setOnetimeLoading(true);
      const result = await addOneOffOverride(selectedTransaction, onetimeChangeCategory);
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => setMessage(null), 3000);
      await fetchTransactions();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to apply override' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setOnetimeLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    try {
      setUploadLoading(true);
      const result = await uploadFiles(Array.from(uploadedFiles));
      setMessage({ type: 'success', text: `${result.message} - ${result.transactions_count} transactions processed. Reloading app...` });
      // Reload the entire app after 2 seconds so all data is refreshed
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload files' });
      setTimeout(() => setMessage(null), 3000);
      setUploadLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFile}? The app will reload to refresh all data.`)) return;

    try {
      console.log('Deleting file:', selectedFile);
      const result = await deleteFile(selectedFile);
      console.log('Delete result:', result);
      setMessage({ type: 'success', text: `${result.message}. Reloading app...` });
      // Reload the entire app after 1 second so all data is refreshed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete file' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const currentMerchant = merchants.find(m => m.name === selectedMerchant);
  const currentTransaction = transactions.find(t => t.txn_id === selectedTransaction);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />
      
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Menu className="w-12 h-12 text-slate-700" />
              <h1 className="text-5xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>Expense Analyzer</h1>
            </div>
            <button
              onClick={onBack}
              className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 text-slate-700 hover:bg-white/60 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b-2 border-slate-200">
            <button
              onClick={() => setActiveTab('merchant')}
              className={`pb-3 px-1 transition-all ${
                activeTab === 'merchant'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Merchant Rules
            </button>
            <button
              onClick={() => setActiveTab('onetime')}
              className={`pb-3 px-1 transition-all ${
                activeTab === 'onetime'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              One-Time Fixes
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-1 transition-all ${
                activeTab === 'upload'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Upload / Manage Files
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-8 rounded-3xl"
        >
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Merchant Rules Tab */}
          {activeTab === 'merchant' && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">🔧</span>
                <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  Apply to All Transactions from Merchant
                </h3>
              </div>

              {merchantLoading ? (
                <div className="text-center py-8 text-slate-500">Loading merchants...</div>
              ) : merchants.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No merchants found in selected date range</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-700 mb-2">Select merchant:</label>
                    <select
                      value={selectedMerchant}
                      onChange={(e) => {
                        setSelectedMerchant(e.target.value);
                        const merchant = merchants.find(m => m.name === e.target.value);
                        if (merchant) setMerchantChangeCategory(merchant.current_category);
                      }}
                      className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    >
                      {merchants.map((merchant) => (
                        <option key={merchant.name} value={merchant.name}>
                          {merchant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentMerchant && (
                    <>
                      <div>
                        <div className="text-slate-700 mb-2">Recent transactions ({currentMerchant.sample_transactions.length}):</div>
                        <div className="text-slate-600 text-sm space-y-1">
                          {currentMerchant.sample_transactions.slice(0, 3).map((t: any, i: number) => (
                            <div key={i}>{t.date} - ${t.amount.toFixed(2)} - {t.description}</div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="text-blue-800">
                          Currently: {currentMerchant.current_category}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-2">Change to:</label>
                        <select
                          value={merchantChangeCategory}
                          onChange={(e) => setMerchantChangeCategory(e.target.value)}
                          className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={handleApplyMerchantRule}
                        disabled={merchantLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {merchantLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* One-Time Fixes Tab */}
          {activeTab === 'onetime' && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">💬</span>
                <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  One-Time Fixes (Single Transaction)
                </h3>
              </div>

              {onetimeLoading ? (
                <div className="text-center py-8 text-slate-500">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No transactions found in selected date range</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-700 mb-2">Select transaction:</label>
                    <select
                      value={selectedTransaction}
                      onChange={(e) => {
                        setSelectedTransaction(e.target.value);
                        const txn = transactions.find(t => t.txn_id === e.target.value);
                        if (txn) setOnetimeChangeCategory(txn.category);
                      }}
                      className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    >
                      {transactions.map((t) => (
                        <option key={t.txn_id} value={t.txn_id}>
                          {t.date} | {t.merchant} | ${t.amount_spend.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentTransaction && (
                    <>
                      <div>
                        <div className="text-slate-600 text-sm space-y-1">
                          <div>Description: {currentTransaction.description}</div>
                          <div>Current Category: {currentTransaction.category}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-2">Change to:</label>
                        <select
                          value={onetimeChangeCategory}
                          onChange={(e) => setOnetimeChangeCategory(e.target.value)}
                          className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={handleApplyOneOffOverride}
                        disabled={onetimeLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {onetimeLoading ? 'Applying...' : 'Apply'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload / Manage Files Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-12">
              {/* Upload Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Upload className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Upload Additional CSVs
                  </h3>
                </div>

                <div className="text-slate-700 mb-4">Add CSV file(s)</div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-slate-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-700 mb-1">Drag and drop files here or click to browse</div>
                      <div className="text-slate-500 text-sm">Limit 200MB per file • CSV</div>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".csv"
                      onChange={handleFileUpload}
                      ref={(input) => {
                        if (input) {
                          (window as any).fileInput = input;
                        }
                      }}
                      style={{ display: 'none' }}
                      disabled={uploadLoading}
                    />
                    <button
                      type="button"
                      onClick={() => (window as any).fileInput?.click()}
                      className="glass-card px-6 py-2 rounded-xl text-slate-700 hover:bg-white/80 transition-all cursor-pointer"
                      disabled={uploadLoading}
                    >
                      Browse files
                    </button>
                    {uploadLoading && (
                      <div className="text-blue-600 text-sm">Uploading and processing...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Trash2 className="w-6 h-6 text-slate-600" />
                  <h3 className="text-2xl text-slate-800" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Delete Existing Raw Files
                  </h3>
                </div>

                {files.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No files found</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-700 mb-2">Select file to delete</label>
                      <select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      >
                        {files.map((file) => (
                          <option key={file} value={file}>
                            {file}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={handleDeleteFile}
                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2 rounded-xl transition-all"
                    >
                      Delete File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}