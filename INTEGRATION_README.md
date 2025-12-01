# Expense Analyzer - Integrated Full-Stack Application

## Overview
This is a complete expense tracking and analysis application with:
- **Backend**: Python Flask API serving transaction data, forecasts, and settings
- **Frontend**: React + TypeScript UI with beautiful Figma-designed interface
- **Data Processing**: Automated transaction cleaning, categorization, and forecasting

## Architecture

### Backend (Flask API)
- `api.py` - REST API server (Flask)
- `src/categorize_transactions.py` - Smart categorization engine
- `src/clean_transactions.py` - Multi-file CSV cleaning
- `src/forecast.py` - Spending forecasts with outlier detection
- `src/plot_charts.py` - Chart generation utilities

### Frontend (React + Vite)
- `Redesign Expense Analyzer UI/src/` - React TypeScript components
- `src/services/api.ts` - API client layer
- All components integrated with real backend data

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to project root
cd "expense-coach"

# Install Python dependencies
pip install -r requirements.txt

# Or if using conda:
conda create -n expense-coach python=3.11
conda activate expense-coach
pip install -r requirements.txt
```

### 2. Prepare Data

Place your bank CSV files in `data/raw/`:
```bash
# Example:
data/raw/chase_statement.csv
data/raw/amex_statement.csv
```

### 3. Start Backend API

```bash
# Make sure you're in the project root
python api.py
```

The API will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd "Redesign Expense Analyzer UI"

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Usage

1. **Upload Data**: Go to Settings → Upload / Manage Files to upload your bank statements
2. **View Dashboard**: Main page shows spending overview, categories, and trends
3. **Drill Down**: Click on any category to see detailed transactions
4. **Forecast**: View predicted spending based on historical patterns
5. **Customize**: Use Settings to create merchant rules and one-off overrides

## API Endpoints

### Data Endpoints
- `GET /api/health` - Health check
- `GET /api/transactions` - Get filtered transactions
- `GET /api/summary` - Overview statistics
- `GET /api/categories` - Category breakdown
- `GET /api/daily-spend` - Daily spending data
- `GET /api/forecast` - Spending forecasts
- `GET /api/merchants` - Merchant list with samples
- `GET /api/sources` - Data source list
- `GET /api/date-range` - Available date range

### Settings Endpoints
- `GET /api/settings/merchant-rules` - Get merchant override rules
- `POST /api/settings/merchant-rules` - Add/update merchant rule
- `GET /api/settings/one-off` - Get one-off transaction overrides
- `POST /api/settings/one-off` - Add/update one-off override

### File Management
- `GET /api/files` - List uploaded files
- `POST /api/upload` - Upload new CSV files
- `DELETE /api/files/<filename>` - Delete a file

## Features

### ✅ Automatic Categorization
- Keyword-based rules
- Fuzzy matching for variations
- Bank category mapping
- Merchant-specific overrides
- One-off transaction fixes

### ✅ Smart Forecasting
- Historical trend analysis
- Outlier detection and removal
- Category-level predictions
- Confidence intervals

### ✅ Beautiful UI
- Smooth animations with Motion
- Responsive design
- Interactive charts (Recharts)
- Glass-morphism effects
- Date range filtering
- Merchant search

### ✅ Multi-Source Support
- Import from multiple banks
- Track data sources
- Filter by source

## Data Format

Your CSV files should have these columns (flexible naming):
- **Date**: "Transaction Date", "Date", "Posted Date", "Post Date"
- **Description**: "Description", "Details", "Memo"
- **Amount**: "Amount", "Transaction Amount", "Value"
- **Category** (optional): "Category"

Example:
```csv
Transaction Date,Description,Amount,Category
2025-10-01,TRADER JOE'S #706,-45.23,Groceries
2025-10-02,NETFLIX.COM,-15.99,Entertainment
```

## Customization

### Adding New Categories
Edit `src/categorize_transactions.py`:
```python
KEYWORD_RULES = {
    "your_keyword": "YourCategory",
    # ...
}
```

### Adjusting Forecast Settings
- Change `months_lookback` in forecast API call
- Exclude anomaly months or categories
- Adjust outlier multiplier in `src/forecast.py`

## Troubleshooting

### Backend Issues
- **Port 5000 in use**: Change port in `api.py`: `app.run(port=5001)`
- **No data showing**: Check that CSV files are in `data/raw/` and formatted correctly
- **Categories wrong**: Use Settings → Merchant Rules to override

### Frontend Issues
- **API connection failed**: Ensure backend is running on port 5000
- **CORS errors**: Flask-CORS should handle this; check browser console
- **Build errors**: Run `npm install` again

### Data Issues
- **Transactions not loading**: Check CSV format matches expected columns
- **Wrong categories**: Use one-off overrides or merchant rules in Settings
- **Missing dates**: Ensure date column exists and is parseable

## File Structure

```
expense-coach/
├── api.py                          # Flask REST API
├── app.py                          # Streamlit app (legacy)
├── requirements.txt                # Python dependencies
├── data/
│   ├── raw/                       # Upload CSV files here
│   ├── clean/                     # Processed data (auto-generated)
│   └── config/                    # Rules and overrides
├── src/
│   ├── categorize_transactions.py # Categorization logic
│   ├── clean_transactions.py      # CSV cleaning
│   ├── forecast.py                # Forecasting
│   └── plot_charts.py             # Chart utilities
└── Redesign Expense Analyzer UI/
    ├── src/
    │   ├── App.tsx                # Main app component
    │   ├── services/api.ts        # API client
    │   └── components/            # React components
    ├── package.json
    └── vite.config.ts
```

## Tech Stack

### Backend
- Flask 3.0+ - Web framework
- Pandas 2.2+ - Data processing
- RapidFuzz 3.9+ - Fuzzy matching
- NumPy 1.26+ - Numerical operations

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- Recharts - Charts
- Motion - Animations
- Tailwind CSS - Styling
- Radix UI - Component primitives

## License

Private project - All rights reserved

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check browser console for errors
4. Review Flask terminal output for backend errors
