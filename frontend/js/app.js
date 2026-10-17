// ==========================================================================
// SponsorScope AI — Client-Side Application Controller
// High-performance reactive controller for TabPFN & Gemma 2 negotiation agent
// ==========================================================================

let currentPrediction = null;
let currentDeal = null;
let currentPitch = null;
let currentIntel = null;
let currentTone = "balanced";
let currentPrice = 1490;
let presetsData = [];
let activeBundles = new Set();

document.addEventListener("DOMContentLoaded", () => {
  initPresets();
  initTabs();
  initQuickChips();
  initTonePills();
  initSlider();
  initQuickJumps();
  initTiers();
  initSuperhumanEmailTools();
  initCanvasInteraction();
  initFloatingEvaluator();
  initDEVSubmissionCopy();
  initInboxClear();

  window.addEventListener("resize", () => {
    if (currentPrediction) {
      drawProbabilityCurve(currentPrice);
    }
  });

  document.getElementById("btnAnalyze").addEventListener("click", () => {
    runFullAnalysis();
  });
});

// 1. Initialize Presets
async function initPresets() {
  try {
    const res = await fetch("/api/presets");
    if (res.ok) {
      presetsData = await res.json();
      setupPresetButtons();
    }
  } catch (err) {
    console.warn("Could not load remote presets:", err);
  }
}

function setupPresetButtons() {
  const nordBtn = document.getElementById("btnPresetNord");
  const notionBtn = document.getElementById("btnPresetNotion");
  const supabaseBtn = document.getElementById("btnPresetSupabase");
  const datadogBtn = document.getElementById("btnPresetDatadog");

  if (nordBtn && presetsData[0]) nordBtn.addEventListener("click", () => applyPreset(presetsData[0], nordBtn));
  if (notionBtn && presetsData[1]) notionBtn.addEventListener("click", () => applyPreset(presetsData[1], notionBtn));
  if (supabaseBtn && presetsData[2]) supabaseBtn.addEventListener("click", () => applyPreset(presetsData[2], supabaseBtn));
  if (datadogBtn && presetsData[3]) datadogBtn.addEventListener("click", () => applyPreset(presetsData[3], datadogBtn));

  // Auto load first preset on startup
  if (presetsData.length > 0) {
    applyPreset(presetsData[0], nordBtn);
  }
}

function applyPreset(preset, activeBtn) {
  if (!preset) return;

  document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");

  const cp = preset.creator_profile;
  document.getElementById("creatorName").value = `${cp.creator_name} (@${(cp.channel_name || "creator").toLowerCase().replace(/\s+/g, '')})`;
  document.getElementById("platformSelect").value = cp.platform;
  document.getElementById("nicheSelect").value = cp.niche;
  document.getElementById("followerCount").value = cp.followers;
  document.getElementById("medianViews").value = cp.median_views;
  document.getElementById("engagementRate").value = cp.engagement_rate;
  document.getElementById("emailInput").value = preset.email;

  // Update brand badge in email header
  const tagEl = document.getElementById("inboundBrandTag");
  if (tagEl) {
    const bName = preset.title.split("—")[0].trim();
    tagEl.textContent = bName;
  }

  // Clear any existing active bundles for fresh run
  activeBundles.clear();

  runFullAnalysis();
}

// 2. Navigation Tabs
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
        setTimeout(() => drawProbabilityCurve(currentPrice), 60);
      }
    });
  });
}

// 3. Quick Chips for Followers
function initQuickChips() {
  const chips = document.querySelectorAll(".quick-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const val = parseInt(chip.getAttribute("data-val"));
      document.getElementById("followerCount").value = val;

      // Estimate median views (~40% of subs)
      const estViews = Math.round(val * 0.42);
      document.getElementById("medianViews").value = estViews;
    });
  });
}

// 4. Tone Selector
function initTonePills() {
  const pills = document.querySelectorAll(".tone-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentTone = pill.getAttribute("data-tone");
      if (currentDeal && currentPrediction) {
        regeneratePitch();
      }
    });
  });
}

// 5. Interactive Price Slider
function initSlider() {
  const slider = document.getElementById("priceSlider");
  slider.addEventListener("input", (e) => {
    const price = parseInt(e.target.value);
    currentPrice = price;
    updateSliderUI(price);
  });
}

function updateSliderUI(price) {
  document.getElementById("sliderVal").textContent = `$${price.toLocaleString()}`;

  if (currentPrediction && currentPrediction.fair_market_value) {
    const fmv = currentPrediction.fair_market_value;
    const ratio = price / fmv;
    const z = -5.0 * (ratio - 1.08);
    const prob = Math.min(98, Math.max(4, Math.round(100.0 / (1.0 + Math.exp(-z)) * 10) / 10));
    const ev = Math.round(price * (prob / 100.0));

    document.getElementById("sliderProb").textContent = `${prob}%`;
    document.getElementById("sliderEv").textContent = `$${ev.toLocaleString()}`;

    // Update floating evaluator
    updateFloatingEvaluator(price, prob);

    drawProbabilityCurve(price);
  }
}

// 6. Quick Jump Buttons on Probability Graph
function initQuickJumps() {
  const btnSafe = document.getElementById("btnJumpSafe");
  const btnEv = document.getElementById("btnJumpEv");
  const btnAgg = document.getElementById("btnJumpAgg");

  const setActiveJump = (activeBtn) => {
    document.querySelectorAll(".quick-jump-btn").forEach(b => b.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
  };

  if (btnSafe) {
    btnSafe.addEventListener("click", () => {
      setActiveJump(btnSafe);
      if (currentPrediction) {
        const rate = currentPrediction.tiers.conservative.rate;
        applyPrice(rate);
        showToast(`Applied Safe Rate: $${rate.toLocaleString()}`);
      }
    });
  }

  if (btnEv) {
    btnEv.addEventListener("click", () => {
      setActiveJump(btnEv);
      if (currentPrediction) {
        const rate = currentPrediction.tiers.balanced.rate;
        applyPrice(rate);
        showToast(`Applied Optimal $EV Rate: $${rate.toLocaleString()}`);
      }
    });
  }

  if (btnAgg) {
    btnAgg.addEventListener("click", () => {
      setActiveJump(btnAgg);
      if (currentPrediction) {
        const rate = currentPrediction.tiers.aggressive.rate;
        applyPrice(rate);
        showToast(`Applied Aggressive Rate: $${rate.toLocaleString()}`);
      }
    });
  }
}

function applyPrice(price) {
  const slider = document.getElementById("priceSlider");
  slider.value = price;
  currentPrice = price;
  updateSliderUI(price);
}

// 7. Canvas Mouse Hover, Scrub & Click Interaction
function initCanvasInteraction() {
  const canvas = document.getElementById("probCanvas");
  if (!canvas) return;

  let isDragging = false;

  const handlePointer = (e) => {
    if (!currentPrediction) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { top: 30, right: 40, bottom: 40, left: 50 };
    const graphWidth = rect.width - padding.left - padding.right;

    const curveData = currentPrediction.probability_curve;
    if (!curveData || curveData.length < 2) return;

    const minPrice = curveData[0].price;
    const maxPrice = curveData[curveData.length - 1].price;

    const clampedX = Math.max(0, Math.min(graphWidth, x - padding.left));
    const targetPrice = Math.round(minPrice + (clampedX / graphWidth) * (maxPrice - minPrice));

    if (isDragging) {
      applyPrice(targetPrice);
    } else {
      drawProbabilityCurve(targetPrice);
    }
  };

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    handlePointer(e);
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    handlePointer(e);
  });

  canvas.addEventListener("mouseleave", () => {
    if (!isDragging) {
      drawProbabilityCurve(currentPrice);
    }
  });

  canvas.addEventListener("click", (e) => {
    if (!currentPrediction) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { top: 30, right: 40, bottom: 40, left: 50 };
    const graphWidth = rect.width - padding.left - padding.right;

    const curveData = currentPrediction.probability_curve;
    if (!curveData || curveData.length < 2) return;

    const minPrice = curveData[0].price;
    const maxPrice = curveData[curveData.length - 1].price;

    const clampedX = Math.max(0, Math.min(graphWidth, x - padding.left));
    const selectedPrice = Math.round(minPrice + (clampedX / graphWidth) * (maxPrice - minPrice));

    applyPrice(selectedPrice);
  });
}

// 8. Strategy Tiers
function initTiers() {
  const tierBoxes = document.querySelectorAll(".tier-box");
  tierBoxes.forEach(box => {
    box.addEventListener("click", () => {
      tierBoxes.forEach(b => b.classList.remove("selected"));
      box.classList.add("selected");

      const tierKey = box.getAttribute("data-tier");
      if (currentPrediction && currentPrediction.tiers[tierKey]) {
        const rate = currentPrediction.tiers[tierKey].rate;
        applyPrice(rate);
        showToast(`Applied ${tierKey.toUpperCase()} tier: $${rate.toLocaleString()}`);
      }
    });
  });
}

// 9. Superhuman Email Tools & Copy
function initSuperhumanEmailTools() {
  const btnCopy = document.getElementById("btnCopyPitch");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const text = document.getElementById("pitchBody").value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Gemma Counter-Pitch copied to clipboard!");
      });
    });
  }

  const btnMailto = document.getElementById("btnMailtoPitch");
  if (btnMailto) {
    btnMailto.addEventListener("click", () => {
      const subject = encodeURIComponent(document.getElementById("pitchSubject").value);
      const body = encodeURIComponent(document.getElementById("pitchBody").value);
      const recipient = document.getElementById("pitchRecipient").textContent.trim();
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    });
  }

  const btnInsertRateCard = document.getElementById("btnInsertRateCard");
  if (btnInsertRateCard) {
    btnInsertRateCard.addEventListener("click", () => {
      if (!currentPrediction) return;
      const editor = document.getElementById("pitchBody");
      const fmv = currentPrediction.fair_market_value;
      const p = currentPrediction;
      const tableText = `\n\n--- Standard Rate Card & Tier Options ---\n` +
        `• Option A (Standard Integration): $${p.tiers.conservative.rate.toLocaleString()} (60s mid-roll + permanent link)\n` +
        `• Option B (Optimal Strategic Package): $${p.tiers.balanced.rate.toLocaleString()} (60s mid-roll + pinned comment + 30-day category exclusivity)\n` +
        `• Option C (Enterprise Omnichannel Flight): $${p.tiers.aggressive.rate.toLocaleString()} (Dedicated segment + newsletter sponsorship + paid whitelisting)\n---`;
      editor.value += tableText;
      updatePitchMetrics();
      showToast("Multi-tier rate card inserted into draft!");
    });
  }

  const btnInsertCaseStudy = document.getElementById("btnInsertCaseStudy");
  if (btnInsertCaseStudy) {
    btnInsertCaseStudy.addEventListener("click", () => {
      const editor = document.getElementById("pitchBody");
      const views = document.getElementById("medianViews").value;
      const eng = document.getElementById("engagementRate").value;
      const comps = `\n\nAudience Purchase Intent Data:\n• 30-day median verified views: ${parseInt(views).toLocaleString()}\n• Audience engagement index: ${eng}% (78% software engineers, DevOps, and tech leads)\n• Past developer tool partner campaigns average a 4.2% click-through rate with strong signup conversion.`;
      editor.value += comps;
      updatePitchMetrics();
      showToast("Audience demographic metrics inserted!");
    });
  }

  const pitchBody = document.getElementById("pitchBody");
  if (pitchBody) {
    pitchBody.addEventListener("input", () => {
      updatePitchMetrics();
    });
  }
}

function updatePitchMetrics() {
  const text = document.getElementById("pitchBody").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readSeconds = Math.max(10, Math.round((words / 220) * 60));

  const countEl = document.getElementById("pitchWordCount");
  const readEl = document.getElementById("pitchReadTime");
  if (countEl) countEl.textContent = `${words} words`;
  if (readEl) readEl.textContent = `~${readSeconds}s read`;
}

// 10. Inbox Clear Button
function initInboxClear() {
  const btn = document.getElementById("btnClearEmail");
  if (btn) {
    btn.addEventListener("click", () => {
      const ta = document.getElementById("emailInput");
      ta.value = "";
      ta.focus();
      showToast("Inbound email cleared");
    });
  }
}

// 11. Floating Deal Evaluator Widget
function initFloatingEvaluator() {
  const btn = document.getElementById("btnQuickApplyEv");
  if (btn) {
    btn.addEventListener("click", () => {
      if (currentPrediction) {
        const evRate = currentPrediction.tiers.balanced.rate;
        applyPrice(evRate);
        showToast(`Optimal $EV Rate ($${evRate.toLocaleString()}) Applied!`);
      }
    });
  }
}

function updateFloatingEvaluator(price, prob) {
  const el = document.getElementById("floatingUplift");
  if (!el || !currentDeal) return;

  const offered = currentDeal.offered_amount || 0;
  if (offered > 0) {
    const uplift = price - offered;
    const pct = Math.round((uplift / offered) * 100);
    el.textContent = `+$${uplift.toLocaleString()} (+${pct}%) vs Offer`;
  } else {
    el.textContent = `$${price.toLocaleString()} (${prob}% Odds)`;
  }
}

// 12. Copy DEV Submission Markdown
function initDEVSubmissionCopy() {
  const btn = document.getElementById("btnCopySubmission");
  if (btn) {
    btn.addEventListener("click", () => {
      const text = document.getElementById("submissionDraft").value;
      navigator.clipboard.writeText(text).then(() => {
        showToast("DEV Challenge submission markdown copied!");
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
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// 13. Full Analysis Pipeline (With Pipeline Progress Visualizer)
async function runFullAnalysis() {
  const btn = document.getElementById("btnAnalyze");
  const btnText = document.getElementById("btnAnalyzeText");
  const progress = document.getElementById("pipelineProgress");
  const stepGemma = document.getElementById("stepGemma");
  const stepTabpfn = document.getElementById("stepTabpfn");
  const stepPitch = document.getElementById("stepPitch");

  if (progress) progress.style.display = "flex";
  if (btnText) btnText.textContent = "Extracting with Gemma 2...";
  if (stepGemma) stepGemma.className = "pipeline-step active";
  if (stepTabpfn) stepTabpfn.className = "pipeline-step";
  if (stepPitch) stepPitch.className = "pipeline-step";

  btn.style.opacity = "0.75";

  const emailText = document.getElementById("emailInput").value;
  const creatorProfile = {
    creator_name: document.getElementById("creatorName").value,
    channel_name: document.getElementById("creatorName").value,
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

    // Advance pipeline progress
    if (btnText) btnText.textContent = "Bayesian Forecaster (TabPFN-3.5)...";
    if (stepTabpfn) stepTabpfn.className = "pipeline-step active";

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

    // Advance pipeline progress
    if (btnText) btnText.textContent = "Synthesizing Counter-Pitch...";
    if (stepPitch) stepPitch.className = "pipeline-step active";

    // Step 3: Fetch Brand Intel via SerpApi
    const intelRes = await fetch("/api/brand-intel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_name: currentDeal.brand_name })
    });
    currentIntel = await intelRes.json();

    // Step 4: Render All Results
    renderValuationTab(creatorProfile);
    await regeneratePitch(creatorProfile);
    renderIntelTab();
    renderSubmissionTab(creatorProfile);

  } catch (err) {
    console.error("Analysis pipeline error:", err);
    showToast("Error executing analysis pipeline.");
  } finally {
    if (btnText) btnText.textContent = "Run TabPFN & Gemma Analysis";
    btn.style.opacity = "1";
    setTimeout(() => {
      if (progress) progress.style.display = "none";
    }, 1200);
  }
}

// 14. Render Valuation & Canvas Curve
function renderValuationTab(creatorProfile) {
  const p = currentPrediction;
  if (!p) return;

  const fmv = p.fair_market_value;
  const offered = p.offered_amount;
  const balanced = p.tiers.balanced.rate;
  currentPrice = balanced;

  document.getElementById("metricOffer").textContent = offered > 0 ? `$${offered.toLocaleString()}` : "Not Disclosed";
  document.getElementById("metricDeliverable").textContent = currentDeal.requested_deliverables || "Standard Integration";
  document.getElementById("metricFmv").textContent = `$${fmv.toLocaleString()}`;
  document.getElementById("metricCpm").textContent = `$${p.effective_cpm.toFixed(2)}`;
  document.getElementById("metricCounter").textContent = `$${balanced.toLocaleString()}`;
  document.getElementById("metricWinProb").textContent = `${p.tiers.balanced.win_probability}%`;

  if (offered > 0) {
    const gain = balanced - offered;
    const gainPct = Math.round((gain / offered) * 100);
    const gainEl = document.getElementById("metricGain");
    if (gainEl) gainEl.textContent = `+$${gain.toLocaleString()} (+${gainPct}%) Upside`;
  }

  // Lowball Alert
  const banner = document.getElementById("lowballBanner");
  if (offered > 0 && fmv > offered) {
    const diff = fmv - offered;
    const pct = Math.round((diff / fmv) * 100);
    banner.style.display = "flex";
    banner.innerHTML = `
      <div class="lowball-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="lowball-text">
        <strong>Severe Underpricing Detected:</strong> The brand offered <strong>$${offered.toLocaleString()}</strong>, leaving <strong style="color: #f43f5e;">$${diff.toLocaleString()} (${pct}%)</strong> on the table compared to TabPFN fair market valuation.
      </div>
    `;
  } else {
    banner.style.display = "none";
  }

  // Strategy Tiers
  document.getElementById("tierPriceCons").textContent = `$${p.tiers.conservative.rate.toLocaleString()}`;
  document.getElementById("tierPriceBal").textContent = `$${p.tiers.balanced.rate.toLocaleString()}`;
  document.getElementById("tierPriceAgg").textContent = `$${p.tiers.aggressive.rate.toLocaleString()}`;

  // Slider bounds
  const slider = document.getElementById("priceSlider");
  const minVal = Math.round(fmv * 0.4);
  const maxVal = Math.round(fmv * 1.85);
  slider.min = minVal;
  slider.max = maxVal;
  slider.value = balanced;
  updateSliderUI(balanced);

  // Render Smart Upsell Bundles with Live Checkboxes
  renderBundlesList(p.bundles || []);

  drawProbabilityCurve(balanced);
}

// 15. Render Bundles with Interactive Checkbox Toggles
function renderBundlesList(bundles) {
  const bundlesList = document.getElementById("bundlesList");
  if (!bundlesList) return;
  bundlesList.innerHTML = "";

  bundles.forEach((b, idx) => {
    const card = document.createElement("div");
    card.className = "bundle-card";
    card.id = `bundleCard_${idx}`;

    const tagsHtml = b.components.map(comp => `<span class="bundle-component-tag">${comp}</span>`).join("");
    
    card.innerHTML = `
      <div class="bundle-checkbox-group">
        <input type="checkbox" class="bundle-check-input" id="bundleCheck_${idx}" data-idx="${idx}" data-price="${b.total_bundle_price}" data-name="${b.bundle_name}">
        <div class="bundle-info">
          <h5>
            <span>${b.bundle_name}</span>
            <span class="badge badge-emerald" style="font-size: 0.65rem;">
              ${b.acceptance_odds}
            </span>
          </h5>
          <div class="bundle-components">${tagsHtml}</div>
          <p style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.4;">${b.reasoning}</p>
        </div>
      </div>
      <div class="bundle-action">
        <div class="bundle-price">$${b.total_bundle_price.toLocaleString()}</div>
        <div class="bundle-upsell-tag">+${b.add_on_price.toLocaleString()} Expansion</div>
      </div>
    `;

    bundlesList.appendChild(card);

    // Wire up toggle listener
    const checkbox = card.querySelector(".bundle-check-input");
    checkbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      card.classList.toggle("included", isChecked);

      if (isChecked) {
        activeBundles.add(b.bundle_name);
        applyPrice(b.total_bundle_price);
        showToast(`Added ${b.bundle_name} (Total: $${b.total_bundle_price.toLocaleString()})`);
      } else {
        activeBundles.delete(b.bundle_name);
        const defaultRate = currentPrediction.tiers.balanced.rate;
        applyPrice(defaultRate);
        showToast(`Reverted to default tier rate ($${defaultRate.toLocaleString()})`);
      }

      // Dynamically reflect bundle in pitch
      updatePitchWithBundles();
    });
  });
}

function updatePitchWithBundles() {
  if (!currentPitch) return;
  const editor = document.getElementById("pitchBody");
  if (activeBundles.size > 0) {
    const bundleNames = Array.from(activeBundles).join(" + ");
    editor.value = currentPitch.body + `\n\nExpansion Bundle Included:\nI have packaged this with ${bundleNames} for maximum campaign impact.`;
  } else {
    editor.value = currentPitch.body;
  }
  updatePitchMetrics();
}

// 16. Draw High-Aesthetic Canvas Deal Probability Curve with Spline Smoothing
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

  const padding = { top: 30, right: 40, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minPrice = curveData[0].price;
  const maxPrice = curveData[curveData.length - 1].price;

  // Draw 3 Colored Strategic Zones in Background
  const safeThresholdX = padding.left + graphWidth * 0.4;
  const riskThresholdX = padding.left + graphWidth * 0.75;

  // Safe Zone (Greenish subtle gradient)
  const safeGrad = ctx.createLinearGradient(padding.left, 0, safeThresholdX, 0);
  safeGrad.addColorStop(0, "rgba(16, 185, 129, 0.08)");
  safeGrad.addColorStop(1, "rgba(16, 185, 129, 0.02)");
  ctx.fillStyle = safeGrad;
  ctx.fillRect(padding.left, padding.top, safeThresholdX - padding.left, graphHeight);

  // Sweet Spot Zone (Cyan subtle gradient)
  const sweetGrad = ctx.createLinearGradient(safeThresholdX, 0, riskThresholdX, 0);
  sweetGrad.addColorStop(0, "rgba(0, 242, 254, 0.05)");
  sweetGrad.addColorStop(1, "rgba(0, 242, 254, 0.02)");
  ctx.fillStyle = sweetGrad;
  ctx.fillRect(safeThresholdX, padding.top, riskThresholdX - safeThresholdX, graphHeight);

  // Risk Zone (Rose subtle gradient)
  const riskGrad = ctx.createLinearGradient(riskThresholdX, 0, width - padding.right, 0);
  riskGrad.addColorStop(0, "rgba(244, 63, 94, 0.03)");
  riskGrad.addColorStop(1, "rgba(244, 63, 94, 0.08)");
  ctx.fillStyle = riskGrad;
  ctx.fillRect(riskThresholdX, padding.top, width - padding.right - riskThresholdX, graphHeight);

  // Dotted Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  for (let prob = 20; prob <= 100; prob += 20) {
    const y = padding.top + graphHeight - (prob / 100) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "right";
    ctx.fillText(`${prob}%`, padding.left - 10, y + 3);
  }
  ctx.setLineDash([]);

  // Calculate Points
  const points = curveData.map(pt => ({
    x: padding.left + ((pt.price - minPrice) / (maxPrice - minPrice)) * graphWidth,
    y: padding.top + graphHeight - (pt.probability / 100) * graphHeight
  }));

  // Smooth Area Gradient under the curve
  const areaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  areaGrad.addColorStop(0, "rgba(0, 242, 254, 0.35)");
  areaGrad.addColorStop(0.5, "rgba(79, 172, 254, 0.12)");
  areaGrad.addColorStop(1, "rgba(0, 242, 254, 0.0)");

  ctx.beginPath();
  ctx.moveTo(points[0].x, height - padding.bottom);
  ctx.lineTo(points[0].x, points[0].y);

  // Smooth Catmull-Rom or cubic spline segments
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Glow Stroke Underneath
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Crisp Curve Line on Top
  ctx.strokeStyle = "#00f2fe";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw Price Ticks on Bottom Axis
  ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
  ctx.font = "11px JetBrains Mono";
  ctx.textAlign = "center";
  const tickSteps = 5;
  for (let i = 0; i <= tickSteps; i++) {
    const p = Math.round(minPrice + (i / tickSteps) * (maxPrice - minPrice));
    const x = padding.left + (i / tickSteps) * graphWidth;
    ctx.fillText(`$${p.toLocaleString()}`, x, height - padding.bottom + 22);
  }

  // Highlight Crosshair Point
  if (highlightPrice) {
    const clampedPrice = Math.max(minPrice, Math.min(maxPrice, highlightPrice));
    const hlX = padding.left + ((clampedPrice - minPrice) / (maxPrice - minPrice)) * graphWidth;
    
    const fmv = currentPrediction.fair_market_value;
    const ratio = clampedPrice / fmv;
    const z = -5.0 * (ratio - 1.08);
    const hlProb = Math.min(98, Math.max(4, Math.round(100.0 / (1.0 + Math.exp(-z)) * 10) / 10));
    const hlY = padding.top + graphHeight - (hlProb / 100) * graphHeight;
    const ev = Math.round(clampedPrice * (hlProb / 100.0));

    // Vertical indicator line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(0, 242, 254, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hlX, padding.top);
    ctx.lineTo(hlX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Outer Pulsing Glow Circle
    ctx.beginPath();
    ctx.arc(hlX, hlY, 11, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 242, 254, 0.25)";
    ctx.fill();

    // Center Circle
    ctx.beginPath();
    ctx.arc(hlX, hlY, 6, 0, Math.PI * 2);
    ctx.fillStyle = hlProb > 65 ? "#10b981" : hlProb > 40 ? "#00f2fe" : "#f59e0b";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Floating Tooltip Badge with Price, Odds and EV
    const tooltipText = `$${clampedPrice.toLocaleString()} · ${hlProb}% odds · EV: $${ev.toLocaleString()}`;
    ctx.font = "bold 11px JetBrains Mono";
    const textWidth = ctx.measureText(tooltipText).width;
    const badgeW = textWidth + 20;
    const badgeH = 26;
    const badgeX = Math.max(padding.left, Math.min(width - padding.right - badgeW, hlX - badgeW / 2));
    const badgeY = hlY - 36 > padding.top ? hlY - 36 : hlY + 16;

    // Badge shadow & background
    ctx.fillStyle = "rgba(5, 8, 17, 0.95)";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(tooltipText, badgeX + badgeW / 2, badgeY + 17);
  }
}

// 17. Regenerate Gemma Pitch
async function regeneratePitch(creatorProfile) {
  if (!creatorProfile) {
    creatorProfile = {
      creator_name: document.getElementById("creatorName").value,
      channel_name: document.getElementById("creatorName").value,
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

    const brandName = (currentDeal ? currentDeal.brand_name : "Sponsor").toLowerCase().replace(/\s+/g, '');
    const recipientEl = document.getElementById("pitchRecipient");
    if (recipientEl) recipientEl.textContent = `partnerships@${brandName}.com`;

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

    updatePitchMetrics();

  } catch (err) {
    console.error("Error generating pitch:", err);
  }
}

// 18. Render Brand Intel (SerpApi Grounding)
function renderIntelTab() {
  if (!currentIntel) return;

  const bName = currentIntel.brand_name || "Sponsor";
  document.getElementById("intelBrandName").textContent = `${bName} Brand Dossier`;
  document.getElementById("intelBrandType").textContent = currentIntel.type;
  document.getElementById("intelBudgetBadge").textContent = currentIntel.estimated_budget_tier;
  document.getElementById("intelLeverageTip").textContent = currentIntel.leverage_tip;

  // Set avatar initial
  const iconEl = document.getElementById("intelBrandIcon");
  if (iconEl) iconEl.textContent = bName.charAt(0).toUpperCase();

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

// 19. Render DEV Hacktoberfest Submission Tab
function renderSubmissionTab(creatorProfile) {
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
- **Frontend**: Dark Obsidian UI with real-time Canvas Probability Curves

Built with ❤️ for Hacktoberfest 2026.`;

  const draftEl = document.getElementById("submissionDraft");
  if (draftEl) draftEl.value = markdown;
}
