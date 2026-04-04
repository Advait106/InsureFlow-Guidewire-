/* =============================================
   InsureFlow — app.js
   Core PWA Logic + Mock APIs + Demo Mode
   ============================================= */

'use strict';

// =========== MOCK DATA ===========
const MOCK_USERS = {
  default: {
    id: 'ZOM-2947381', name: 'Raju Sharma', zone: 'HSR Layout', upi: 'raju@upi',
    baseline: 5800, floor: 4350, premium: 52, weeklyEarned: 3900,
    todayEarned: 0, todayOrders: 0, todayHours: 0,
  }
};

const ZONES = [
  { name: 'BTM Layout', emoji: '🔴', risk: 'red', status: 'Flood Risk', earnings: '₹680/day', riskScore: 78 },
  { name: 'Koramangala', emoji: '🟡', risk: 'amber', status: 'Moderate', earnings: '₹920/day', riskScore: 45 },
  { name: 'HSR Layout', emoji: '🟢', risk: 'green', status: 'Safe', earnings: '₹850/day', riskScore: 18 },
  { name: 'Indiranagar', emoji: '🔵', risk: 'blue', status: 'Surge Zone', earnings: '₹1,040/day', riskScore: 22 },
  { name: 'Whitefield', emoji: '🟢', risk: 'green', status: 'Safe', earnings: '₹780/day', riskScore: 12 },
  { name: 'Jayanagar', emoji: '🟡', risk: 'amber', status: 'Moderate', earnings: '₹860/day', riskScore: 38 },
];

const PAYOUT_HISTORY = [
  { date: 'Mar 30, 2025', label: 'Weekly settlement', amount: 450, trigger: 'Heavy rainfall' },
  { date: 'Mar 16, 2025', label: 'Bridge advance', amount: 200, trigger: 'Earnings velocity drop' },
  { date: 'Mar 2, 2025', label: 'Weekly settlement', amount: 680, trigger: 'AQI > 300 + Traffic surge' },
  { date: 'Feb 23, 2025', label: 'Weekly settlement', amount: 310, trigger: 'Bandh — peer inactivity' },
];

const KARMA_ORDERS = [
  { customer: 'Rohit M.', area: 'BTM Layout', distance: '3.2km', karma: 'high', issue: 'Cancels 34% of orders', amount: '₹85' },
  { customer: 'Priya S.', area: 'HSR Layout', distance: '1.8km', karma: 'low', issue: 'Excellent customer', amount: '₹120' },
  { customer: 'Ankit K.', area: 'Koramangala', distance: '4.1km', karma: 'medium', issue: 'Occasional address issues', amount: '₹95' },
];

const FRAUD_LAYERS = [
  { icon: '📍', name: 'GPS Zone Validation', desc: 'Worker confirmed in affected zone during trigger window', result: 'pass', detail: 'HSR Layout, 14:30–16:45' },
  { icon: '🚴', name: 'Movement Analysis', desc: 'Kinematic velocity check — no GPS teleportation detected', result: 'pass', detail: 'Avg speed 18.4 km/h, normal' },
  { icon: '🧬', name: 'Earnings DNA Match', desc: 'Behavioral coherence with historical patterns', result: 'pass', detail: 'p_active = 0.82 (expected: 0.79)' },
  { icon: '👥', name: 'Peer Network Validation', desc: 'Peer disruption cluster: 47 workers affected in same zone', result: 'pass', detail: 'T_spike = 2.1σ (within threshold)' },
  { icon: '📱', name: 'Device Fingerprint', desc: 'Device ID consistent with registration — no spoofing detected', result: 'pass', detail: 'IMEI match: confirmed' },
  { icon: '⚡', name: 'Velocity Fraud Check', desc: 'Claim frequency within normal range for this worker', result: 'pass', detail: 'Claim #3 this quarter (avg: 2.8)' },
];

// =========== APP STATE ===========
const state = {
  screen: 'splash',
  onboardStep: 0,
  user: null,
  riskScore: 18,
  riskLevel: 'low',
  rainfall: 12, aqi: 84, traffic: 42,
  alerts: [],
  demoMode: false,
  demoStep: 0,
  claimActive: false,
  claimStep: 0,
  claimAmount: 450,
  weeklyEarned: 0,
  todayEarned: 0,
};

// =========== DEMO STEPS ===========
const DEMO_STEPS = [
  {
    id: 'intro', icon: '👤', title: 'Meet Raju Sharma',
    desc: 'Raju is a Zomato delivery partner in Bengaluru, earning ~₹5,800/week. His shield is active. It\'s Thursday morning.',
    screen: 'home', action: () => {
      setEarnings(620, 5, 4.5);
      updateRisk(22, 18, 38, 'low');
    }
  },
  {
    id: 'warn', icon: '⚠️', title: 'WARN — Rain Alert Incoming',
    desc: 'IMD API detects heavy rainfall approaching BTM Layout. InsureFlow sends a proactive alert before disruption hits.',
    screen: 'alerts', action: () => {
      addAlert('🌧️ Heavy Rainfall Warning', 'IMD forecasts 68mm rainfall in BTM Layout zone 2–5 PM. Earnings risk: HIGH. Activate now for rain protection.', 'high');
      updateRisk(68, 84, 55, 'medium');
      document.getElementById('alert-nav-badge').classList.remove('hidden');
      document.getElementById('alert-nav-badge').textContent = '1';
    }
  },
  {
    id: 'escalate', icon: '🚨', title: 'PROTECT — Triggers Activate',
    desc: 'Rainfall crosses 65mm threshold. Earnings velocity drops below 40%. Multiple parametric triggers fire simultaneously.',
    screen: 'alerts', action: () => {
      addAlert('🚨 TRIGGER ACTIVATED', 'Rainfall: 71mm ✓  |  Earnings velocity: -62% ✓  |  Zone inactivity: 74% ✓  |  Protection floor activated automatically.', 'high');
      updateRisk(71, 142, 78, 'high');
      updateTriggers({ rainfall: 'triggered', earnings: 'triggered', inactivity: 'triggered' });
    }
  },
  {
    id: 'validate', icon: '🔍', title: 'Fraud Validation Starts',
    desc: 'InsureFlow\'s 6-layer fraud engine runs silently. GPS confirmed in zone, movement normal, peer network validates — clean.',
    screen: 'fraud', action: () => {
      animateFraudCheck(20, 'LOW RISK', 'All 6 validation layers passed. Claim pre-approved.');
    }
  },
  {
    id: 'claim', icon: '⏱️', title: 'Auto Claim Processing',
    desc: 'Zero-touch claim triggered automatically. No forms, no calls. Raju doesn\'t need to do anything.',
    screen: 'claims', action: () => {
      activateClaim(450);
    }
  },
  {
    id: 'pay', icon: '💸', title: 'PAY — ₹450 Sent to UPI',
    desc: 'Gap between floor (₹4,350) and actual earnings (₹3,900) = ₹450. Paid in 58 seconds. Done.',
    screen: 'claims', action: () => {
      setTimeout(() => showPayoutOverlay(450, 'raju@upi'), 800);
    }
  },
  {
    id: 'done', icon: '✅', title: 'Demo Complete',
    desc: 'Raju\'s daughter goes to school on Monday. That\'s what ₹450 on a Sunday night means.',
    screen: 'home', action: () => {
      addToPayoutHistory(450, "Today", "Rain trigger + earnings drop");
      setEarnings(4350, 14, 8.5);
    }
  }
];

// =========== INIT ===========
document.addEventListener('DOMContentLoaded', init);

function init() {
  registerServiceWorker();
  // Splash → Onboarding or main app
  setTimeout(() => {
    const saved = getStoredUser();
    if (saved) {
      state.user = saved;
      showScreen('main-app');
      initMainApp();
    } else {
      showScreen('onboarding');
    }
    document.getElementById('splash').style.opacity = '0';
    document.getElementById('splash').style.transition = 'opacity 0.4s ease';
    setTimeout(() => document.getElementById('splash').classList.add('hidden'), 400);
  }, 2200);

  bindEvents();
  checkOffline();
  window.addEventListener('online', () => document.getElementById('offline-banner').classList.add('hidden'));
  window.addEventListener('offline', () => document.getElementById('offline-banner').classList.remove('hidden'));
}

function checkOffline() {
  if (!navigator.onLine) document.getElementById('offline-banner').classList.remove('hidden');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

// =========== EVENT BINDING ===========
function bindEvents() {
  // Onboarding navigation
  document.getElementById('onboard-next').addEventListener('click', nextOnboardSlide);
  document.getElementById('onboard-skip').addEventListener('click', () => showScreen('setup'));
  document.querySelectorAll('.dot').forEach(d => d.addEventListener('click', () => goToSlide(parseInt(d.dataset.dot))));

  // Zone picker
  document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Setup form
  document.getElementById('setup-submit').addEventListener('click', handleSetup);
  document.getElementById('demo-quick-start').addEventListener('click', startDemoQuickSetup);

  // DNA done
  document.getElementById('dna-done').addEventListener('click', () => {
    showScreen('main-app');
    initMainApp();
  });

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAppScreen(btn.dataset.screen));
  });

  // Refresh zones
  document.getElementById('refresh-zones').addEventListener('click', renderZones);

  // Payout overlay
  document.getElementById('payout-close').addEventListener('click', () => {
    document.getElementById('payout-overlay').classList.add('hidden');
  });

  // Demo mode
  document.getElementById('demo-guide-start').addEventListener('click', startDemoMode);
  document.getElementById('demo-guide-cancel').addEventListener('click', () => {
    document.getElementById('demo-guide-overlay').classList.add('hidden');
  });
  document.getElementById('demo-advance').addEventListener('click', advanceDemoStep);
  document.getElementById('demo-exit').addEventListener('click', exitDemoMode);
  document.getElementById('notif-btn').addEventListener('click', showDemoGuide);
}

// =========== ONBOARDING ===========
function nextOnboardSlide() {
  const slides = document.querySelectorAll('.onboard-slide');
  const current = state.onboardStep;
  if (current >= slides.length - 1) { showScreen('setup'); return; }

  slides[current].classList.remove('active');
  slides[current].classList.add('exit');
  setTimeout(() => slides[current].classList.remove('exit'), 400);

  state.onboardStep = current + 1;
  slides[state.onboardStep].classList.add('active');

  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === state.onboardStep));

  if (state.onboardStep === slides.length - 1) {
    document.getElementById('onboard-next').textContent = "Let's Go →";
  }
}

function goToSlide(idx) {
  const slides = document.querySelectorAll('.onboard-slide');
  slides[state.onboardStep].classList.remove('active');
  state.onboardStep = idx;
  slides[idx].classList.add('active');
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

// =========== SETUP ===========
function handleSetup() {
  const id = document.getElementById('partner-id').value.trim() || 'ZOM-2947381';
  const name = document.getElementById('partner-name').value.trim() || 'Partner';
  const zone = document.querySelector('.zone-btn.active')?.dataset.zone || 'HSR Layout';
  const upi = document.getElementById('upi-id').value.trim() || 'partner@upi';
  setupUser({ id, name, zone, upi });
}

function startDemoQuickSetup() {
  setupUser({ id: 'ZOM-2947381', name: 'Raju Sharma', zone: 'HSR Layout', upi: 'raju@upi', isDemo: true });
}

function setupUser(data) {
  const user = { ...MOCK_USERS.default, ...data };
  state.user = user;
  storeUser(user);
  showScreen('dna-building');
  document.getElementById('dna-initial').textContent = user.name.charAt(0).toUpperCase();
  runDNAAnimation(user);
}

function runDNAAnimation(user) {
  const steps = [
    { id: 0, status: 'Analyzing 12 weeks of earnings...', done: 'Baseline: ₹5,800/week', delay: 0 },
    { id: 1, status: 'Mapping HSR, Koramangala, BTM...', done: 'Zone risk: Medium', delay: 1200 },
    { id: 2, status: 'Fetching IMD + CPCB data...', done: 'Weather risk calibrated', delay: 2400 },
    { id: 3, status: 'Computing protection floor...', done: 'Floor: ₹4,350 (75%)', delay: 3600 },
    { id: 4, status: 'Applying gradient boosted model...', done: 'Premium: ₹52/week', delay: 4800 },
  ];

  steps.forEach(({ id, status, done, delay }) => {
    const el = document.querySelector(`.dna-step[data-step="${id}"]`);
    const statusEl = document.getElementById(`step-${id}-status`);
    const checkEl = document.getElementById(`step-${id}-check`);

    setTimeout(() => {
      el.classList.add('active');
      statusEl.textContent = status;
    }, delay);

    setTimeout(() => {
      el.classList.remove('active');
      el.classList.add('done');
      statusEl.textContent = done;
      checkEl.classList.remove('hidden');
    }, delay + 900);
  });

  setTimeout(() => {
    document.getElementById('res-baseline').textContent = '₹' + user.baseline.toLocaleString('en-IN');
    document.getElementById('res-floor').textContent = '₹' + user.floor.toLocaleString('en-IN');
    document.getElementById('res-premium').textContent = '₹' + user.premium;
    document.getElementById('dna-result').classList.remove('hidden');
  }, 6200);
}

// =========== MAIN APP INIT ===========
function initMainApp() {
  const user = state.user;
  document.getElementById('user-name-display').textContent = user.name.split(' ')[0];
  document.getElementById('policy-premium').textContent = '₹' + user.premium;
  document.getElementById('policy-floor').textContent = '₹' + user.floor.toLocaleString('en-IN');
  document.getElementById('weekly-goal').textContent = user.floor.toLocaleString('en-IN');
  document.getElementById('sum-avg').textContent = '₹' + user.baseline.toLocaleString('en-IN');

  setEarnings(0, 0, 0);
  updateRisk(12, 84, 42, 'low');
  renderZones();
  renderTriggers();
  renderPayoutHistory();
  renderKarmaOrders();
  renderFraudLayers();
  renderEarningsChart();
  updatePolicyProjection();

  // Show demo guide for new demo users
  if (user.isDemo) {
    setTimeout(() => showDemoGuide(), 800);
  }

  // Simulate live data ticking
  startLiveTicker();
}

// =========== EARNINGS DISPLAY ===========
function setEarnings(amount, orders, hours) {
  state.todayEarned = amount;
  const user = state.user;
  const dailyFloor = Math.round(user.floor / 7);
  const pct = Math.min(100, Math.round((amount / (user.baseline / 7)) * 100));
  const floorPct = Math.round((dailyFloor / (user.baseline / 7)) * 100);

  document.getElementById('today-earnings').textContent = '₹' + amount.toLocaleString('en-IN');
  document.getElementById('orders-count').textContent = orders + ' orders';
  document.getElementById('active-hours').textContent = hours + 'h active';
  document.getElementById('earnings-progress').style.width = pct + '%';
  document.getElementById('ring-pct').textContent = pct + '%';
  document.getElementById('floor-marker').style.left = floorPct + '%';
  document.getElementById('daily-floor-val').textContent = dailyFloor.toLocaleString('en-IN');
  document.getElementById('sum-week').textContent = '₹' + (state.user.weeklyEarned + amount).toLocaleString('en-IN');
  document.getElementById('policy-earned').textContent = '₹' + (state.user.weeklyEarned + amount).toLocaleString('en-IN');

  // Ring animation
  const ring = document.getElementById('earnings-ring-fill');
  const circumference = 213.6;
  ring.style.transition = 'stroke-dashoffset 1.2s ease';
  ring.style.strokeDashoffset = circumference - (circumference * pct / 100);

  updatePolicyProjection();
}

function updatePolicyProjection() {
  if (!state.user) return;
  const earned = state.user.weeklyEarned + state.todayEarned;
  const floor = state.user.floor;
  const gap = Math.max(0, floor - earned);
  const payoutEl = document.getElementById('policy-payout');
  if (gap > 0) {
    payoutEl.textContent = '₹' + gap.toLocaleString('en-IN') + ' (floor gap)';
    payoutEl.style.color = 'var(--pink)';
  } else {
    payoutEl.textContent = '₹0 (on track)';
    payoutEl.style.color = 'var(--green)';
  }
  document.getElementById('weekly-so-far').textContent = earned.toLocaleString('en-IN');
}

// =========== RISK UPDATE ===========
function updateRisk(rainfall, aqi, traffic, level) {
  state.rainfall = rainfall; state.aqi = aqi; state.traffic = traffic; state.riskLevel = level;

  const scores = { low: Math.round(rainfall * 0.2 + aqi * 0.05 + traffic * 0.3), medium: null, high: null };
  const score = Math.min(99, Math.round(rainfall * 0.25 + aqi * 0.08 + traffic * 0.35));
  state.riskScore = score;

  document.getElementById('risk-score-val').textContent = score;
  document.getElementById('rf-rain').style.width = Math.min(100, rainfall * 1.4) + '%';
  document.getElementById('rf-rain-val').textContent = rainfall + 'mm';
  document.getElementById('rf-aqi').style.width = Math.min(100, aqi / 5) + '%';
  document.getElementById('rf-aqi-val').textContent = aqi;
  document.getElementById('rf-traffic').style.width = Math.min(100, traffic * 1.3) + '%';
  document.getElementById('rf-traffic-val').textContent = traffic;

  const dot = document.getElementById('risk-dot');
  const text = document.getElementById('risk-level-text');
  const card = document.getElementById('risk-card');
  const colors = { low: ['low', 'LOW RISK', ''], medium: ['medium', 'MEDIUM RISK', ''], high: ['high', 'HIGH RISK', 'border: 2px solid var(--red)'] };
  const [cls, label] = colors[level] || colors.low;
  dot.className = 'risk-dot ' + cls;
  text.textContent = label;
  text.style.color = cls === 'low' ? 'var(--green)' : cls === 'medium' ? 'var(--amber)' : 'var(--red)';

  if (level === 'high') {
    if (rainfall >= 65) document.getElementById('rf-rain').classList.add('danger');
    if (aqi >= 300) document.getElementById('rf-aqi').classList.add('danger');
    if (traffic >= 75) document.getElementById('rf-traffic').classList.add('danger');
  }

  // Update conditions
  document.getElementById('cond-temp').textContent = (28 - (rainfall > 40 ? 4 : 0)) + '°C';
  document.getElementById('cond-humidity').textContent = Math.min(98, 68 + Math.round(rainfall * 0.3)) + '%';
  document.getElementById('cond-wind').textContent = (14 + Math.round(rainfall * 0.4)) + ' km/h';
  document.getElementById('cond-peers').textContent = Math.max(12, 47 - Math.round(traffic * 0.3));
}

// =========== ALERTS ===========
function addAlert(title, desc, severity = 'medium') {
  const alertsSection = document.getElementById('alerts-section');
  const alertsList = document.getElementById('alerts-list');
  const fullList = document.getElementById('full-alerts-list');

  alertsSection.classList.remove('hidden');

  const card = `<div class="alert-card ${severity}">
    <div class="alert-title">${title}</div>
    <div class="alert-desc">${desc}</div>
    <div class="alert-time">Just now · Source: IMD API</div>
  </div>`;

  alertsList.insertAdjacentHTML('afterbegin', card);
  fullList.insertAdjacentHTML('afterbegin', card);

  const count = document.querySelectorAll('#alerts-list .alert-card').length;
  const badge = document.getElementById('alert-nav-badge');
  badge.textContent = count;
  badge.classList.remove('hidden');
  document.getElementById('notif-dot').style.display = 'block';
}

// =========== ZONE GRID ===========
function renderZones() {
  const grid = document.getElementById('zone-grid');
  grid.innerHTML = '';
  ZONES.forEach(zone => {
    const tile = document.createElement('div');
    tile.className = 'zone-tile';
    tile.innerHTML = `
      <span class="zone-emoji">${zone.emoji}</span>
      <span class="zone-name">${zone.name}</span>
      <span class="zone-status" style="color:${getZoneColor(zone.risk)}">${zone.status}</span>
      <span class="zone-earnings">${zone.earnings}</span>
      <div class="zone-risk-bar ${zone.risk}"></div>`;
    grid.appendChild(tile);
  });
}

function getZoneColor(risk) {
  return { red: 'var(--red)', amber: 'var(--amber)', green: 'var(--green)', blue: 'var(--blue)' }[risk] || 'var(--gray-500)';
}

// =========== TRIGGERS ===========
const triggerState = { rainfall: 'ok', aqi: 'ok', traffic: 'ok', earnings: 'ok', inactivity: 'ok' };

function renderTriggers() {
  const defs = [
    { key: 'rainfall', icon: '🌧️', name: 'Rainfall', threshold: '>65mm/3hr', current: state.rainfall + 'mm' },
    { key: 'aqi', icon: '😷', name: 'Air Quality (AQI)', threshold: '>300 for 4hrs', current: state.aqi },
    { key: 'traffic', icon: '🚗', name: 'Traffic Index', threshold: '>75', current: state.traffic },
    { key: 'earnings', icon: '📉', name: 'Earnings Drop', threshold: '<40% of baseline', current: 'Monitoring' },
    { key: 'inactivity', icon: '🔕', name: 'Peer Inactivity', threshold: '>70% zone inactive', current: '18% inactive' },
  ];
  const grid = document.getElementById('triggers-grid');
  grid.innerHTML = '';
  defs.forEach(t => {
    const status = triggerState[t.key];
    const statusLabel = status === 'triggered' ? 'TRIGGERED' : status === 'warn' ? 'WARNING' : 'NORMAL';
    const item = document.createElement('div');
    item.className = 'trigger-item ' + (status === 'triggered' ? 'active' : status === 'warn' ? 'warning' : '');
    item.id = 'trigger-' + t.key;
    item.innerHTML = `
      <div class="trigger-icon">${t.icon}</div>
      <div class="trigger-info">
        <div class="trigger-name">${t.name}</div>
        <div class="trigger-threshold">Threshold: ${t.threshold} · Now: ${t.current}</div>
      </div>
      <span class="trigger-status ${status === 'triggered' ? 'triggered' : status === 'warn' ? 'warn' : 'ok'}">${statusLabel}</span>`;
    grid.appendChild(item);
  });
}

function updateTriggers(updates) {
  Object.assign(triggerState, updates);
  renderTriggers();
}

// =========== CLAIM ===========
function activateClaim(amount) {
  state.claimActive = true;
  state.claimAmount = amount;
  document.getElementById('no-claim-state').classList.add('hidden');
  document.getElementById('active-claim-section').classList.remove('hidden');
  document.getElementById('claim-amount-display').textContent = '₹' + amount;

  const steps = [
    { label: 'Trigger Detected', icon: '⚡', delay: 0 },
    { label: 'Validating GPS & Movement', icon: '📍', delay: 600 },
    { label: 'Running Fraud Checks (6 layers)', icon: '🔍', delay: 1400 },
    { label: 'Claim Approved', icon: '✅', delay: 2400 },
    { label: 'Payout Sent to UPI', icon: '💸', delay: 3200 },
  ];

  const timeline = document.getElementById('claim-timeline');
  timeline.innerHTML = '';

  steps.forEach((step, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-step';
    el.id = 'ts-' + i;
    el.innerHTML = `<div class="ts-dot">${step.icon}</div>
      <div class="ts-info">
        <div class="ts-label">${step.label}</div>
        <div class="ts-time" id="ts-time-${i}">Waiting...</div>
      </div>`;
    timeline.appendChild(el);

    setTimeout(() => {
      el.classList.add('active');
      document.getElementById(`ts-time-${i}`).textContent = 'Processing...';
      document.getElementById('claim-status-badge').textContent = step.label;
    }, step.delay);

    setTimeout(() => {
      el.classList.remove('active');
      el.classList.add('done');
      document.getElementById(`ts-time-${i}`).textContent = 'Completed';
      if (i > 0) document.querySelector(`#ts-${i - 1}.timeline-step`).classList.add('done');
    }, step.delay + 500);
  });
}

// =========== PAYOUT OVERLAY ===========
function showPayoutOverlay(amount, upi) {
  document.getElementById('payout-amount-big').textContent = '₹' + amount;
  document.getElementById('payout-upi').textContent = upi;
  document.getElementById('payout-overlay').classList.remove('hidden');
  spawnConfetti();
  addToPayoutHistory(amount, "Today", "Auto-triggered claim");
}

function addToPayoutHistory(amount, date, trigger) {
  const list = document.getElementById('payout-history');
  const item = document.createElement('div');
  item.className = 'payout-item';
  item.innerHTML = `
    <div class="payout-item-icon">💸</div>
    <div class="payout-item-info">
      <div class="payout-item-label">Weekly settlement</div>
      <div class="payout-item-date">${date} · ${trigger}</div>
    </div>
    <div class="payout-item-amount">+₹${amount}</div>`;
  list.insertBefore(item, list.firstChild);
}

function spawnConfetti() {
  const container = document.getElementById('payout-confetti');
  container.innerHTML = '';
  const colors = ['#FF2D6B', '#FF6B35', '#22C55E', '#F59E0B', '#3B82F6'];
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute; width:${Math.random() * 8 + 4}px; height:${Math.random() * 8 + 4}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:50%; left:${Math.random() * 100}%;
      animation: confetti-fall ${Math.random() * 1.5 + 0.8}s ease-out forwards;
      top:-10px; opacity:0.9;`;
    container.appendChild(dot);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes confetti-fall { to { transform: translateY(200px) rotate(${Math.random() * 360}deg); opacity: 0; } }`;
  document.head.appendChild(style);
}

// =========== PAYOUT HISTORY ===========
function renderPayoutHistory() {
  const list = document.getElementById('payout-history');
  list.innerHTML = '';
  PAYOUT_HISTORY.forEach(p => {
    list.insertAdjacentHTML('beforeend', `
      <div class="payout-item">
        <div class="payout-item-icon">💸</div>
        <div class="payout-item-info">
          <div class="payout-item-label">${p.label}</div>
          <div class="payout-item-date">${p.date} · ${p.trigger}</div>
        </div>
        <div class="payout-item-amount">+₹${p.amount}</div>
      </div>`);
  });
}

// =========== KARMA ORDERS ===========
function renderKarmaOrders() {
  const list = document.getElementById('karma-orders-list');
  list.innerHTML = '';
  KARMA_ORDERS.forEach(o => {
    list.insertAdjacentHTML('beforeend', `
      <div class="karma-order">
        <div style="font-size:24px">🛵</div>
        <div class="karma-order-info">
          <div class="karma-order-label">${o.customer} · ${o.area}</div>
          <div class="karma-order-details">${o.distance} · ${o.amount} · ${o.issue}</div>
        </div>
        <span class="karma-score ${o.karma}">${o.karma.toUpperCase()}</span>
      </div>`);
  });
}

// =========== FRAUD LAYERS ===========
function renderFraudLayers(layers = FRAUD_LAYERS) {
  const list = document.getElementById('fraud-layers');
  list.innerHTML = '';
  layers.forEach(layer => {
    list.insertAdjacentHTML('beforeend', `
      <div class="fraud-layer">
        <div class="fraud-layer-icon">${layer.icon}</div>
        <div class="fraud-layer-info">
          <div class="fraud-layer-name">${layer.name}</div>
          <div class="fraud-layer-desc">${layer.desc}</div>
          <div style="font-size:11px;color:var(--gray-400);margin-top:2px">${layer.detail}</div>
        </div>
        <span class="fraud-layer-result ${layer.result}">${layer.result.toUpperCase()}</span>
      </div>`);
  });
}

function animateFraudCheck(score, verdict, text) {
  const ring = document.getElementById('fraud-ring-fill');
  const numEl = document.getElementById('fraud-score-num');
  const badgeEl = document.getElementById('fraud-verdict-badge');
  const textEl = document.getElementById('fraud-verdict-text');
  const circumference = 314;

  numEl.textContent = score;
  ring.style.transition = 'stroke-dashoffset 1.5s ease';
  ring.style.stroke = score < 40 ? 'var(--green)' : score < 70 ? 'var(--amber)' : 'var(--red)';
  ring.style.strokeDashoffset = circumference - (circumference * score / 100);

  const levelClass = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  badgeEl.className = 'fraud-verdict-badge ' + levelClass;
  badgeEl.textContent = verdict;
  textEl.textContent = text;
}

// =========== EARNINGS CHART ===========
function renderEarningsChart() {
  const svg = document.getElementById('earnings-chart');
  const W = 340, H = 140, PAD = { t: 10, r: 10, b: 30, l: 35 };
  const CW = W - PAD.l - PAD.r, CH = H - PAD.t - PAD.b;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const actual =  [820, 910, 680, 0, 0, 0, 0];
  const baseline = [830, 860, 870, 850, 920, 1040, 430];
  const floor = baseline.map(v => Math.round(v * 0.75));
  const maxVal = 1200;

  const x = (i) => PAD.l + (i / (days.length - 1)) * CW;
  const y = (v) => PAD.t + CH - (v / maxVal) * CH;

  const polyline = (vals, color, dashed = false) => {
    const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="5,4"' : ''}/>`;
  };

  let markup = `
    <g>
      ${[0, 400, 800, 1200].map(v => `<line x1="${PAD.l}" y1="${y(v)}" x2="${W - PAD.r}" y2="${y(v)}" stroke="#F3F4F6" stroke-width="1"/>
        <text x="${PAD.l - 4}" y="${y(v) + 4}" fill="#9CA3AF" font-size="9" text-anchor="end">₹${v/100 > 0 ? (v/100)+'h' : '0'}</text>`).join('')}
    </g>
    ${polyline(floor, 'rgba(239,68,68,0.4)', true)}
    ${polyline(baseline, '#E5E7EB', true)}
    ${polyline(actual.map((v, i) => v || baseline[i] * 0.45), '#FF2D6B')}
    ${actual.map((v, i) => v > 0 ? `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#FF2D6B" stroke="white" stroke-width="2"/>` : '').join('')}
    <g>${days.map((d, i) => `<text x="${x(i)}" y="${H - 4}" fill="#9CA3AF" font-size="10" text-anchor="middle">${d}</text>`).join('')}</g>
    <rect x="${x(2)}" y="${PAD.t}" width="${x(3)-x(2)}" height="${CH}" fill="rgba(239,68,68,0.04)" rx="0"/>
    <text x="${x(2) + (x(3)-x(2))/2}" y="${PAD.t + 12}" fill="var(--red)" font-size="9" text-anchor="middle">Rain</text>`;

  svg.innerHTML = markup;
}

// =========== SCREEN NAVIGATION ===========
function showScreen(id) {
  const allScreens = ['splash', 'onboarding', 'setup', 'dna-building', 'main-app'];
  allScreens.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.toggle('hidden', s !== id);
  });
}

function switchAppScreen(name) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  if (name === 'alerts') document.getElementById('alert-nav-badge').classList.add('hidden');
}

// =========== DEMO MODE ===========
function showDemoGuide() {
  const overlay = document.getElementById('demo-guide-overlay');
  const indicators = document.getElementById('demo-step-indicators');
  indicators.innerHTML = DEMO_STEPS.map((s, i) =>
    `<div class="demo-step-dot ${i === 0 ? 'current' : ''}"></div>`
  ).join('');
  overlay.classList.remove('hidden');
}

function startDemoMode() {
  document.getElementById('demo-guide-overlay').classList.add('hidden');
  state.demoMode = true;
  state.demoStep = 0;
  document.getElementById('demo-banner').classList.remove('hidden');
  runDemoStep(0);
}

function advanceDemoStep() {
  if (state.demoStep >= DEMO_STEPS.length - 1) { exitDemoMode(); return; }
  state.demoStep++;
  runDemoStep(state.demoStep);
}

function runDemoStep(idx) {
  const step = DEMO_STEPS[idx];
  document.getElementById('demo-step-label').textContent = `Step ${idx + 1}/${DEMO_STEPS.length}: ${step.title}`;
  document.getElementById('demo-advance').textContent = idx === DEMO_STEPS.length - 1 ? 'Finish ✓' : 'Next Step →';

  // Navigate to right screen
  switchAppScreen(step.screen);

  // Run step action
  if (step.action) step.action();

  // Update step indicators in guide
  const indicators = document.querySelectorAll('.demo-step-dot');
  indicators.forEach((dot, i) => {
    dot.className = 'demo-step-dot ' + (i < idx ? 'done' : i === idx ? 'current' : '');
  });

  // Show tooltip card briefly
  showDemoTooltip(step);
}

function showDemoTooltip(step) {
  // Remove existing tooltip
  const existing = document.getElementById('demo-tooltip');
  if (existing) existing.remove();

  const tooltip = document.createElement('div');
  tooltip.id = 'demo-tooltip';
  tooltip.style.cssText = `
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
    width:calc(100% - 32px); max-width:398px; z-index:90;
    background:white; border-radius:16px; padding:16px;
    box-shadow:0 8px 32px rgba(0,0,0,0.15);
    border-left:4px solid var(--pink);
    animation:slideUp 0.3s ease;`;
  tooltip.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="font-size:20px">${step.icon}</span>
      <strong style="font-size:14px;color:var(--gray-900)">${step.title}</strong>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:var(--gray-400);font-size:18px;cursor:pointer">×</button>
    </div>
    <p style="font-size:13px;color:var(--gray-500);line-height:1.5">${step.desc}</p>`;
  document.body.appendChild(tooltip);
  setTimeout(() => { if (tooltip.parentElement) tooltip.style.opacity = '0.7'; }, 4000);
}

function exitDemoMode() {
  state.demoMode = false;
  document.getElementById('demo-banner').classList.add('hidden');
  const tooltip = document.getElementById('demo-tooltip');
  if (tooltip) tooltip.remove();
}

// =========== LIVE TICKER ===========
function startLiveTicker() {
  let elapsed = 0;
  setInterval(() => {
    elapsed++;
    if (!state.demoMode) {
      const delta = Math.round(Math.random() * 45 + 10);
      state.todayEarned = Math.min(state.todayEarned + delta, 950);
      const orders = Math.floor(state.todayEarned / 62);
      const hours = Math.min(9, (state.todayEarned / 105).toFixed(1));
      setEarnings(state.todayEarned, orders, hours);
    }
  }, 8000);
}

// =========== LOCAL STORAGE ===========
function storeUser(user) {
  try { localStorage.setItem('insureflow_user', JSON.stringify(user)); } catch(e) {}
}
function getStoredUser() {
  try { const d = localStorage.getItem('insureflow_user'); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}
