// ==========================================================================
// SponsorScope — Clean Application Controller
// Human-like, reliable, rectangular desktop tool logic
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
  initGuideToggle();

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

  // Pre-render clean baseline data on startup
  runInitialBaseline();

  // Check URL hash for direct tab navigation
  if (window.location.hash) {
    const tabName = window.location.hash.replace("#", "");
    const targetTab = document.querySelector(`.clean-tab[data-tab="${tabName}"]`);
    if (targetTab) {
      setTimeout(() => targetTab.click(), 150);
    }
  }
});

// 1. Clean Rectangular Tabs
function initTabs() {
  const tabBtns = document.querySelectorAll(".clean-tab");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetTab = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(tp => tp.style.display = "none");
      const targetEl = document.getElementById(targetTab);
      if (targetEl) targetEl.style.display = "block";

      if (targetTab === "tabValuation" && currentPrediction) {
        setTimeout(() => drawProbabilityCurve(currentPrice), 40);
      }
    });
  });
}

// 2. Guide Toggle
function initGuideToggle() {
  const helpToggle = document.getElementById("btnHelpToggle");
  const closeGuide = document.getElementById("btnCloseGuide");
  const guideBox = document.getElementById("howToTest");

  if (helpToggle && guideBox) {
    helpToggle.addEventListener("click", (e) => {
      e.preventDefault();
      guideBox.style.display = (guideBox.style.display === "none" || !guideBox.style.display) ? "block" : "none";
    });
  }

  if (closeGuide && guideBox) {
    closeGuide.addEventListener("click", () => {
      guideBox.style.display = "none";
    });
  }
}

// 3. Tone Selector Buttons
function initToneButtons() {
  const btns = document.querySelectorAll(".btn-choice");
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

// 4. Clear Email Button
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

// 5. Interactive Price Slider
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

// 6. Canvas Mouse Interaction
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

// 7. Strategy Tiers
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

// 8. Copy Buttons & Toasts
function initCopyButtons() {
  const btnCopyPitch = document.getElementById("btnCopyPitch");
  if (btnCopyPitch) {
    btnCopyPitch.addEventListener("click", () => {
      const text = document.getElementById("pitchBody").value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Email text copied to clipboard");
      });
    });
  }

  const btnCopySubm = document.getElementById("btnCopySubmission");
  if (btnCopySubm) {
    btnCopySubm.addEventListener("click", () => {
      const text = document.getElementById("submissionDraft").value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("DEV challenge writeup copied");
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
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// 9. Initial Baseline Simulation on Page Load
function runInitialBaseline() {
  const defaultEmail = "Hi Alex,\n\nWe love your tech videos and want to sponsor a 60-second integration next month. Our standard starter budget is $450 with 30 days category exclusivity. Let us know if you're interested!\n\nBest,\nSponsor Partnerships";
  const emailInput = document.getElementById("emailInput");
  if (emailInput && !emailInput.value) {
    emailInput.value = defaultEmail;
  }
  runAnalysis();
}

// 10. Run Full Deal Analysis Pipeline
async function runAnalysis() {
  const btn = document.getElementById("btnAnalyze");
  const btnText = document.getElementById("btnAnalyzeText");

  if (btnText) btnText.textContent = "Calculating Rates & Pitch...";
  if (btn) btn.style.opacity = "0.75";

  const emailText = document.getElementById("emailInput").value.trim();
  const creatorProfile = {
    creator_name: document.getElementById("creatorName").value.trim() || "Alex Rivers",
    channel_name: document.getElementById("creatorName").value.trim() || "DevPulse",
    platform: document.getElementById("platformSelect").value,
    niche: document.getElementById("nicheSelect").value,
    followers: parseFloat(document.getElementById("followerCount").value) || 50000,
    median_views: parseFloat(document.getElementById("medianViews").value) || 20000,
    engagement_rate: parseFloat(document.getElementById("engagementRate").value) || 4.5
  };

  try {
    // Step 1: Extract Inbound Deal specs via Gemma
    const extractRes = await fetch("/api/extract-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_text: emailText })
    });
    currentDeal = await extractRes.json();

    // Step 2: Run TabPFN Predictive Forecaster
    const predictRes = await fetch("/api/predict-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creator_profile: creatorProfile,
        deal_details: currentDeal
      })
    });
    currentPrediction = await predictRes.json();

    // Step 3: Fetch Brand Intel
    const intelRes = await fetch("/api/brand-intel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_name: currentDeal.brand_name || "Sponsor" })
    });
    currentIntel = await intelRes.json();

    // Step 4: Render All Views
    renderValuation();
    await regeneratePitch(creatorProfile);
    renderIntel();
    renderSubmission(creatorProfile);

  } catch (err) {
    console.error("Analysis pipeline error:", err);
    showToast("Error processing deal analysis.");
  } finally {
    if (btnText) btnText.textContent = "Calculate Rates & Draft Reply";
    if (btn) btn.style.opacity = "1";
  }
}

// 11. Render Valuation Tab
function renderValuation() {
  const p = currentPrediction;
  if (!p) return;

  const fmv = p.fair_market_value;
  const offered = p.offered_amount || 0;
  const balanced = p.tiers.balanced.rate;
  currentPrice = balanced;

  // Key stats
  document.getElementById("metricOffer").textContent = offered > 0 ? `$${offered.toLocaleString()}` : "Not Disclosed";
  document.getElementById("metricDeliverable").textContent = currentDeal.requested_deliverables || "Standard Integration";
  document.getElementById("metricFmv").textContent = `$${fmv.toLocaleString()}`;
  document.getElementById("metricCpm").textContent = `$${p.effective_cpm.toFixed(2)}`;
  document.getElementById("metricCounter").textContent = `$${balanced.toLocaleString()}`;
  document.getElementById("metricWinProb").textContent = `${p.tiers.balanced.win_probability}%`;

  // Notice Banner
  const banner = document.getElementById("lowballBanner");
  const bannerText = document.getElementById("lowballText");
  if (offered > 0 && fmv > offered) {
    const diff = fmv - offered;
    const pct = Math.round((diff / fmv) * 100);
    banner.style.display = "block";
    bannerText.innerHTML = `<strong>Underpricing Detected:</strong> The brand offered <strong>$${offered.toLocaleString()}</strong>, which is <strong>$${diff.toLocaleString()} (${pct}%)</strong> below the estimated fair market rate of $${fmv.toLocaleString()} for your niche and view metrics.`;
  } else {
    banner.style.display = "none";
  }

  // Tiers
  document.getElementById("tierPriceCons").textContent = `$${p.tiers.conservative.rate.toLocaleString()}`;
  document.getElementById("tierProbCons").textContent = `${p.tiers.conservative.win_probability}% Acceptance`;

  document.getElementById("tierPriceBal").textContent = `$${p.tiers.balanced.rate.toLocaleString()}`;
  document.getElementById("tierProbBal").textContent = `${p.tiers.balanced.win_probability}% Acceptance`;

  document.getElementById("tierPriceAgg").textContent = `$${p.tiers.aggressive.rate.toLocaleString()}`;
  document.getElementById("tierProbAgg").textContent = `${p.tiers.aggressive.win_probability}% Acceptance`;

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

// 12. Draw Clean Desktop-Grade Canvas Curve (No Neon Ovals)
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

  // Crisp Dotted Horizontal Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  for (let prob = 25; prob <= 100; prob += 25) {
    const y = padding.top + graphHeight - (prob / 100) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "#8b949e";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "right";
    ctx.fillText(`${prob}%`, padding.left - 8, y + 3);
  }
  ctx.setLineDash([]);

  // Area Fill under Curve (Subtle Blue)
  const areaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  areaGrad.addColorStop(0, "rgba(56, 139, 253, 0.2)");
  areaGrad.addColorStop(1, "rgba(56, 139, 253, 0.0)");

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

  // Solid Curve Stroke
  ctx.beginPath();
  curveData.forEach((pt, idx) => {
    const x = padding.left + ((pt.price - minPrice) / (maxPrice - minPrice)) * graphWidth;
    const y = padding.top + graphHeight - (pt.probability / 100) * graphHeight;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#388bfd";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bottom Axis Dollar Markers
  ctx.fillStyle = "#8b949e";
  ctx.font = "10px JetBrains Mono";
  ctx.textAlign = "center";
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) {
    const p = Math.round(minPrice + (i / tickCount) * (maxPrice - minPrice));
    const x = padding.left + (i / tickCount) * graphWidth;
    ctx.fillText(`$${p.toLocaleString()}`, x, height - padding.bottom + 18);
  }

  // Crosshair Cursor Point
  if (highlightPrice) {
    const clampedPrice = Math.max(minPrice, Math.min(maxPrice, highlightPrice));
    const hlX = padding.left + ((clampedPrice - minPrice) / (maxPrice - minPrice)) * graphWidth;
    
    const fmv = currentPrediction.fair_market_value;
    const ratio = clampedPrice / fmv;
    const z = -5.0 * (ratio - 1.08);
    const hlProb = Math.min(98, Math.max(4, Math.round(100.0 / (1.0 + Math.exp(-z)) * 10) / 10));
    const hlY = padding.top + graphHeight - (hlProb / 100) * graphHeight;
    const ev = Math.round(clampedPrice * (hlProb / 100.0));

    // Vertical dashed line
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(56, 139, 253, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hlX, padding.top);
    ctx.lineTo(hlX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crisp Square Marker (Not Oval)
    ctx.fillStyle = "#388bfd";
    ctx.fillRect(hlX - 3.5, hlY - 3.5, 7, 7);

    // Rectangular Tooltip Badge (Not Oval)
    const tooltipText = `$${clampedPrice.toLocaleString()} (${hlProb}% odds · EV: $${ev.toLocaleString()})`;
    ctx.font = "600 10px JetBrains Mono";
    const textWidth = ctx.measureText(tooltipText).width;
    const badgeW = textWidth + 14;
    const badgeH = 20;
    const badgeX = Math.max(padding.left, Math.min(width - padding.right - badgeW, hlX - badgeW / 2));
    const badgeY = hlY - 28 > padding.top ? hlY - 28 : hlY + 10;

    ctx.fillStyle = "#161c2e";
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

    ctx.strokeStyle = "#388bfd";
    ctx.lineWidth = 1;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    ctx.fillStyle = "#f0f6fc";
    ctx.textAlign = "center";
    ctx.fillText(tooltipText, badgeX + badgeW / 2, badgeY + 14);
  }
}

// 13. Regenerate Counter-Pitch
async function regeneratePitch(creatorProfile) {
  if (!creatorProfile) {
    creatorProfile = {
      creator_name: document.getElementById("creatorName").value || "Alex Rivers",
      channel_name: document.getElementById("creatorName").value || "DevPulse",
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

// 14. Render Brand Intel
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

// 15. Render DEV Submission Draft
function renderSubmission(creatorProfile) {
  const brand = currentDeal ? currentDeal.brand_name : "Sponsor";
  const fmv = currentPrediction ? currentPrediction.fair_market_value : 1420;
  const offered = currentPrediction ? currentPrediction.offered_amount : 450;
  const balanced = currentPrediction ? currentPrediction.tiers.balanced.rate : 1490;

  const markdown = `---
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
- **Local Quickstart**: Run locally in seconds with \`python3 server.py\` (privacy-first, no external account needed)

---

## Walkthrough and Screenshots

### 1. Channel Profile, Deal Valuation, and Acceptance Probability Curve
When you input your channel stats and paste the sponsor inquiry, SponsorScope runs TabPFN-3.5 across 1,200 historical deals:

![Valuation & Acceptance Probability Curve](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/01_valuation_market_curve.png)

- **Initial Offer vs. Fair Market Value**: Highlights when an offer is substantially below market rates.
- **Interactive Acceptance Curve**: Plots estimated acceptance probability across price points so you can see where your expected payout peaks.
- **Three Strategic Tiers**:
  - Conservative ($1,160 @ 92% odds): Safe rate to close quickly.
  - Balanced EV ($1,490 @ 74% odds): Sweet spot maximizing expected return.
  - Aggressive ($1,920 @ 39% odds): Premium rate for well-funded brands.

### 2. Tailored Counter-Offer Reply (Gemma 2)
The **Drafted Counter-Email** tab generates a ready-to-send response written by Google Gemma 2:

![Gemma 2 Counter-Offer Email Drafter](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/02_counter_email_draft.png)

### 3. Sponsor Intelligence and Leverage (SerpApi Grounding)
The **Brand Intel** tab pulls market context on the sponsor:

![Brand Intelligence Dossier](https://raw.githubusercontent.com/Sai-Adithya-M/sponsorscope-ai/main/docs/screenshots/03_brand_intelligence.png)

---

## How I Built It

SponsorScope combines a tabular machine learning model with an open-weight language model:

- **TabPFN-3.5 (Prior Labs)**: Operates in-context over tabular records without fine-tuning, calibrated against 1,200 verified sponsorships to compute the acceptance curve.
- **Gemma 2 (Google)**: Open-weight model used to extract terms from unstructured emails and compose reasoned, non-confrontational replies.
- **Local Python Architecture**: Fast zero-dependency threaded HTTP service running on your machine.
- **SerpApi**: Real-time search grounding for brand marketing background and budget scale.

---

## Target Hackathon Tracks

- **Best Use of TabPFN**: In-context tabular forecasting and deal win probability modeling.
- **Best Use of Gemma**: Open-weight entity extraction and multi-tier negotiation email generation.
- **Best Use of SerpApi**: Grounded brand advertising research.`;

  const draftEl = document.getElementById("submissionDraft");
  if (draftEl) draftEl.value = markdown;
}
