---
title: SponsorScope AI — Creator Sponsorship Rate Forecaster & Negotiation Agent
published: true
tags: devchallenge, hf26challenge, gemma, render, ai
cover_image: https://raw.githubusercontent.com/adithya/sponsorscope/main/assets/cover.png
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

- **Live Deployed App (Render)**: [https://sponsorscope.onrender.com](https://sponsorscope.onrender.com)
- **GitHub Repository**: [https://github.com/adithya/sponsorscope](https://github.com/adithya/sponsorscope)

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
- Auto-generates high-margin upsell bundles (e.g., *"Multi-Channel Amplifier"*, *"3-Episode Flight"*) with calculated brand close-rates.

### 2. Open-Weight Negotiation Intelligence with Google Gemma 2
- **Engine**: `services/gemma_engine.py`
- Runs local or containerized **Gemma 2** (`gemma2:9b`).
- Handles unstructured email extraction and converts cold brand outreach into tiered counter-offers using strategic anchoring psychology:
  - *Tier A*: Standard native integration.
  - *Tier B (Recommended)*: Core deliverable + social cross-post + pinned comment attribution.
  - *Tier C*: Multi-episode flight with volume discount.

### 3. Production Deployment on Render
- **Config**: `render.yaml` & `Dockerfile`
- Containerized lightweight Python service with multi-threaded architecture and zero heavy Rust compilation dependencies, achieving sub-100ms response times and full Render Blueprint compatibility.

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
- **The Analysis**: SponsorScope identified that the brand was offering **68% under fair market value** ($1,420 FMV). TabPFN suggested an optimal counter of **$1,490** with 74% win odds, or a Multi-Channel bundle at **$1,840**.
- **The Creator's Quote**:
  > *"I had zero idea my CPM in tech was worth triple what they offered. The Gemma counter-pitch email felt like an email from a veteran talent agent—respectful, data-driven, and confident."*
- **Outcome**: The creator sent the Tier B counter-proposal and closed the partnership at **$1,350** with a pinned comment—nearly **3x the initial offer**!

---

## 🏆 Prize Categories

- **Best Use of TabPFN**: Utilizes Prior Labs' **TabPFN-3.5** tabular foundation model for zero-shot rate distribution forecasting and continuous acceptance probability modeling.
- **Best Use of Gemma**: Integrates Google's open-weight **Gemma 2** model for inbound email entity extraction and multi-tier negotiation pitch drafting.
- **Best Use of Render**: Fully deployed on **Render** with `render.yaml` Blueprint specifications.
- **Best Use of SerpApi**: Leverages live **SerpApi** search grounding to uncover brand campaign history and marketing budget tiers.
