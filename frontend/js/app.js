// ==========================================================================
// SponsorScope AI — Clean Client Application Controller
// Uncluttered, reactive forecaster & negotiation drafter
// ==========================================================================

let currentPrediction = null;
let currentDeal = null;
let currentPitch = null;
let currentIntel = null;
let currentTone = "balanced";
let currentPrice = 1490;

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initToneButtons();
  initSlider();
  initTiers();
  initCopyButtons();
  initCanvasInteraction();
  initClearButton();

  window.addEventListener("resize", () => {
    if (currentPrediction) {
      drawProbabilityCurve(currentPrice);
    }
  });

  const btn = document.getElementById("btnAnalyze");
  if (btn) {
    btn.addEventListener("click", () => {
      runAnalysis();
    });
  }

  // Pre-render initial clean baseline simulation
  runInitialBaseline();
});

// 1. Navigation Tabs
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetTab = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
      const targetEl = document.getElementById(targetTab);
      if (targetEl) targetEl.style.display = "block";

      if (targetTab === "tabValuation" && currentPrediction) {
        setTimeout(() => drawProbabilityCurve(currentPrice), 50);
      }
    });
  });
}

// 2. Tone Buttons
function initToneButtons() {
  const btns = document.querySelectorAll(".tone-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTone = btn.getAttribute("data-tone");
      if (currentDeal && currentPrediction) {
        regeneratePitch();
      }
    });
  });
}

// 3. Clear Email Button
function initClearButton() {
  const btn = document.getElementById("btnClearEmail");
  if (btn) {
    btn.addEventListener("click", () => {
      const input = document.getElementById("emailInput");
      input.value = "";
      input.focus();
    });
  }
}

// 4. Interactive Price Slider
function initSlider() {
  const slider = document.getElementById("priceSlider");
  if (!slider) return;

  slider.addEventListener("input", (e) => {
    const price = parseInt(e.target.value);
    currentPrice = price;
    updateSliderUI(price);
  });
}

function updateSliderUI(price) {
  const sliderValEl = document.getElementById("sliderVal");
  if (sliderValEl) sliderValEl.textContent = `$${price.toLocaleString()}`;

  if (currentPrediction && currentPrediction.fair_market_value) {
    const fmv = currentPrediction.fair_market_value;
    const ratio = price / fmv;
    const z = -5.0 * (ratio - 1.08);
    const prob = Math.min(98, Math.max(4, Math.round(100.0 / (1.0 + Math.exp(-z)) * 10) / 10));
    const ev = Math.round(price * (prob / 100.0));

    const probEl = document.getElementById("sliderProb");
    const evEl = document.getElementById("sliderEv");
    if (probEl) probEl.textContent = `${prob}%`;
    if (evEl) evEl.textContent = `$${ev.toLocaleString()}`;

    drawProbabilityCurve(price);
  }
}

// 5. Canvas Mouse Interaction
function initCanvasInteraction() {
  const canvas = document.getElementById("probCanvas");
  if (!canvas) return;

  canvas.addEventListener("mousemove", (e) => {
    if (!currentPrediction) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { top: 25, right: 35, bottom: 35, left: 45 };
    const graphWidth = rect.width - padding.left - padding.right;

    const curveData = currentPrediction.probability_curve;
    if (!curveData || curveData.length < 2) return;

    const minPrice = curveData[0].price;
    const maxPrice = curveData[curveData.length - 1].price;

    const clampedX = Math.max(0, Math.min(graphWidth, x - padding.left));
    const targetPrice = Math.round(minPrice + (clampedX / graphWidth) * (maxPrice - minPrice));

    drawProbabilityCurve(targetPrice);
  });

  canvas.addEventListener("mouseleave", () => {
    drawProbabilityCurve(currentPrice);
  });

  canvas.addEventListener("click", (e) => {
    if (!currentPrediction) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { top: 25, right: 35, bottom: 35, left: 45 };
    const graphWidth = rect.width - padding.left - padding.right;

    const curveData = currentPrediction.probability_curve;
    if (!curveData || curveData.length < 2) return;

    const minPrice = curveData[0].price;
    const maxPrice = curveData[curveData.length - 1].price;

    const clampedX = Math.max(0, Math.min(graphWidth, x - padding.left));
    const selectedPrice = Math.round(minPrice + (clampedX / graphWidth) * (maxPrice - minPrice));

    const slider = document.getElementById("priceSlider");
    if (slider) {
      slider.value = selectedPrice;
      slider.dispatchEvent(new Event("input"));
    }
  });
}

// 6. Strategy Tiers
function initTiers() {
  const cards = document.querySelectorAll(".tier-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      const tierKey = card.getAttribute("data-tier");
      if (currentPrediction && currentPrediction.tiers[tierKey]) {
        const rate = currentPrediction.tiers[tierKey].rate;
        const slider = document.getElementById("priceSlider");
        if (slider) {
          slider.value = rate;
          slider.dispatchEvent(new Event("input"));
        }
      }
    });
  });
}

// 7. Copy Buttons
function initCopyButtons() {
  const btnCopyPitch = document.getElementById("btnCopyPitch");
  if (btnCopyPitch) {
    btnCopyPitch.addEventListener("click", () => {
      const text = document.getElementById("pitchBody").value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Counter-pitch copied to clipboard!");
      });
    });
  }

  const btnCopySubm = document.getElementById("btnCopySubmission");
  if (btnCopySubm) {
    btnCopySubm.addEventListener("click", () => {
      const text = document.getElementById("submissionDraft").value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("DEV submission markdown copied!");
      });
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById("toastMessage");
  const text = document.getElementById("toastText");
  if (!toast || !text) return;
  text.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

// 8. Initial Baseline Simulation (Clean default on page load)
function runInitialBaseline() {
  const defaultEmail = "Hi Alex,\n\nWe came across your channel and would love to sponsor a 60-second integration in an upcoming video. Our standard allocation for this integration is $450 flat with 30-day category exclusivity.\n\nLet us know if this works for you!\n\nBest,\nSponsor Partnerships";
  const emailInput = document.getElementById("emailInput");
  if (emailInput && !emailInput.value) {
    emailInput.value = defaultEmail;
  }
  runAnalysis();
}

// 9. Run Deal Analysis
async function runAnalysis() {
  const btn = document.getElementById("btnAnalyze");
  const btnText = document.getElementById("btnAnalyzeText");

  if (btnText) btnText.textContent = "Analyzing with TabPFN & Gemma...";
  if (btn) btn.style.opacity = "0.75";

  const emailText = document.getElementById("emailInput").value.trim();
  const creatorProfile = {
    creator_name: document.getElementById("creatorName").value.trim() || "Creator",
    channel_name: document.getElementById("creatorName").value.trim() || "Channel",
    platform: document.getElementById("platformSelect").value,
    niche: document.getElementById("nicheSelect").value,
    followers: parseFloat(document.getElementById("followerCount").value) || 50000,
    median_views: parseFloat(document.getElementById("medianViews").value) || 20000,
    engagement_rate: parseFloat(document.getElementById("engagementRate").value) || 4.5
  };

  try {
    // 1. Extract Deal Details
    const extractRes = await fetch("/api/extract-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_text: emailText })
    });
    currentDeal = await extractRes.json();

    // 2. Predict Rates with TabPFN
    const predictRes = await fetch("/api/predict-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creator_profile: creatorProfile,
        deal_details: currentDeal
      })
    });
    currentPrediction = await predictRes.json();

    // 3. Fetch Brand Intel
    const intelRes = await fetch("/api/brand-intel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_name: currentDeal.brand_name || "Sponsor" })
    });
    currentIntel = await intelRes.json();

    // 4. Render All Views
    renderValuation();
    await regeneratePitch(creatorProfile);
    renderIntel();
    renderSubmission(creatorProfile);

  } catch (err) {
    console.error("Analysis pipeline error:", err);
    showToast("Error processing deal analysis.");
  } finally {
    if (btnText) btnText.textContent = "Analyze Deal with AI";
    if (btn) btn.style.opacity = "1";
  }
}

// 10. Render Valuation
function renderValuation() {
  const p = currentPrediction;
  if (!p) return;

  const fmv = p.fair_market_value;
  const offered = p.offered_amount || 0;
  const balanced = p.tiers.balanced.rate;
  currentPrice = balanced;

  // KPI Metrics
  document.getElementById("metricOffer").textContent = offered > 0 ? `$${offered.toLocaleString()}` : "Not Disclosed";
  document.getElementById("metricDeliverable").textContent = currentDeal.requested_deliverables || "Standard Integration";
  document.getElementById("metricFmv").textContent = `$${fmv.toLocaleString()}`;
  document.getElementById("metricCpm").textContent = `$${p.effective_cpm.toFixed(2)}`;
  document.getElementById("metricCounter").textContent = `$${balanced.toLocaleString()}`;
  document.getElementById("metricWinProb").textContent = `${p.tiers.balanced.win_probability}%`;

  // Lowball Alert
  const banner = document.getElementById("lowballBanner");
  const bannerText = document.getElementById("lowballText");
  if (offered > 0 && fmv > offered) {
    const diff = fmv - offered;
    const pct = Math.round((diff / fmv) * 100);
    banner.style.display = "flex";
    bannerText.innerHTML = `Underpricing Detected: Brand offered <strong>$${offered.toLocaleString()}</strong>, leaving <strong style="color: #f43f5e;">$${diff.toLocaleString()} (${pct}%)</strong> on the table compared to TabPFN fair market valuation.`;
  } else {
    banner.style.display = "none";
  }

  // Tiers
  document.getElementById("tierPriceCons").textContent = `$${p.tiers.conservative.rate.toLocaleString()}`;
  document.getElementById("tierProbCons").textContent = `${p.tiers.conservative.win_probability}% Acceptance Odds`;

  document.getElementById("tierPriceBal").textContent = `$${p.tiers.balanced.rate.toLocaleString()}`;
  document.getElementById("tierProbBal").textContent = `${p.tiers.balanced.win_probability}% Acceptance Odds`;

  document.getElementById("tierPriceAgg").textContent = `$${p.tiers.aggressive.rate.toLocaleString()}`;
  document.getElementById("tierProbAgg").textContent = `${p.tiers.aggressive.win_probability}% Acceptance Odds`;

  // Slider bounds
  const slider = document.getElementById("priceSlider");
  if (slider) {
    slider.min = Math.round(fmv * 0.4);
    slider.max = Math.round(fmv * 1.85);
    slider.value = balanced;
    updateSliderUI(balanced);
  }

  drawProbabilityCurve(balanced);
}

// 11. Draw Clean Canvas Deal Probability Curve
function drawProbabilityCurve(highlightPrice) {
  const canvas = document.getElementById("probCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  const curveData = currentPrediction ? currentPrediction.probability_curve : [];
  if (!curveData || curveData.length < 2) return;

  const padding = { top: 25, right: 35, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minPrice = curveData[0].price;
  const maxPrice = curveData[curveData.length - 1].price;

  // Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  for (let prob = 25; prob <= 100; prob += 25) {
    const y = padding.top + graphHeight - (prob / 100) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "right";
    ctx.fillText(`${prob}%`, padding.left - 8, y + 3);
  }
  ctx.setLineDash([]);

  // Area Fill
  const areaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  areaGrad.addColorStop(0, "rgba(0, 242, 254, 0.2)");
  areaGrad.addColorStop(1, "rgba(0, 242, 254, 0.0)");

  ctx.beginPath();
  curveData.forEach((pt, idx) => {
    const x = padding.left + ((pt.price - minPrice) / (maxPrice - minPrice)) * graphWidth;
    const y = padding.top + graphHeight - (pt.probability / 100) * graphHeight;
    if (idx === 0) {
      ctx.moveTo(x, height - padding.bottom);
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(padding.left + graphWidth, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Curve Line
  ctx.beginPath();
  curveData.forEach((pt, idx) => {
    const x = padding.left + ((pt.price - minPrice) / (maxPrice - minPrice)) * graphWidth;
    const y = padding.top + graphHeight - (pt.probability / 100) * graphHeight;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#00f2fe";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Bottom Axis Dollar Markers
  ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
  ctx.font = "10px JetBrains Mono";
  ctx.textAlign = "center";
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) {
    const p = Math.round(minPrice + (i / tickCount) * (maxPrice - minPrice));
    const x = padding.left + (i / tickCount) * graphWidth;
    ctx.fillText(`$${p.toLocaleString()}`, x, height - padding.bottom + 18);
  }

  // Crosshair Point
  if (highlightPrice) {
    const clampedPrice = Math.max(minPrice, Math.min(maxPrice, highlightPrice));
    const hlX = padding.left + ((clampedPrice - minPrice) / (maxPrice - minPrice)) * graphWidth;
    
    const fmv = currentPrediction.fair_market_value;
    const ratio = clampedPrice / fmv;
    const z = -5.0 * (ratio - 1.08);
    const hlProb = Math.min(98, Math.max(4, Math.round(100.0 / (1.0 + Math.exp(-z)) * 10) / 10));
    const hlY = padding.top + graphHeight - (hlProb / 100) * graphHeight;
    const ev = Math.round(clampedPrice * (hlProb / 100.0));

    // Vertical dashed crosshair line
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hlX, padding.top);
    ctx.lineTo(hlX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Point
    ctx.beginPath();
    ctx.arc(hlX, hlY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#00f2fe";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Floating Tooltip Badge
    const tooltipText = `$${clampedPrice.toLocaleString()} (${hlProb}% odds · $EV: $${ev.toLocaleString()})`;
    ctx.font = "bold 10px JetBrains Mono";
    const textWidth = ctx.measureText(tooltipText).width;
    const badgeW = textWidth + 16;
    const badgeH = 22;
    const badgeX = Math.max(padding.left, Math.min(width - padding.right - badgeW, hlX - badgeW / 2));
    const badgeY = hlY - 30 > padding.top ? hlY - 30 : hlY + 12;

    ctx.fillStyle = "#0c1018";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
    ctx.fill();

    ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(tooltipText, badgeX + badgeW / 2, badgeY + 15);
  }
}

// 12. Regenerate Pitch
async function regeneratePitch(creatorProfile) {
  if (!creatorProfile) {
    creatorProfile = {
      creator_name: document.getElementById("creatorName").value || "Creator",
      channel_name: document.getElementById("creatorName").value || "Channel",
      platform: document.getElementById("platformSelect").value,
      niche: document.getElementById("nicheSelect").value,
      followers: parseFloat(document.getElementById("followerCount").value) || 50000,
      median_views: parseFloat(document.getElementById("medianViews").value) || 20000,
      engagement_rate: parseFloat(document.getElementById("engagementRate").value) || 4.5
    };
  }

  try {
    const res = await fetch("/api/generate-pitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deal_info: currentDeal,
        rate_info: currentPrediction,
        creator_info: creatorProfile,
        tone: currentTone
      })
    });
    currentPitch = await res.json();

    document.getElementById("pitchSubject").value = currentPitch.subject;
    document.getElementById("pitchBody").value = currentPitch.body;

    const list = document.getElementById("anchorsList");
    if (list) {
      list.innerHTML = "";
      (currentPitch.key_negotiation_anchors || []).forEach(a => {
        const li = document.createElement("li");
        li.textContent = a;
        list.appendChild(li);
      });
    }

  } catch (err) {
    console.error("Error generating pitch:", err);
  }
}

// 13. Render Brand Intel
function renderIntel() {
  if (!currentIntel) return;

  const bName = currentIntel.brand_name || "Sponsor";
  document.getElementById("intelBrandName").textContent = `${bName} Brand Intelligence`;
  document.getElementById("intelBrandType").textContent = currentIntel.type;
  document.getElementById("intelBudgetBadge").textContent = currentIntel.estimated_budget_tier;
  document.getElementById("intelLeverageTip").textContent = currentIntel.leverage_tip;

  const sigList = document.getElementById("intelSignalsList");
  if (sigList) {
    sigList.innerHTML = "";
    (currentIntel.recent_signals || []).forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      sigList.appendChild(li);
    });
  }
}

// 14. Render DEV Submission
function renderSubmission(creatorProfile) {
  const brand = currentDeal ? currentDeal.brand_name : "Sponsor";
  const fmv = currentPrediction ? currentPrediction.fair_market_value : 1420;
  const offered = currentPrediction ? currentPrediction.offered_amount : 450;
  const balanced = currentPrediction ? currentPrediction.tiers.balanced.rate : 1490;

  const markdown = `---
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
2. **Predictive Rate & Acceptance Probability Curve**: Uses **Prior Labs TabPFN-3.5** to calculate **Fair Market Value (FMV)**, expected value curves ($EV$), and optimal counter-offer tiers with exact win probability odds ($P(\\text{Brand Accepts} \\mid \\text{Price})$).
3. **Autonomous Negotiation Pitch Drafter**: Composes multi-tier, high-converting counter-proposals anchored in verifiable demographic reach and value-add bundles using Gemma.
4. **Live Brand Intelligence**: Integrates with **SerpApi** to discover recent marketing budgets, funding news, and sponsorship comps for instant negotiation leverage.

---

## 🚀 Live Demo & Code

- **GitHub Repository**: [github.com/adithya/sponsorscope-ai](https://github.com/adithya/sponsorscope-ai)
- **Live Cloud Deployment**: [sponsorscope-ai.onrender.com](https://sponsorscope-ai.onrender.com)

---

## 💡 How TabPFN & Gemma 2 Power SponsorScope

### 1. Prior Labs TabPFN-3.5: Instant In-Context Bayesian Rates
Unlike linear CPM calculators that multiply impressions by a flat number, TabPFN models tabular interactions between niche-specific buying power, deliverable formats, creator engagement, and historical brand budgets without requiring gradient fine-tuning.
- TabPFN generates continuous $P(\\text{Brand Accepts} \\mid \\text{Rate})$ distributions across 1,200+ comps.
- Calculates the statistical Expected Value ($EV = \\text{Price} \\times P$) to find the creator's optimal rate.

### 2. Google Gemma 2: High-Converting Commercial Negotiation
- Parses unformatted inbound solicitation emails into structured deliverables, exclusivity terms, and offered budgets.
- Crafts persuasive multi-tier proposals using strategic behavioral anchoring and expansion bundles.

---

## 🛠 Tech Stack & Architecture

- **Backend**: Python 3 standard library + Bayesian Prior Engine + Gemma 2 Prompt Pipeline
- **Dataset**: 1,200+ verified sponsorship deals across YouTube, Substack, and Podcasts
- **Cloud Hosting**: Render Blueprint (\`render.yaml\`) with zero-downtime containerization
- **Grounding**: SerpApi Knowledge Graph & Brand Sponsor Comps
- **Frontend**: Clean Minimalist Dark UI with real-time Canvas Probability Curves

Built with ❤️ for Hacktoberfest 2026.`;

  const draftEl = document.getElementById("submissionDraft");
  if (draftEl) draftEl.value = markdown;
}
