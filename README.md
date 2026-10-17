# SponsorScope
> Creator Sponsorship Rate Forecaster & Negotiation Drafter
> Built for the Hacktoberfest Open-Source AI Challenge: Week 2 (Side Hustle)

---

## Overview

SponsorScope helps independent creators and developers evaluate inbound sponsorship offers and negotiate better rates. It combines:
1. **Prior Labs TabPFN-3.5**: Tabular foundation model that calculates Fair Market Value (FMV), expected revenue curves, and deal acceptance probability curves based on 1,200 verified sponsorships.
2. **Google Gemma 2**: Open-weight language model that extracts terms from unstructured emails and drafts professional, tiered counter-proposals.
3. **SerpApi**: Real-time brand advertising context and budget indicator lookup.
4. **Privacy-First Local Execution**: Zero-setup local Python HTTP service that keeps private financial negotiations on your machine.

---

## Screenshots

### 1. Valuation & Bayesian Acceptance Probability Curve
![Valuation & Market Curve](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png)

### 2. Tailored Counter-Offer Reply (Gemma 2)
![Counter-Email Drafter](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/02_counter_email_draft.png)

### 3. Brand Marketing Intelligence & Leverage Dossier (SerpApi)
![Brand Intelligence](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/03_brand_intelligence.png)

---

## Project Structure

```
├── server.py                        # Lightweight threaded Python server
├── render.yaml                      # Render Blueprint deployment definition
├── Dockerfile                       # Container deployment definition
├── requirements.txt                 # Python dependencies
├── DEV_SUBMISSION.md                # Submission writeup for DEV.to
├── docs/
│   └── screenshots/                 # Application screenshots
├── data/
│   └── creator_deals_benchmark.csv  # 1,200+ creator sponsorship benchmark records
├── services/
│   ├── tabpfn_engine.py             # TabPFN rate prediction and win probability model
│   ├── gemma_engine.py              # Gemma 2 extraction and negotiation drafting agent
│   └── serpapi_engine.py            # SerpApi brand intelligence research engine
└── frontend/
    ├── index.html                   # Desktop-grade interface
    ├── css/
    │   └── style.css                # Clean, rectangular dark styling
    └── js/
        └── app.js                   # Application controller & canvas chart logic
```

---

## Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/Sai-Adithya-M/sponsorscope-ai.git
cd sponsorscope-ai
```

### 2. Run the Server
```bash
python3 server.py
```
Open **http://localhost:8080** in your browser.

*(Note: `server.py` relies on the standard library and `requests`, running immediately without complex local builds).*

---

## Testing with Your Own Deal

1. Open **http://localhost:8080**.
2. Enter your channel metrics in the left panel (Platform, Niche, Subscribers, Median Views, Engagement Rate).
3. Paste any sponsorship inquiry email into the **Inbound Sponsor Message** box.
4. Click **Calculate Rates & Draft Reply**.
5. Inspect the calculated **Fair Market Value**, explore the **Acceptance Curve**, and copy your tailored reply from the **Drafted Counter-Email** tab.
