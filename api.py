"""Flask REST API for Expense Analyzer - connects backend logic to frontend UI."""

import os
import json
import calendar
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from src.categorize_transactions import categorize, load_overrides, load_one_off, clean_string
from src.clean_transactions import clean_all
from src.forecast import forecast_by_category, forecast_total_spend
from src.plot_charts import _read_data, CLEAN_DIR

app = Flask(__name__)
CORS(app)

OVERRIDES_JSON = "data/config/overrides.json"
ONE_OFF_CSV = "data/config/one_off_overrides.csv"
RAW_DIR = "data/raw"

# Configure Gemini API (you'll need to set your API key)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)


def _load_clean_df():
    """Load cleaned transactions."""
    path = os.path.join(CLEAN_DIR, "transactions_clean.csv")
    if not os.path.exists(path):
        return pd.DataFrame(columns=["date", "description", "amount_signed", "amount_spend", "category"])
    df = pd.read_csv(path, parse_dates=["date"])
    return df


def _load_cat_df():
    """Load categorized transactions."""
    return _read_data(CLEAN_DIR)


def _save_cat_df(df_cat: pd.DataFrame):
    """Save categorized transactions."""
    out_path = os.path.join(CLEAN_DIR, "transactions_categorized.csv")
    df_cat.to_csv(out_path, index=False)
    return out_path


def _save_overrides(d):
    """Save merchant override rules."""
    os.makedirs(os.path.dirname(OVERRIDES_JSON), exist_ok=True)
    with open(OVERRIDES_JSON, "w") as f:
        json.dump(d, f, indent=2)


def _save_one_off_map(m):
    """Save one-time transaction overrides."""
    rows = [{"txn_id": k, "category": v} for k, v in m.items()]
    pd.DataFrame(rows).to_csv(ONE_OFF_CSV, index=False)


def _recompute_and_refresh():
    """Re-run categorization and refresh state."""
    clean_df = _load_clean_df()
    df_cat = categorize(clean_df)
    _save_cat_df(df_cat)
    return df_cat


def _reclean_and_refresh():
    """Run multi-file cleaning then categorize and refresh state."""
    try:
        clean_all()
    except Exception as e:
        return {"error": str(e)}, 500
    return _recompute_and_refresh()


def _save_uploaded_files(files):
    """Persist uploaded files into data/raw with unique names."""
    import re
    os.makedirs(RAW_DIR, exist_ok=True)
    saved = []
    for uf in files:
        base_name = os.path.splitext(uf.filename)[0]
        safe_base = re.sub(r"[^A-Za-z0-9_-]", "_", base_name) or "uploaded"
        fname = safe_base + ".csv"
        # ensure uniqueness
        counter = 1
        while os.path.exists(os.path.join(RAW_DIR, fname)):
            fname = f"{safe_base}_{counter}.csv"
            counter += 1
        full_path = os.path.join(RAW_DIR, fname)
        uf.save(full_path)
        saved.append(fname)
    return saved


def _delete_raw_file(filename):
    """Delete a raw CSV and refresh dataset."""
    path = os.path.join(RAW_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
        return True
    return False


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "Expense Analyzer API is running"})


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get transactions with optional filters."""
    try:
        df = _load_cat_df()
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        category = request.args.get('category')
        merchant_search = request.args.get('merchant_search')
        source = request.args.get('source')
        min_amount = request.args.get('min_amount')
        max_amount = request.args.get('max_amount')
        exclude_transfers = request.args.get('exclude_transfers', 'true').lower() == 'true'
        
        # Apply filters
        if exclude_transfers:
            df = df[df["category"] != "EXCLUDE"]
        
        if start_date:
            df = df[df["date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["date"] <= pd.to_datetime(end_date)]
        if category:
            if category == "All Expenses":
                df = df[(df["category"] != "Income") & (df["category"] != "EXCLUDE")]
            else:
                df = df[df["category"] == category]
        if merchant_search:
            search_lower = merchant_search.lower()
            df = df[df["merchant"].str.lower().str.contains(search_lower, na=False)]
        if source and source != "All":
            df = df[df["source"] == source]
        if min_amount:
            df = df[df["amount_spend"] >= float(min_amount)]
        if max_amount:
            df = df[df["amount_spend"] <= float(max_amount)]
        
        # Convert to JSON-serializable format with standardized fields
        result = []
        for _, row in df.iterrows():
            result.append({
                'date': row['date'].strftime('%Y-%m-%d %H:%M:%S') if pd.notna(row.get('date')) else '',
                'merchant': str(row.get('merchant', '')),
                'amount_spend': float(row.get('amount_spend', 0)),
                'amount_signed': float(row.get('amount_signed', 0)),
                'category': str(row.get('category', '')),
                'description': str(row.get('description', '')),
                'txn_id': str(row.get('txn_id', '')),
                'source': str(row.get('source', ''))
            })
        
        return jsonify({"transactions": result, "count": len(result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Get overview summary stats."""
    try:
        df = _load_cat_df()
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        source = request.args.get('source', 'All')
        
        # Filter by date
        if start_date:
            df = df[df["date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["date"] <= pd.to_datetime(end_date)]
        
        # Filter by source
        if source != "All" and "source" in df.columns:
            df = df[df["source"] == source]
        
        # Exclude transfers
        base_filtered = df[df["category"] != "EXCLUDE"].copy()
        
        # Separate income and expenses
        income_df = base_filtered[base_filtered["category"] == "Income"]
        expense_df = base_filtered[base_filtered["category"] != "Income"]
        
        total_income = float(income_df["amount_signed"].sum()) if len(income_df) > 0 else 0.0
        total_spend = float(expense_df["amount_spend"].sum()) if len(expense_df) > 0 else 0.0
        total_txns = len(expense_df)
        net_balance = total_income - total_spend
        
        return jsonify({
            "total_income": total_income,
            "total_spend": total_spend,
            "net_balance": net_balance,
            "total_transactions": total_txns
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get category breakdown."""
    try:
        df = _load_cat_df()
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        source = request.args.get('source', 'All')
        
        # Filter by date
        if start_date:
            df = df[df["date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["date"] <= pd.to_datetime(end_date)]
        
        # Filter by source
        if source != "All" and "source" in df.columns:
            df = df[df["source"] == source]
        
        # Get expenses only
        expense_df = df[(df["category"] != "EXCLUDE") & (df["category"] != "Income")].copy()
        
        # Group by category
        cat_summary = (
            expense_df.groupby("category")
            .agg(total=("amount_spend", "sum"), count=("amount_spend", "count"))
            .sort_values("total", ascending=False)
            .reset_index()
        )
        
        total_spend = float(expense_df["amount_spend"].sum()) if len(expense_df) > 0 else 1.0
        
        result = []
        for _, row in cat_summary.iterrows():
            cat = row["category"]
            amt = float(row["total"])
            pct = (100 * amt / total_spend) if total_spend > 0 else 0
            result.append({
                "category": cat,
                "amount": amt,
                "percentage": round(pct, 1),
                "count": int(row["count"])
            })
        
        return jsonify({"categories": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/daily-spend', methods=['GET'])
def get_daily_spend():
    """Get daily spending data."""
    try:
        df = _load_cat_df()
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        source = request.args.get('source', 'All')
        
        # Filter by date
        if start_date:
            df = df[df["date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["date"] <= pd.to_datetime(end_date)]
        
        # Filter by source
        if source != "All" and "source" in df.columns:
            df = df[df["source"] == source]
        
        # Get expenses only
        expense_df = df[(df["category"] != "EXCLUDE") & (df["category"] != "Income")].copy()
        
        # Group by date
        daily_spend = expense_df.groupby(expense_df["date"].dt.date)["amount_spend"].sum().reset_index()
        daily_spend.columns = ["date", "amount"]
        
        result = []
        for _, row in daily_spend.iterrows():
            result.append({
                "date": row["date"].strftime('%Y-%m-%d'),
                "amount": float(row["amount"])
            })
        
        return jsonify({"daily_spend": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """Get forecast data."""
    try:
        df = _load_cat_df()
        
        months_lookback = int(request.args.get('months_lookback', 3))
        exclude_months = request.args.getlist('exclude_months')
        exclude_categories = request.args.getlist('exclude_categories')
        
        # Prepare data
        expenses_df = df[df["category"] != "EXCLUDE"].copy()
        
        if exclude_months:
            expenses_df["year_month"] = expenses_df["date"].dt.to_period("M").astype(str)
            expenses_df = expenses_df[~expenses_df["year_month"].isin(exclude_months)]
        
        if exclude_categories:
            expenses_df = expenses_df[~expenses_df["category"].isin(exclude_categories)]
        
        # Get total forecast
        total_forecast = forecast_total_spend(expenses_df, months_lookback=months_lookback)
        
        # Get category forecast
        cat_forecast = forecast_by_category(expenses_df, months_lookback=months_lookback)
        
        # Convert category forecast to list
        cat_result = []
        if not cat_forecast.empty:
            for _, row in cat_forecast.iterrows():
                cat_result.append({
                    "category": row["category"],
                    "avg_spend": float(row["avg_spend"]),
                    "std_dev": float(row["std_dev"]),
                    "confidence_low": float(row["confidence_low"]),
                    "confidence_high": float(row["confidence_high"]),
                    "num_months": int(row["num_months"])
                })
        
        return jsonify({
            "total": total_forecast,
            "by_category": cat_result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/merchants', methods=['GET'])
def get_merchants():
    """Get list of merchants."""
    try:
        df = _load_cat_df()
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Filter by date
        if start_date:
            df = df[df["date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["date"] <= pd.to_datetime(end_date)]
        
        # Get expenses only
        expense_df = df[(df["category"] != "EXCLUDE")].copy()
        
        # Get unique merchants with their current category and sample transactions
        merchants = []
        for merchant in sorted(expense_df["merchant"].dropna().unique()):
            merchant_txns = expense_df[expense_df["merchant"] == merchant].sort_values("date", ascending=False).head(3)
            current_cat = merchant_txns["category"].iloc[0] if len(merchant_txns) > 0 else "Unknown"
            
            sample_txns = []
            for _, txn in merchant_txns.iterrows():
                sample_txns.append({
                    "date": txn["date"].strftime('%Y-%m-%d'),
                    "amount": float(txn["amount_spend"]),
                    "description": txn["description"]
                })
            
            merchants.append({
                "name": merchant,
                "current_category": current_cat,
                "sample_transactions": sample_txns
            })
        
        return jsonify({"merchants": merchants})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/settings/merchant-rules', methods=['GET'])
def get_merchant_rules():
    """Get all merchant override rules."""
    try:
        overrides = load_overrides()
        return jsonify({"rules": overrides})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/settings/merchant-rules', methods=['POST'])
def add_merchant_rule():
    """Add or update a merchant rule."""
    try:
        data = request.json
        merchant = data.get('merchant')
        category = data.get('category')
        
        if not merchant or not category:
            return jsonify({"error": "merchant and category are required"}), 400
        
        overrides = load_overrides()
        norm_merchant = clean_string(merchant)
        overrides[norm_merchant] = category
        _save_overrides(overrides)
        
        # Re-categorize
        _recompute_and_refresh()
        
        return jsonify({"success": True, "message": f"Updated rule for {merchant}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/settings/one-off', methods=['GET'])
def get_one_off_overrides():
    """Get all one-off overrides."""
    try:
        one_off = load_one_off()
        return jsonify({"overrides": one_off})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/settings/one-off', methods=['POST'])
def add_one_off_override():
    """Add or update a one-off override."""
    try:
        data = request.json
        txn_id = data.get('txn_id')
        category = data.get('category')
        
        if not txn_id or not category:
            return jsonify({"error": "txn_id and category are required"}), 400
        
        one_off = load_one_off()
        one_off[str(txn_id)] = category
        _save_one_off_map(one_off)
        
        # Re-categorize
        _recompute_and_refresh()
        
        return jsonify({"success": True, "message": "Updated one-off override"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Upload CSV files."""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400
        
        files = request.files.getlist('files')
        saved = _save_uploaded_files(files)
        
        # Re-clean and categorize
        df = _reclean_and_refresh()
        
        return jsonify({
            "success": True,
            "message": f"Uploaded {len(saved)} file(s)",
            "files": saved,
            "transactions_count": len(df)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/files', methods=['GET'])
def list_files():
    """List all raw CSV files."""
    try:
        files = []
        if os.path.exists(RAW_DIR):
            files = sorted([f for f in os.listdir(RAW_DIR) if f.endswith('.csv')])
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a raw CSV file."""
    try:
        print(f"Attempting to delete file: {filename}")
        success = _delete_raw_file(filename)
        if not success:
            print(f"File not found: {filename}")
            return jsonify({"error": "File not found"}), 404
        
        print(f"File deleted successfully: {filename}")
        
        # Check remaining files
        remaining = [f for f in os.listdir(RAW_DIR) if f.endswith('.csv')] if os.path.exists(RAW_DIR) else []
        print(f"Remaining files: {remaining}")
        
        if remaining:
            # Re-clean and categorize remaining files
            print("Re-cleaning and refreshing remaining files...")
            _reclean_and_refresh()
        else:
            # No files left - delete the processed data files entirely
            print("No files left, deleting processed data files...")
            clean_path = os.path.join(CLEAN_DIR, "transactions_clean.csv")
            cat_path = os.path.join(CLEAN_DIR, "transactions_categorized.csv")
            
            if os.path.exists(clean_path):
                os.remove(clean_path)
                print(f"Deleted: {clean_path}")
            if os.path.exists(cat_path):
                os.remove(cat_path)
                print(f"Deleted: {cat_path}")
        
        return jsonify({
            "success": True,
            "message": f"Deleted {filename}",
            "remaining_files": remaining
        })
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/api/sources', methods=['GET'])
def get_sources():
    """Get list of data sources."""
    try:
        df = _load_cat_df()
        sources = ["All"]
        if "source" in df.columns:
            sources.extend(sorted(df["source"].dropna().unique().tolist()))
        return jsonify({"sources": sources})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/date-range', methods=['GET'])
def get_date_range():
    """Get min and max dates from data."""
    try:
        df = _load_cat_df()
        if df.empty or "date" not in df.columns:
            today = datetime.now().date()
            return jsonify({
                "min_date": today.strftime('%Y-%m-%d'),
                "max_date": today.strftime('%Y-%m-%d')
            })
        
        min_date = df["date"].min()
        max_date = df["date"].max()
        
        return jsonify({
            "min_date": min_date.strftime('%Y-%m-%d') if pd.notna(min_date) else None,
            "max_date": max_date.strftime('%Y-%m-%d') if pd.notna(max_date) else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """AI chatbot endpoint - answers questions about spending data using Gemini."""
    try:
        data = request.get_json()
        question = data.get('question', '')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        print(f"Chat request - Question: {question}, Dates: {start_date} to {end_date}")
        
        if not question:
            return jsonify({"error": "No question provided"}), 400
        
        # Load transaction data for the date range
        df = _load_cat_df()
        if df.empty:
            return jsonify({"answer": "I don't have any transaction data to analyze yet. Please upload your bank statement first."})
        
        # Filter by date range if provided
        if start_date and end_date:
            df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        
        print(f"Filtered data: {len(df)} transactions")
        
        # Prepare data summary for the AI
        total_spend = df[df['amount_spend'] > 0]['amount_spend'].sum()
        category_breakdown = df[df['amount_spend'] > 0].groupby('category')['amount_spend'].sum().to_dict()
        top_merchants = df[df['amount_spend'] > 0].groupby('merchant')['amount_spend'].sum().nlargest(10).to_dict()
        transaction_count = len(df)
        
        # Create context for the AI
        context = f"""You are a helpful financial assistant analyzing spending data.

Date Range: {start_date} to {end_date}
Total Transactions: {transaction_count}
Total Spending: ${total_spend:.2f}

Category Breakdown:
{json.dumps({k: f"${v:.2f}" for k, v in category_breakdown.items()}, indent=2)}

Top Merchants:
{json.dumps({k: f"${v:.2f}" for k, v in list(top_merchants.items())[:5]}, indent=2)}

User Question: {question}

Please provide a helpful, concise answer based on this spending data. Use specific numbers and be friendly."""

        print("Calling Gemini API...")
        
        # Call Gemini API
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        response = model.generate_content(context)
        
        print(f"Gemini response received: {response.text[:100]}...")
        
        return jsonify({"answer": response.text})
        
    except Exception as e:
        print(f"Chat error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to process question: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
