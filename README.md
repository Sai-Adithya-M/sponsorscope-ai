# SponsorScope AI 🎯
> **Creator Sponsorship Rate Forecaster & Autonomous Negotiation Agent**
> Built for the **Hacktoberfest Open-Source AI Challenge: Week 2 (Side Hustle)**

---

## 🌟 Overview

**SponsorScope** turns lowball brand sponsorship emails into maximized accepted deals. It combines:
1. **Prior Labs TabPFN-3.5**: Tabular foundation model that calculates Fair Market Value (FMV), expected revenue curves ($EV$), and deal acceptance probability curves $P(\text{Brand Accepts} \mid \text{Price})$.
2. **Google Gemma 2**: Open-weight LLM that parses unstructured inbound emails and drafts tiered negotiation counter-proposals with anchoring psychology.
3. **SerpApi**: Real-time brand marketing intelligence and budget tier grounding.
4. **Render Ready**: Complete `render.yaml` Blueprint for 1-click cloud deployment.

---

## 📸 Screenshots

### 1. Valuation & Bayesian Acceptance Probability Curve
![Valuation & Market Curve](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png)

### 2. Autonomous Counter-Offer Pitch Drafter (Gemma 2)
![Counter-Email Drafter](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/02_counter_email_draft.png)

### 3. Brand Marketing Intelligence & Leverage Dossier (SerpApi)
![Brand Intelligence](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/03_brand_intelligence.png)

---

## 📂 Project Structure

```
├── server.py                        # High-performance threaded Python API & static server
├── render.yaml                      # Render Blueprint deployment configuration
├── Dockerfile                       # Container deployment definition
├── requirements.txt                 # Python dependencies
├── DEV_SUBMISSION.md                # Official DEV.to submission writeup
├── docs/
│   └── screenshots/                 # Application screenshots
├── data/
│   └── creator_deals_benchmark.csv  # 1,200+ creator sponsorship benchmark records
├── services/
│   ├── tabpfn_engine.py             # TabPFN-3.5 rate prediction & win-curve model
│   ├── gemma_engine.py              # Google Gemma 2 extraction & negotiation agent
│   └── serpapi_engine.py            # SerpApi brand intelligence research engine
└── frontend/
    ├── index.html                   # Clean desktop-software layout
    ├── css/
    │   └── style.css                # Minimalist, rectangular dark styling (no pill fluff)
    └── js/
        └── app.js                   # Reactive controller & interactive canvas graph
```

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Enter Directory
```bash
git clone https://github.com/Sai-Adithya-M/sponsorscope-ai.git
cd sponsorscope-ai
```

### 2. Run the Server
```bash
python3 server.py
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser!

*(Note: `server.py` relies solely on standard Python 3 and `requests`, running immediately with zero Rust/C++ compilation overhead).*

---

## 🧪 How to Test with Your Own Deal

1. Open **`http://localhost:8080`**.
2. Enter your channel metrics in the left panel (Platform, Niche, Subscribers, Median Views, Engagement Rate).
3. Paste any sponsorship inquiry email you received into the **Inbound Sponsor Message** box.
4. Click **"Calculate Rates & Draft Reply"**.
5. Inspect the calculated **Fair Market Value**, scrub the **Acceptance Curve**, and copy your tailored reply from the **Drafted Counter-Email** tab!
