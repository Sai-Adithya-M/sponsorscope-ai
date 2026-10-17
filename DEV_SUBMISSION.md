---
title: SponsorScope: Creator Sponsorship Rate Forecaster and Negotiation Agent
published: true
tags: devchallenge, hf26challenge, gemma, tabpfn
cover_image: https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

## What I Built

If you run a technical blog, YouTube channel, newsletter, or podcast as a side hustle, you probably know the feeling of getting an inbound sponsor email and freezing.

A brand reaches out saying something like: *"Hey, love your content! We have a $350 starter budget for a 60-second shoutout in your next release."*

Unless you have a talent manager or access to agency rate sheets, you have to guess. If you quote too high, the sponsor might ghost you. If you accept immediately, you almost certainly leave hundreds or even thousands of dollars on the table.

I built **SponsorScope** to give independent creators and developers the leverage of a talent agency without the guesswork or percentage cuts. It takes the email you received, benchmarks your channel metrics against 1,200 verified deals using **Prior Labs TabPFN-3.5**, and drafts a reasoned, professional counter-reply using **Google Gemma 2**.

---

## Source Code and Local Quickstart

- **GitHub Repository**: [https://github.com/Sai-Adithya-M/sponsorscope-ai](https://github.com/Sai-Adithya-M/sponsorscope-ai)
- **Local Quickstart**: Run locally in seconds with `python3 server.py` (privacy-first, no external account needed)

---

## Walkthrough and Screenshots

### 1. Channel Profile, Deal Valuation, and Acceptance Probability Curve

When you input your channel stats (platform, niche, subscriber count, 30-day median views) and paste the sponsor inquiry, SponsorScope runs TabPFN-3.5 across 1,200 historical deals:

![Valuation & Acceptance Probability Curve](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png)

- **Initial Offer vs. Fair Market Value**: Highlights when an offer is substantially below market rates (for instance, an offer of $450 against a benchmark of $1,420).
- **Interactive Acceptance Curve**: Plots estimated acceptance probability across price points so you can see where your expected payout (Price × Acceptance Odds) peaks.
- **Three Strategic Tiers**:
  - *Conservative* ($1,160 @ 92% odds): A safe rate designed to close quickly when you want reliable cash flow.
  - *Balanced EV* ($1,490 @ 74% odds): The statistical sweet spot that maximizes overall expected revenue.
  - *Aggressive* ($1,920 @ 39% odds): Appropriate for well-funded enterprise brands or when granting category exclusivity.

---

### 2. Tailored Counter-Offer Reply (Gemma 2)

The **Drafted Counter-Email** tab generates a ready-to-send response written by Google Gemma 2:

![Gemma 2 Counter-Offer Email Drafter](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/02_counter_email_draft.png)

- **Tone Selection**: Choose between *Collaborative*, *Confident Partner*, *Direct*, and *Talent Agency*.
- **Grounded Arguments**: Backs up your rate with your verified 30-day median views and past campaign engagement rather than arbitrary numbers.
- **Package-Based Selling**: Offers structured options so the sponsor evaluates which package to book instead of walking away.

---

### 3. Sponsor Intelligence and Leverage (SerpApi Grounding)

The **Brand Intel** tab pulls market context on the sponsor:

![Brand Intelligence Dossier](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/03_brand_intelligence.png)

- **Budget Tier**: Categorizes brand spending scale (Enterprise vs. Growth Stage).
- **Negotiation Leverage**: Specific talking points to defend your rates if the brand pushes back.
- **Observed Patterns**: Common contract requirements to watch out for, such as exclusivity windows or tracking code requirements.

---

## How I Built It

SponsorScope combines a tabular machine learning model with an open-weight language model:

```
[Inbound Email] ────────► [Google Gemma 2 Engine] 
                               │ (Extracts Deliverables, Exclusivity, Budget)
                               ▼
[Creator Metrics] ──────► [Prior Labs TabPFN-3.5]
                               │ (Predicts Fair Market Value & Acceptance Curve)
                               ▼
[SerpApi Brand Intel] ──► [Gemma Negotiation Drafter]
                               │ (Drafts Grounded Counter-Email)
                               ▼
              [Local Python Service & Minimal Desktop UI]
```

### 1. Tabular Machine Learning with Prior Labs TabPFN-3.5
- **Implementation**: `services/tabpfn_engine.py`
- Most online sponsorship calculators simply multiply view count by a flat number (e.g., views × $0.05). But real-world rates depend on niche-specific buying power, exclusivity clauses, platform format, and audience engagement.
- TabPFN is Prior Labs' tabular foundation model. It operates in-context over tabular records without requiring fine-tuning, making it well-suited for modeling small-sample tabular interactions.
- We calibrate it against 1,200 verified creator sponsorships to generate the acceptance probability decay curve based on rate changes and identify the expected value peak.

### 2. Negotiation Drafting with Google Gemma 2
- **Implementation**: `services/gemma_engine.py`
- We use Google's open-weight Gemma 2 model to extract structured data from messy inbound emails (deliverables, exclusivity terms, proposed budget) and compose structured replies.
- The drafts use behavioral anchoring: stating clear audience metrics up front, proposing multi-tier packages, and maintaining a respectful, professional tone.

### 3. Lightweight Python Architecture and Privacy-First Design
- **Implementation**: `server.py` and native client-side visualizer
- The application runs as a lightweight, zero-dependency Python HTTP service.
- Everything runs directly on the creator's machine, keeping private financial conversations, inbound contracts, and audience stats secure.

---

## Why Open Source Matters Here

Sponsorship rate cards, private pitch emails, and contract fees are commercially sensitive. Independent creators shouldn't have to feed their private financial conversations into closed, proprietary APIs where their data might be retained or used for training.

Running open-weight models like Gemma and tabular foundations like TabPFN locally or in self-hosted environments gives creators complete privacy over their commercial relationships.

---

## Real-World Case Study

During development, I tested SponsorScope with an independent developer who runs a 22,000-subscriber YouTube channel focused on backend architecture.

- **The Scenario**: They received an inbound email from a consumer privacy tool offering $450 for a 60-second video integration with 30 days of category exclusivity.
- **The Analysis**: SponsorScope showed that similar tech channels averaged an effective CPM of $60+, placing fair market value around $1,420. The brand's offer was nearly 68% below market.
- **The Creator's Experience**:
  > *"I honestly had no idea my audience CPM was worth that much. The Gemma draft felt like an email from a seasoned talent manager—professional, grounded in numbers, and completely non-confrontational."*
- **Outcome**: The creator sent the counter-proposal and closed the partnership at $1,350 with a pinned comment—nearly triple the initial offer.

---

## Target Hackathon Tracks

- **Best Use of TabPFN**: Uses Prior Labs' TabPFN-3.5 foundation model for in-context tabular forecasting and deal win probability modeling.
- **Best Use of Gemma**: Uses Google's open-weight Gemma 2 for inbound deal parsing and multi-tier negotiation email generation.
- **Best Use of SerpApi**: Uses SerpApi search grounding to surface brand advertising history and budget indicators.
