# Implementation Tradeoffs & Decisions

## 1. Architecture: Streamlit → Flask + React
**Decision:** Migrated from Streamlit prototype to Flask REST API + React frontend  
**Tradeoff:** More complexity (2 servers, more code) vs better performance and UI control  
**Why:** Streamlit felt sluggish with full-page refreshes, couldn't integrate Figma design, needed professional architecture

## 2. Categorization: Rule-Based vs Machine Learning
**Decision:** Rule-based categorization with hierarchical rules  
**Tradeoff:** Accuracy vs transparency and user control  
**Why:** Explainable to users, no training data needed, user-controllable through overrides

## 3. Categorization Hierarchy
**Priority Order:**
1. One-off overrides (specific transaction ID)
2. Merchant rules (merchant-level override)
3. Bank-provided categories
4. Keyword matching
5. Fuzzy matching
6. Default to "Other"

## 4. AI Integration: Gemini vs OpenAI
**Decision:** Google Gemini API  
**Tradeoff:** Cost and speed vs sophistication  
**Why:** Free tier, fast responses, good enough for this use case

## 5. AI Context Strategy
**Decision:** Send aggregated summary not raw transactions  
**Tradeoff:** Less detail vs cheaper/faster API calls  
**Why:** Total spending + category breakdown + top merchants is sufficient context

## 6. Multi-Bank Support: Flexible vs Explicit
**Decision:** Flexible column detection (check multiple possible names)  
**Tradeoff:** Works well with Chase/similar formats vs perfect support for all banks  
**Why:** Maintainable, covers most cases, acknowledged in README

## 7. Forecast Method: Simple vs Complex
**Decision:** Moving average with IQR outlier removal  
**Tradeoff:** Sophistication vs interpretability  
**Why:** Simple averages are explainable, outlier removal prevents huge purchases from skewing results
