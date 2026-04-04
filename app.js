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
  { name: 'BTM Layout', emoji: 'BTM', risk: 'red', status: 'Flood Risk', earnings: '₹680/day', riskScore: 78 },
  { name: 'Koramangala', emoji: 'KOR', risk: 'amber', status: 'Moderate', earnings: '₹920/day', riskScore: 45 },
  { name: 'HSR Layout', emoji: 'HSR', risk: 'green', status: 'Safe', earnings: '₹850/day', riskScore: 18 },
  { name: 'Indiranagar', emoji: 'IND', risk: 'blue', status: 'Surge Zone', earnings: '₹1,040/day', riskScore: 22 },
  { name: 'Whitefield', emoji: 'WHT', risk: 'green', status: 'Safe', earnings: '₹780/day', riskScore: 12 },
  { name: 'Jayanagar', emoji: 'JAY', risk: 'amber', status: 'Moderate', earnings: '₹860/day', riskScore: 38 },
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
  { icon: 'MapPin', name: 'GPS Zone Validation', desc: 'Worker confirmed in affected zone during trigger window', result: 'pass', detail: 'HSR Layout, 14:30–16:45' },
  { icon: 'Zap', name: 'Movement Analysis', desc: 'Kinematic velocity check — no GPS teleportation detected', result: 'pass', detail: 'Avg speed 18.4 km/h, normal' },
  { icon: 'Dna', name: 'Earnings DNA Match', desc: 'Behavioral coherence with historical patterns', result: 'pass', detail: 'p_active = 0.82 (expected: 0.79)' },
  { icon: 'Users', name: 'Peer Network Validation', desc: 'Peer disruption cluster: 47 workers affected in same zone', result: 'pass', detail: 'T_spike = 2.1σ (within threshold)' },
  { icon: 'Smartphone', name: 'Device Fingerprint', desc: 'Device ID consistent with registration — no spoofing detected', result: 'pass', detail: 'IMEI match: confirmed' },
  { icon: 'Activity', name: 'Velocity Fraud Check', desc: 'Claim frequency within normal range for this worker', result: 'pass', detail: 'Claim #3 this quarter (avg: 2.8)' },
];

// =========== APP STATE ===========
const state = {
  isSignUpMode: false,
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
    id: 'intro', icon: 'User', title: 'Meet Raju Sharma',
    desc: 'Raju is a Zomato delivery partner in Bengaluru, earning ~₹5,800/week. His Earnings DNA is established. It\'s Thursday morning.',
    screen: 'home', action: () => {
      setEarnings(620, 5, 4.5);
      updateRisk(22, 18, 38, 'low');
    }
  },
  {
    id: 'karma', icon: 'AlertCircle', title: 'High Risk Order Detected',
    desc: '<b>UNIQUE FEATURE — CUSTOMER KARMA RISK</b><br><br>Customer Risk Score: <span style="color:var(--red);font-weight:700;">High</span><br><br>Analyzed Patterns:<br>• High cancellation rate (34%)<br>• Frequent delivery failures<br>• Previous payment disputes<br><br><i>Protection activated at a higher sensitivity for this specific trip.</i>',
    screen: 'earnings', action: () => {
      showKarmaOrderWarning();
    }
  },
  {
    id: 'warn', icon: 'CloudRain', title: 'Rain Prediction Alert',
    desc: 'IMD API detects heavy rainfall approaching BTM Layout. InsureFlow sends a proactive alert before earnings are disrupted.',
    screen: 'alerts', action: () => {
      addAlert('Heavy Rainfall Warning', 'IMD forecasts 68mm rainfall in BTM Layout zone 2–5 PM. Earnings risk: HIGH. Shield active.', 'high');
      updateRisk(68, 84, 55, 'medium');
      document.getElementById('alert-nav-badge').classList.remove('hidden');
      document.getElementById('alert-nav-badge').textContent = '1';
    }
  },
  {
    id: 'escalate', icon: 'ShieldAlert', title: 'Parametric Trigger Activated',
    desc: 'Rainfall crosses 65mm threshold. Earnings velocity drops below 40%. All parametric triggers have fired automatically.',
    screen: 'alerts', action: () => {
      addAlert('TRIGGER ACTIVATED', 'Rainfall: 71mm [PASS] | Earnings velocity: -62% [PASS] | Protection floor activated.', 'high');
      updateRisk(71, 142, 78, 'high');
      updateTriggers({ rainfall: 'triggered', earnings: 'triggered', inactivity: 'triggered' });
    }
  },
  {
    id: 'validate', icon: 'Fingerprint', title: 'Fraud Engine Processing',
    desc: 'InsureFlow\'s 6-layer behavioral engine runs. GPS confirmed, movement kinematic check passes, peer network validates disruption.',
    screen: 'fraud', action: () => {
      animateFraudCheck(20, 'LOW RISK', 'All 6 validation layers passed. Auto-claim pre-approved.');
    }
  },
  {
    id: 'claim', icon: 'Clock', title: 'Zero-Touch Claim Initiated',
    desc: 'Trigger processing complete. No forms, no evidence required. Raju\'s payout is being calculated based on his Earnings DNA.',
    screen: 'claims', action: () => {
      activateClaim(450);
    }
  },
  {
    id: 'pay', icon: 'CheckCircle', title: '₹450 Payout Successful',
    desc: 'Protection gap (Floor vs Actual) = ₹450. Funds transferred to UPI in 58 seconds. System reset for next week.',
    screen: 'claims', action: () => {
      setTimeout(() => showPayoutOverlay(450, 'raju@upi'), 800);
    }
  }
];

function getIcon(name) {
  const icons = {
    User: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    MapPin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    Zap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    Dna: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2c1 .5 2 2 2 5s-1 4.5-2 5c-1 .5-2 2-2 5s1 4.5 2 5"/><path d="M14 2c-1 .5-2 2-2 5s1 4.5 2 5c1 .5 2 2 2 5s-1 4.5-2 5"/></svg>',
    Users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    Smartphone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    Activity: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    CheckCircle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    Clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    AlertCircle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    CloudRain: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>',
    ShieldAlert: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    Wallet: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>',
  };
  return icons[name] || icons.AlertCircle;
}

// =========== UTILS ===========
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

// =========== SCREEN MANAGEMENT ===========
function showScreen(id) {
  state.screen = id;
  const screens = ['onboarding', 'setup', 'dna-building', 'main-app', 'admin-dashboard'];
  
  screens.forEach(s => {
    const el = document.getElementById(s);
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('active');
  });

  const target = document.getElementById(id);
  if (!target) return;
  
  target.classList.remove('hidden');
  // Small delay to trigger CSS transition
  setTimeout(() => target.classList.add('active'), 50);
  window.scrollTo(0, 0);
}

function switchAppScreen(id) {
  // Main app sub-screens
  document.querySelectorAll('.app-screen').forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('active');
  });
  
  const target = document.getElementById('screen-' + id);
  if (target) {
     target.classList.remove('hidden');
     setTimeout(() => target.classList.add('active'), 50);
  }
  
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === id);
  });
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

  // Setup tabs
  document.getElementById('tab-login').addEventListener('click', () => toggleSetupMode(false));
  document.getElementById('tab-signup').addEventListener('click', () => toggleSetupMode(true));

  // Admin login toggle & auth
  if (document.getElementById('admin-login-cancel')) {
    document.getElementById('admin-login-cancel').addEventListener('click', () => showScreen('setup'));
  }
  if (document.getElementById('admin-auth-submit')) {
    document.getElementById('admin-auth-submit').addEventListener('click', handleAdminAuth);
  }

  // Setup form submission
  document.getElementById('setup-submit').addEventListener('click', handleSetup);
  document.getElementById('demo-quick-start').addEventListener('click', startDemoQuickSetup);

  // Global input Enter listener
  document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSetup();
    });
  });

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
  document.getElementById('demo-prev').addEventListener('click', prevDemoStep);
  document.getElementById('demo-advance').addEventListener('click', advanceDemoStep);
  document.getElementById('demo-exit').addEventListener('click', exitDemoMode);
  document.getElementById('notif-btn').addEventListener('click', showDemoGuide);

  // Profile & Logout
  const profileMenu = document.getElementById('profile-menu');
  if (document.getElementById('profile-btn')) {
    document.getElementById('profile-btn').addEventListener('click', () => {
      profileMenu.classList.toggle('hidden');
    });
  }
  if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
  }

  // Admin Dashboard actions
  if (document.getElementById('admin-logout-btn')) {
    document.getElementById('admin-logout-btn').addEventListener('click', () => {
      showScreen('setup');
    });
  }
  if (document.getElementById('admin-trigger-alert')) {
    document.getElementById('admin-trigger-alert').addEventListener('click', simulateDisasterEvent);
  }
}

// =========== LOGOUT ===========
function handleLogout() {
  localStorage.removeItem('insureflow_user');
  state.user = null;
  document.getElementById('profile-menu').classList.add('hidden');
  document.getElementById('main-app').classList.add('hidden');
  showScreen('setup');
}

// =========== ADMIN DASHBOARD ===========
function initAdminDashboard() {
  showScreen('admin-dashboard');

  // Render Admin Zones
  const grid = document.getElementById('admin-zone-grid');
  grid.innerHTML = '';
  ZONES.forEach((z, i) => {
    grid.innerHTML += `
      <div class="admin-zone-row" id="admin-zone-${i}">
        <div class="admin-zone-info">
          <div class="zone-badge-sm ${z.risk}">${z.emoji}</div>
          <div>
            <div style="font-weight:600; font-size:14px; margin-bottom:2px;">${z.name}</div>
            <div style="font-size:11px; color:var(--gray-400);">Status: ${z.status}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Sora',sans-serif; font-size:16px; font-weight:700;">Risk: <span class="admin-risk-score">${z.riskScore}</span></div>
          <div style="font-size:10px; color:var(--gray-400);">Policies: ${Math.floor(Math.random() * 1000 + 400)}</div>
        </div>
      </div>
    `;
  });

  // Render Admin Claims
  const claimsFeed = document.getElementById('admin-claims-feed');
  claimsFeed.innerHTML = '';
  PAYOUT_HISTORY.forEach(p => {
    claimsFeed.innerHTML += `
      <div class="admin-claim-item">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; background:rgba(34,197,94,0.1); border-radius:18px; display:flex; align-items:center; justify-content:center; color:var(--green); font-size:18px;">✓</div>
          <div>
            <div style="font-weight:600; font-size:13px; margin-bottom:2px;">Settlement • ${p.trigger}</div>
            <div style="font-size:11px; color:var(--gray-400);">${p.date} • ZOM-${Math.floor(Math.random()*8000+1000)}</div>
          </div>
        </div>
        <div style="color:var(--green); font-weight:700; font-family:'Sora',sans-serif;">₹${p.amount}</div>
      </div>
    `;
  });
}

function simulateDisasterEvent() {
  ZONES.forEach((z, i) => {
    const row = document.getElementById('admin-zone-' + i);
    if (row) {
      row.classList.add('risk-high');
      row.querySelector('.admin-risk-score').textContent = Math.floor(Math.random() * 20 + 80);
      row.querySelector('.admin-risk-score').style.color = 'var(--pink)';
    }
  });
  const alertBtn = document.getElementById('admin-trigger-alert');
  alertBtn.textContent = 'Triggers Activated!';
  alertBtn.style.background = 'var(--pink)';
  alertBtn.style.color = 'white';
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
function toggleSetupMode(isSignUp) {
  state.isSignUpMode = isSignUp;
  document.getElementById('tab-login').classList.toggle('active', !isSignUp);
  document.getElementById('tab-signup').classList.toggle('active', isSignUp);
  
  document.getElementById('signup-fields').classList.toggle('hidden', !isSignUp);
  
  document.getElementById('setup-title-text').innerHTML = isSignUp ? "Let's get you<br><span class='gradient-text'>protected.</span>" : "Welcome<br><span class='gradient-text'>back.</span>";
  document.getElementById('setup-sub-text').textContent = isSignUp ? "Enter your Zomato details to build your Earnings DNA" : "Enter your Zomato Partner ID to resume your session";
  document.getElementById('setup-submit-text').textContent = isSignUp ? "Build My Earnings DNA" : "Log In";
  
  // Toggle admin hint visibility
  document.getElementById('admin-hint').style.display = isSignUp ? "none" : "block";
  
  // Clear errors
  document.querySelectorAll('.input-hint.error').forEach(e => e.classList.remove('error'));
  document.querySelectorAll('.input-field.error-border').forEach(e => e.classList.remove('error-border'));
  document.getElementById('partner-id-hint').textContent = "Must start with 'ZOM-'";
  document.getElementById('partner-id-hint').style.color = "var(--gray-500)";
  document.getElementById('partner-id-hint').classList.remove('error');
  document.getElementById('partner-password-hint').classList.add('hidden');
}

function handleSetup() {
  const idField = document.getElementById('partner-id');
  const idHint = document.getElementById('partner-id-hint');
  let id = idField.value.trim();
  
  // Validation
  let hasError = false;

  // Secret Admin Route
  if (id.toUpperCase() === 'ADMIN') {
    const password = document.getElementById('partner-password').value.trim().toLowerCase();
    if (password === 'admin' || password === 'admin123') {
       initAdminDashboard();
       return;
    } else {
       const passHint = document.getElementById('partner-password-hint');
       passHint.textContent = "Incorrect admin passcode";
       passHint.classList.remove('hidden');
       passHint.classList.add('error');
       document.getElementById('partner-password').classList.add('error-border');
       return;
    }
  }
  
  if (!id.startsWith('ZOM-')) {
    idHint.textContent = "ID must start with ZOM-";
    idHint.style.color = "var(--red)";
    idHint.classList.add('error');
    idField.classList.add('error-border');
    hasError = true;
  } else {
    idHint.textContent = "Found in Zomato Partner app → Profile";
    idHint.style.color = "var(--gray-500)";
    idHint.classList.remove('error');
    idField.classList.remove('error-border');
  }

  const passField = document.getElementById('partner-password');
  const passHint = document.getElementById('partner-password-hint');
  if (!passField.value.trim()) {
    passField.classList.add('error-border');
    passHint.classList.remove('hidden');
    passHint.classList.add('error');
    hasError = true;
  } else {
    passField.classList.remove('error-border');
    passHint.classList.add('hidden');
    passHint.classList.remove('error');
  }

  let name = "Partner";
  let upi = "partner@upi";
  
  if (state.isSignUpMode) {
    const nameField = document.getElementById('partner-name');
    const nameHint = document.getElementById('partner-name-hint');
    if (!nameField.value.trim()) {
      nameHint.classList.remove('hidden');
      nameField.classList.add('error-border');
      hasError = true;
    } else {
      nameHint.classList.add('hidden');
      nameField.classList.remove('error-border');
      name = nameField.value.trim();
    }
    
    const upiField = document.getElementById('upi-id');
    const upiHint = document.getElementById('upi-hint');
    if (!upiField.value.includes('@')) {
      upiHint.textContent = "Must be a valid UPI (e.g. name@bank)";
      upiHint.style.color = "var(--red)";
      upiField.classList.add('error-border');
      hasError = true;
    } else {
      upiHint.textContent = "Must contain '@'";
      upiHint.style.color = "var(--gray-500)";
      upiField.classList.remove('error-border');
      upi = upiField.value.trim();
    }
  }

  if (hasError) return;

  const btn = document.getElementById('setup-submit');
  btn.classList.add('btn-loading');
  
  setTimeout(() => {
    btn.classList.remove('btn-loading');
    const zone = document.querySelector('.zone-btn.active')?.dataset.zone || 'HSR Layout';
    
    if (state.isSignUpMode) {
      MOCK_USERS[id] = { id, name, zone, upi, baseline: 5800, floor: 4350, premium: 52, weeklyEarned: 0, todayEarned: 0, todayOrders: 0, todayHours: 0 };
      toggleSetupMode(false);
      document.getElementById('partner-id').value = id;
      document.getElementById('setup-title-text').innerHTML = "Account<br><span class='gradient-text'>Ready.</span>";
      document.getElementById('setup-sub-text').textContent = "Identity verified. Please log in to proceed.";
      document.getElementById('setup-sub-text').style.color = "var(--green)";
    } else {
      const userData = MOCK_USERS[id] || { ...MOCK_USERS.default, id };
      setupUser(userData);
    }
  }, 1500);
}

function handleAdminAuth() {
   // Legacy - removed
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
  const container = document.getElementById('dna-helix-v2');
  if (container) {
    container.innerHTML = '';
    // Create 12 pairs of dots for the double helix
    for (let i = 0; i < 12; i++) {
       const delay = (i * 0.15).toFixed(2) + 's';
       const dotA = document.createElement('div');
       dotA.className = 'helix-dot a';
       dotA.style.setProperty('--d', delay);
       dotA.style.top = (i * 10) + 'px';
       
       const dotB = document.createElement('div');
       dotB.className = 'helix-dot b';
       dotB.style.setProperty('--d', delay);
       dotB.style.top = (i * 10) + 'px';
       
       container.appendChild(dotA);
       container.appendChild(dotB);
    }
  }

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

    setTimeout(() => {
      el.classList.add('active');
      statusEl.textContent = status;
    }, delay);

    setTimeout(() => {
      el.classList.remove('active');
      el.classList.add('done');
      statusEl.textContent = done;
    }, delay + 1000);
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
    { label: 'Trigger Detected', icon: 'Zap', delay: 0 },
    { label: 'Validating GPS & Movement', icon: 'MapPin', delay: 600 },
    { label: 'Running Fraud Checks (6 layers)', icon: 'Activity', delay: 1400 },
    { label: 'Claim Approved', icon: 'CheckCircle', delay: 2400 },
    { label: 'Payout Sent to UPI', icon: 'Wallet', delay: 3200 },
  ];

  const timeline = document.getElementById('claim-timeline');
  timeline.innerHTML = '';

  steps.forEach((step, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-step';
    el.id = 'ts-' + i;
    el.innerHTML = `<div class="ts-dot">${getIcon(step.icon)}</div>
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
    <div class="payout-item-icon">${getIcon('Wallet')}</div>
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
        <div class="payout-item-icon">${getIcon('Wallet')}</div>
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
        <div class="karma-order-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
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
        <div class="fraud-layer-icon">${getIcon(layer.icon)}</div>
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
  const allScreens = ['splash', 'onboarding', 'setup', 'dna-building', 'main-app', 'admin-dashboard'];
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
      <button onclick="exitDemoMode()" style="margin-left:auto;background:none;border:none;color:var(--gray-400);font-size:18px;cursor:pointer" title="Exit Walkthrough">×</button>
    </div>
    <p style="font-size:13px;color:var(--gray-500);line-height:1.5;margin-bottom:12px">${step.desc}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <button onclick="exitDemoMode()" style="color:var(--gray-500);font-size:13px;font-weight:600;background:none;border:none;cursor:pointer">Exit Walkthrough</button>
      <div>
        <button onclick="prevDemoStep()" style="background:var(--gray-200);color:var(--gray-700);padding:6px 12px;border-radius:16px;font-size:13px;font-weight:600;border:none;cursor:pointer;margin-right:8px;">← Prev</button>
        <button onclick="advanceDemoStep()" style="background:var(--pink);color:white;padding:6px 14px;border-radius:16px;font-size:13px;font-weight:600;border:none;cursor:pointer">Next Step →</button>
      </div>
    </div>`;
  document.body.appendChild(tooltip);
}

function exitDemoMode() {
  state.demoMode = false;
  document.getElementById('demo-banner').classList.add('hidden');
  const tooltip = document.getElementById('demo-tooltip');
  if (tooltip) tooltip.remove();
  const karmaOverlay = document.getElementById('karma-demo-overlay');
  if (karmaOverlay) karmaOverlay.remove();
}

function prevDemoStep() {
  if (state.demoStep <= 0) return;
  state.demoStep--;
  runDemoStep(state.demoStep);
}

function showKarmaOrderWarning() {
   const existing = document.getElementById('karma-demo-overlay');
   if (existing) existing.remove();
   
   const overlay = document.createElement('div');
   overlay.id = 'karma-demo-overlay';
   overlay.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);width:90%;max-width:350px;background:white;border-radius:16px;box-shadow:0 8px 32px rgba(239,68,68,0.3);z-index:100;border:2px solid var(--red);animation:slideDown 0.3s ease;padding:20px;';
   overlay.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
         <span style="font-size:28px;">🛵</span>
         <div>
            <div style="font-weight:700;font-size:16px;">New Order Request</div>
            <div style="font-size:12px;color:var(--gray-500);">Rohit M. · 3.2km away · ₹85 payout</div>
         </div>
      </div>
      <div style="background:rgba(239,68,68,0.06);border-radius:12px;padding:12px;border:1px solid var(--red);margin-bottom:12px;">
         <div style="color:var(--red);font-weight:800;font-size:14px;margin-bottom:8px;">👉 Customer Risk Score: HIGH</div>
         <ul style="font-size:12px;color:var(--gray-700);padding-left:20px;margin-bottom:0;">
            <li>High Cancellation rate (34%)</li>
            <li>Past delivery failures</li>
            <li>Frequent payment issues</li>
         </ul>
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--pink);text-align:center;margin-top:12px;">
         🛡️ Coverage increased for failed delivery
      </div>
      <button onclick="this.parentElement.remove()" class="btn-primary full-width" style="margin-top:16px;">Accept Order Carefully</button>
   `;
   document.body.appendChild(overlay);
   // Also scroll to karma orders list
   const scrollEl = document.getElementById('screen-earnings').querySelector('.screen-scroll');
   if(scrollEl) scrollEl.scrollTo({top: 400, behavior: 'smooth'});
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
