# Expense Analyzer -  Financial Dashboard

A modern web application for analyzing personal expenses with AI-powered insights. Built with React, Flask, and Google Gemini AI.

**📹 Video Demo:** Watch `Expense Analyzer.mp4` for a complete walkthrough of the application, code explanation, and implementation decisions.

## Features

- 📊 **Interactive Dashboard** - Visualize spending patterns with charts and graphs
- 🤖 **AI Assistant** - Ask natural language questions about your spending using Google Gemini
- 📁 **Multi-Bank Support** - Upload CSV files from multiple bank accounts
- 🏷️ **Smart Categorization** - Automatic transaction categorization with custom rule support
- 📈 **Spending Forecast** - Predict future expenses based on historical data
- 💰 **Income Tracking** - Monitor income alongside expenses
- ⚙️ **Customizable Rules** - Override categories for specific merchants or transactions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons
- Tailwind CSS for styling

### Backend
- Flask 3.1.2 REST API
- Python 3.11
- Pandas for data processing
- Google Gemini AI (gemini-2.5-flash-lite)
- RapidFuzz for fuzzy string matching

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Google Gemini API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Nandini-gandhi/expense_analyzer.git
cd expense-coach
```

### 2. Set up Python environment

```bash
# Create and activate conda environment
conda create -n expense_analyser python=3.11
conda activate expense_analyser

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Set up Google Gemini API

Create a `.env` file in the root directory:

```bash
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Set up Frontend

```bash
cd "Redesign Expense Analyzer UI"
npm install
```

## Running the Application

### Quick Start (One Command)

```bash
./start.sh
```

This starts both the Flask backend (port 5001) and React frontend (port 3000).

Press `Ctrl+C` to stop both servers.

### Manual Start (Alternative)

**Backend (Terminal 1):**
```bash
conda activate expense_analyser
python api.py
```

**Frontend (Terminal 2):**
```bash
cd "Redesign Expense Analyzer UI"
npm run dev
```

## Usage

### 1. Upload Bank Statements

- Navigate to Settings (menu icon in top-right)
- Click "Upload CSV Files"
- Select one or more bank statement CSV files
- The app automatically processes and categorizes transactions

**Note:** A sample file (`sample_bank_statement.csv`) is included for testing. Use this or any Chase Excel statement to try the app. Other banks may have slightly different CSV formats that haven't been adapted yet.

### 2. View Dashboard

- **Overview**: See total spending, income, and balance
- **Category Breakdown**: Interactive pie chart of spending by category
- **Spending Chart**: Daily spending trends over time
- **All Expenses**: Filterable table of all transactions

### 3. Use AI Assistant

- Click the "AI Assistant" button (purple gradient, bottom-right)
- Ask questions like:
  - "How much did I spend on groceries last month?"
  - "What's my biggest expense category?"
  - "Show me my dining expenses"
  - "How much did I spend at Starbucks?"

### 4. Customize Categories

- Go to Settings → Merchant Rules
- Set custom categories for specific merchants
- Add one-off overrides for individual transactions

### 5. View Forecasts

- Navigate to Forecast page
- See predicted spending for next month
- Adjust lookback period and exclusions

## Project Structure

```
expense-coach/
├── api.py                          # Flask REST API server
├── requirements.txt                # Python dependencies
├── .env                            # Environment variables (API keys)
├── data/
│   ├── raw/                        # Uploaded bank CSV files
│   ├── clean/                      # Processed transaction data
│   └── config/                     # Category rules and overrides
├── src/                            # Python backend modules
│   ├── clean_transactions.py      # CSV cleaning logic
│   ├── categorize_transactions.py # Category assignment
│   └── forecast.py                # Spending prediction
└── Redesign Expense Analyzer UI/   # React frontend
    ├── src/
    │   ├── App.tsx                # Main app component
    │   ├── components/            # React components
    │   │   ├── ChatBot.tsx        # AI assistant UI
    │   │   ├── AllExpensesPage.tsx
    │   │   ├── CategoryPage.tsx
    │   │   ├── ForecastPage.tsx
    │   │   ├── IncomePage.tsx
    │   │   └── SettingsPage.tsx
    │   └── styles/
    └── package.json
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/transactions` | GET | Get filtered transactions |
| `/api/summary` | GET | Get spending summary |
| `/api/categories` | GET | Get category breakdown |
| `/api/daily-spend` | GET | Get daily spending data |
| `/api/forecast` | GET | Get spending forecast |
| `/api/chat` | POST | AI chatbot queries |
| `/api/upload` | POST | Upload CSV files |
| `/api/files` | GET | List uploaded files |
| `/api/files/<filename>` | DELETE | Delete a file |
| `/api/settings/merchant-rules` | GET/POST | Manage category rules |

## CSV Format

Your bank statement CSV should include these columns (flexible naming):
- Date (date, transaction_date, etc.)
- Description (description, merchant, etc.)
- Amount (amount, transaction_amount, etc.)
- Optional: Category, Source
