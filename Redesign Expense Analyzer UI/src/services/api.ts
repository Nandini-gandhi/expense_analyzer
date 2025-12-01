/**
 * API service layer for communicating with Flask backend
 */

const API_BASE_URL = 'http://localhost:5001/api';

export interface Transaction {
  date: string;
  merchant: string;
  amount_spend: number;
  amount_signed: number;
  category: string;
  description: string;
  txn_id: string;
  source?: string;
}

export interface Summary {
  total_income: number;
  total_spend: number;
  net_balance: number;
  total_transactions: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DailySpend {
  date: string;
  amount: number;
}

export interface ForecastTotal {
  avg_spend: number;
  std_dev: number;
  min_spend: number;
  max_spend: number;
  confidence_low: number;
  confidence_high: number;
  num_months: number;
}

export interface ForecastCategory {
  category: string;
  avg_spend: number;
  std_dev: number;
  confidence_low: number;
  confidence_high: number;
  num_months: number;
}

export interface ForecastData {
  total: ForecastTotal;
  by_category: ForecastCategory[];
}

export interface Merchant {
  name: string;
  current_category: string;
  sample_transactions: {
    date: string;
    amount: number;
    description: string;
  }[];
}

export interface DateRange {
  min_date: string;
  max_date: string;
}

/**
 * Get health status of API
 */
export async function getHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('API health check failed');
  return response.json();
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(params?: {
  start_date?: string;
  end_date?: string;
  category?: string;
  merchant_search?: string;
  source?: string;
  min_amount?: number;
  max_amount?: number;
  exclude_transfers?: boolean;
}): Promise<{ transactions: Transaction[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  console.log('Fetching transactions from:', url);
  const response = await fetch(url);
  console.log('Response status:', response.status, response.ok);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  const data = await response.json();
  console.log('Transactions API response:', {
    count: data.count,
    transactionsLength: data.transactions?.length,
    firstTransaction: data.transactions?.[0]
  });
  return data;
}

/**
 * Get overview summary statistics
 */
export async function getSummary(params?: {
  start_date?: string;
  end_date?: string;
  source?: string;
}): Promise<Summary> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch summary');
  return response.json();
}

/**
 * Get category breakdown
 */
export async function getCategories(params?: {
  start_date?: string;
  end_date?: string;
  source?: string;
}): Promise<{ categories: CategoryData[] }> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}/categories${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

/**
 * Get daily spending data
 */
export async function getDailySpend(params?: {
  start_date?: string;
  end_date?: string;
  source?: string;
}): Promise<{ daily_spend: DailySpend[] }> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}/daily-spend${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch daily spend');
  return response.json();
}

/**
 * Get forecast data
 */
export async function getForecast(params?: {
  months_lookback?: number;
  exclude_months?: string[];
  exclude_categories?: string[];
}): Promise<ForecastData> {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.months_lookback) queryParams.append('months_lookback', String(params.months_lookback));
    if (params.exclude_months) {
      params.exclude_months.forEach(m => queryParams.append('exclude_months', m));
    }
    if (params.exclude_categories) {
      params.exclude_categories.forEach(c => queryParams.append('exclude_categories', c));
    }
  }
  
  const url = `${API_BASE_URL}/forecast${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch forecast');
  return response.json();
}

/**
 * Get list of merchants
 */
export async function getMerchants(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<{ merchants: Merchant[] }> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}/merchants${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch merchants');
  return response.json();
}

/**
 * Get merchant override rules
 */
export async function getMerchantRules(): Promise<{ rules: Record<string, string> }> {
  const response = await fetch(`${API_BASE_URL}/settings/merchant-rules`);
  if (!response.ok) throw new Error('Failed to fetch merchant rules');
  return response.json();
}

/**
 * Add or update a merchant rule
 */
export async function addMerchantRule(merchant: string, category: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/settings/merchant-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant, category })
  });
  if (!response.ok) throw new Error('Failed to add merchant rule');
  return response.json();
}

/**
 * Get one-off overrides
 */
export async function getOneOffOverrides(): Promise<{ overrides: Record<string, string> }> {
  const response = await fetch(`${API_BASE_URL}/settings/one-off`);
  if (!response.ok) throw new Error('Failed to fetch one-off overrides');
  return response.json();
}

/**
 * Add or update a one-off override
 */
export async function addOneOffOverride(txn_id: string, category: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/settings/one-off`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txn_id, category })
  });
  if (!response.ok) throw new Error('Failed to add one-off override');
  return response.json();
}

/**
 * Upload CSV files
 */
export async function uploadFiles(files: File[]): Promise<{ success: boolean; message: string; files: string[]; transactions_count: number }> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload files');
  return response.json();
}

/**
 * List all raw CSV files
 */
export async function listFiles(): Promise<{ files: string[] }> {
  const response = await fetch(`${API_BASE_URL}/files`);
  if (!response.ok) throw new Error('Failed to list files');
  return response.json();
}

/**
 * Delete a raw CSV file
 */
export async function deleteFile(filename: string): Promise<{ success: boolean; message: string; remaining_files: string[] }> {
  const response = await fetch(`${API_BASE_URL}/files/${encodeURIComponent(filename)}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to delete file');
  }
  return response.json();
}

/**
 * Get list of data sources
 */
export async function getSources(): Promise<{ sources: string[] }> {
  const response = await fetch(`${API_BASE_URL}/sources`);
  if (!response.ok) throw new Error('Failed to fetch sources');
  return response.json();
}

/**
 * Get date range from data
 */
export async function getDateRange(): Promise<{ min_date: string; max_date: string }> {
  const response = await fetch(`${API_BASE_URL}/date-range`);
  if (!response.ok) throw new Error('Failed to fetch date range');
  return response.json();
}

/**
 * Ask AI chatbot a question about spending
 */
export async function askChatbot(question: string, startDate: string, endDate: string): Promise<{ answer: string }> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question,
      start_date: startDate,
      end_date: endDate
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to get AI response' }));
    throw new Error(errorData.error || 'Failed to get AI response');
  }
  return response.json();
}
