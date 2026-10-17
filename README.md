# SponsorScope AI 🎯
> **Creator Sponsorship Rate Forecaster & Autonomous Negotiation Agent**
> Built for the **Hacktoberfest Open-Source AI Challenge: Week 2 (Side Hustle)**

---

## 🌟 Overview

**SponsorScope AI** turns lowball brand sponsorship emails into maximized accepted deals. It combines:
1. **Prior Labs TabPFN-3.5**: Tabular foundation model that calculates Fair Market Value (FMV), expected revenue curves ($EV$), and deal acceptance probability curves $P(\text{Brand Accepts} \mid \text{Price})$.
2. **Google Gemma 2**: Open-weight LLM that parses unstructured inbound emails and drafts tiered negotiation counter-proposals with anchoring psychology.
3. **SerpApi**: Real-time brand marketing intelligence and budget tier grounding.
4. **Render Ready**: Complete `render.yaml` Blueprint for 1-click cloud deployment.

---

## 📂 Project Structure

```
├── server.py                        # High-performance threaded Python API & static server
├── render.yaml                      # Render Blueprint deployment configuration
├── Dockerfile                       # Container deployment definition
├── requirements.txt                 # Python dependencies
├── DEV_SUBMISSION.md                # Official DEV.to submission writeup
├── data/
│   └── creator_deals_benchmark.csv  # 1,200+ creator sponsorship benchmark records
├── services/
│   ├── tabpfn_engine.py             # TabPFN-3.5 rate prediction & win-curve model
│   ├── gemma_engine.py              # Google Gemma 2 extraction & negotiation agent
│   └── serpapi_engine.py            # SerpApi brand intelligence research engine
└── frontend/
    ├── index.html                   # Glassmorphic responsive UI & canvas visualizer
    ├── css/
    │   └── style.css                # Custom dark design tokens & micro-interactions
    └── js/
        └── app.js                   # Reactive controller & interactive probability graph
```

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Enter Directory
```bash
git clone https://github.com/adithya/sponsorscope.git
cd sponsorscope
```

### 2. Install Dependencies (Optional)
```bash
pip install -r requirements.txt
```
*(Note: `server.py` relies solely on standard Python 3 and `requests`, running immediately with zero Rust/C++ compilation overhead).*

### 3. Run the Server
```bash
python3 server.py
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser!

---

## ⚙️ Environment Variables (Optional)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Web server port | `8080` (auto-falls back if taken) |
| `TABPFN_API_KEY` | Prior Labs TabPFN API key (from [platform.priorlabs.ai](https://platform.priorlabs.ai)) | Simulated calibrated fallback |
| `SERPAPI_API_KEY` | SerpApi key for live brand Google search grounding | Curated brand profiles |
| `OLLAMA_API_URL` | Local Ollama endpoint for Gemma 2 | `http://localhost:11434/api/generate` |
| `GEMMA_MODEL_NAME` | Gemma model identifier | `gemma2:9b` |

---

## 🏆 Hacktoberfest 2026 Categories Covered

- **Best Use of TabPFN** ($200): Used for zero-shot tabular rate prediction, pricing tiers, and continuous win-odds decay modeling.
- **Best Use of Gemma** ($200): Used for email parsing and negotiation counter-pitch drafting.
- **Best Use of Render** ($200): Production deployment blueprint via `render.yaml`.
- **Best Use of SerpApi** ($200): Live corporate brand intelligence search.
- **Hacktoberfest Week 2 Theme (Side Hustle)**: Directly monetizable tool solving creator underpricing.
