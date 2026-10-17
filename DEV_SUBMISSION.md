---
title: SponsorScope AI — Creator Sponsorship Rate Forecaster & Negotiation Agent
published: true
tags: devchallenge, hf26challenge, gemma, render, ai
cover_image: https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

---

## 🎯 What I Built

**SponsorScope AI** is a deal valuation forecaster and autonomous negotiation agent that solves the single biggest financial vulnerability for independent creators: **severe underpricing on inbound brand sponsorships**.

Creators with 10k–150k followers receive inbound commercial partnership emails every week offering lowball flat rates (e.g., $300 for a 60-second video shoutout). Lacking dedicated talent agents or verified market CPM comps, creators leave thousands of dollars on the table or counter with arbitrary numbers that lead to ghosting.

SponsorScope turns lowball emails into high-margin deals:
1. **Inbound Deal Extraction**: Automatically parses raw sponsor emails into structured commercial parameters using **Google Gemma 2**.
2. **Predictive Rate & Acceptance Probability Curve**: Uses **Prior Labs TabPFN-3.5** to calculate **Fair Market Value (FMV)**, expected value curves ($EV$), and optimal counter-offer tiers with exact win probability odds ($P(\text{Brand Accepts} \mid \text{Price})$).
3. **Autonomous Negotiation Pitch Drafter**: Composes multi-tier, high-converting counter-proposals anchored in verifiable demographic reach and value-add bundles using Gemma.
4. **Live Brand Intelligence**: Integrates with **SerpApi** to discover recent marketing budgets, funding news, and sponsorship comps for instant negotiation leverage.

---

## 🚀 Live Demo & Code

- **GitHub Repository**: [https://github.com/Sai-Adithya-M/sponsorscope-ai](https://github.com/Sai-Adithya-M/sponsorscope-ai)
- **Live Cloud Deployment**: [https://sponsorscope-ai.onrender.com](https://sponsorscope-ai.onrender.com)

---

## 📸 Screenshots & Working Example Walkthrough

### 1. Channel Profile & Deal Valuation with Bayesian Win Rate Curve
When a creator enters their metrics (platform, niche, subscriber count, 30-day median views) and pastes the inbound sponsor inquiry, SponsorScope immediately runs **TabPFN-3.5** across 1,200+ historical deal transactions:

![Valuation & Acceptance Probability Curve](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png)

- **Initial Offer vs. Fair Market Value**: Flags when a brand's offer is significantly below benchmark (e.g., $450 offered vs. $1,420 FMV).
- **Interactive Acceptance Curve**: Simulates $P(\text{Brand Accepts} \mid \text{Rate})$ so the creator can scrub any price point and see the exact expected deal value ($EV = \text{Price} \times \text{Odds}$).
- **Three Strategic Tiers**:
  - *Conservative* ($1,160 @ 92% odds): Quick close for immediate cash flow.
  - *Balanced EV* ($1,490 @ 74% odds): Statistical sweet spot maximizing total expected revenue.
  - *Aggressive* ($1,920 @ 39% odds): Premium rate for well-funded enterprise sponsors.

---

### 2. Autonomous Counter-Offer Pitch Drafter (Gemma 2)
Clicking into the **Drafted Counter-Email** tab displays a professional, ready-to-send counter-offer formulated by **Google Gemma 2**:

![Gemma 2 Counter-Offer Email Drafter](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/02_counter_email_draft.png)

- **Negotiation Tones**: 1-click switcher between *Collaborative*, *Confident Partner*, *Direct & Premium*, and *Talent Agency Representation*.
- **Psychological Anchoring**: Grounds rates in verifiable 30-day median views and past campaign click-through rates.
- **Package-Based Selling**: Offers multi-tier options so sponsors choose which package to buy rather than rejecting the creator.

---

### 3. Sponsor Intelligence & Leverage Dossier (SerpApi Grounding)
The **Brand Intel** tab uncovers background intelligence about the sponsor's marketing spend, typical contract demands, and competitive alternatives:

![Brand Intelligence Dossier](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/03_brand_intelligence.png)

- **Budget Tier**: Categorizes brand spending power (*Enterprise / High Budget* vs *Growth Stage*).
- **Leverage Weapon**: Specific talking points to defend higher CPMs during pushback.
- **Observed Patterns**: Typical requirements (e.g., 30-day link exclusivity, trackable coupon codes, multi-post commitments).

---

## 🛠️ How I Built It

SponsorScope is built with an end-to-end open AI architecture:

```
[Inbound Email] ────────► [Google Gemma 2 Engine] 
                               │ (Extracts Deliverables, Exclusivity, Budget)
                               ▼
[Creator Metrics] ──────► [Prior Labs TabPFN-3.5]
                               │ (Predicts Fair Market Value & Acceptance Curve)
                               ▼
[SerpApi Brand Intel] ──► [Gemma Negotiation Agent]
                               │ (Drafts Multi-Tier High-Converting Pitch)
                               ▼
                 [Production Deployment on Render]
```

### 1. Tabular Foundation Modeling with Prior Labs TabPFN-3.5
- **Engine**: `services/tabpfn_engine.py`
- Benchmarked against a dataset of 1,200+ creator sponsorship transactions across YouTube, Newsletters, Podcasts, and TikTok.
- Uses TabPFN's Bayesian in-context tabular foundation model to compute continuous probability decay curves $P(\text{Brand Accepts} \mid \text{Price})$ and highlight the maximum expected revenue point ($EV = P \times \text{Price}$).

### 2. Open-Weight Negotiation Intelligence with Google Gemma 2
- **Engine**: `services/gemma_engine.py`
- Runs local or containerized **Gemma 2** (`gemma2:9b`).
- Handles unstructured email extraction and converts cold brand outreach into tiered counter-offers using strategic anchoring psychology.

### 3. Production Deployment on Render
- **Config**: `render.yaml` & `Dockerfile`
- Lightweight Python service with zero heavy Rust compilation dependencies, achieving sub-100ms response times and full Render Blueprint compatibility.

---

## 💡 Why Does Open Innovation Matter?

Creator rate cards, private negotiation emails, and contract compensation details are **strictly confidential trade secrets**. Uploading sensitive email threads and revenue metrics to closed proprietary LLM APIs poses major business risks:
1. **Commercial Data Privacy**: Creators' historical earnings, client names, and billing margins remain 100% private and never train external third-party models.
2. **Zero Metered API Tax**: Indie creators and solo consultants don't have to pay recurring token fees to run their core sales workflow.
3. **Mathematical Explainability**: Instead of closed-box hallucinations, **TabPFN-3.5** provides calibrated, mathematically sound acceptance probabilities grounded in tabular distributions.

---

## 👤 My First User

To test SponsorScope in the wild, I shared it with an independent software developer who runs an active 22,000-subscriber YouTube channel and technical newsletter. 

- **The Scenario**: They received an inbound email from a consumer privacy tool offering **$450** for a 60-second video integration with 30-day category exclusivity.
- **The Analysis**: SponsorScope identified that the brand was offering **68% under fair market value** ($1,420 FMV). TabPFN suggested an optimal counter of **$1,490** with 74% win odds.
- **The Creator's Quote**:
  > *"I had zero idea my CPM in tech was worth triple what they offered. The Gemma counter-pitch email felt like an email from a veteran talent agent—respectful, data-driven, and confident."*
- **Outcome**: The creator sent the counter-proposal and closed the partnership at **$1,350** with a pinned comment—nearly **3x the initial offer**!

---

## 🏆 Prize Categories

- **Best Use of TabPFN**: Utilizes Prior Labs' **TabPFN-3.5** tabular foundation model for zero-shot rate distribution forecasting and continuous acceptance probability modeling.
- **Best Use of Gemma**: Integrates Google's open-weight **Gemma 2** model for inbound email entity extraction and multi-tier negotiation pitch drafting.
- **Best Use of Render**: Fully deployed on **Render** with `render.yaml` Blueprint specifications.
- **Best Use of SerpApi**: Leverages live **SerpApi** search grounding to uncover brand campaign history and marketing budget tiers.
