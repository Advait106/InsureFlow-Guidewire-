/* =============================================
   InsureFlow — admin.js
   Insurance Operations Dashboard Logic
   ============================================= */

const ADMIN_CREDS = { username: 'admin', password: 'insureflow2025' };

// =========== AUTH ===========
function attemptLogin() {
  const u = document.getElementById('auth-username').value;
  const p = document.getElementById('auth-password').value;
  const err = document.getElementById('auth-error');
  if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
    document.getElementById('auth-gate').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    document.getElementById('admin-name').textContent = 'Admin Operator';
    initDashboard();
  } else {
    err.style.display = 'block';
    document.getElementById('auth-password').value = '';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('auth-gate').style.display !== 'none') attemptLogin();
});

function logout() {
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('auth-gate').style.display = 'flex';
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-password').value = '';
}

// =========== PANEL NAVIGATION ===========
function showPanel(name, btn) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// =========== INIT ===========
function initDashboard() {
  updateClock();
  setInterval(updateClock, 1000);
  renderCharts();
  renderTriggersTable();
  renderUsersTable();
  renderClaimsTable();
  renderFraudTable();
  renderTriggerConfig();
  renderZoneHeatmap();
  renderApiStatus();
  renderLiveFeed();
  setInterval(() => tickLiveFeed(), 5000);
}

function updateClock() {
  const el = document.getElementById('live-time');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
}

// =========== CHARTS ===========
function renderCharts() {
  const claimsData = [
    { day: 'Mon', val: 45, color: '#FF2D6B' },
    { day: 'Tue', val: 62, color: '#FF2D6B' },
    { day: 'Wed', val: 138, color: '#EF4444' },
    { day: 'Thu', val: 94, color: '#F59E0B' },
    { day: 'Fri', val: 71, color: '#FF2D6B' },
    { day: 'Sat', val: 55, color: '#FF2D6B' },
    { day: 'Sun', val: 82, color: '#FF2D6B' },
  ];
  renderBarChart('claims-chart', 'claims-labels', claimsData, 138);

  const revenueData = [
    { day: 'Premium', val: 668000, color: '#22C55E' },
    { day: 'Claims', val: 214000, color: '#EF4444' },
    { day: 'Fraud Saved', val: 84300, color: '#F59E0B' },
    { day: 'Net', val: 538000, color: '#3B82F6' },
  ];
  renderBarChart('revenue-chart', 'revenue-labels', revenueData, 668000);
}

function renderBarChart(chartId, labelsId, data, maxVal) {
  const chart = document.getElementById(chartId);
  const labels = document.getElementById(labelsId);
  chart.innerHTML = '';
  labels.innerHTML = '';
  data.forEach(d => {
    const bar = document.createElement('div');
    const h = Math.max(4, Math.round((d.val / maxVal) * 100));
    bar.className = 'bar';
    bar.style.height = h + 'px';
    bar.style.background = d.color;
    bar.title = d.day + ': ' + d.val;
    chart.appendChild(bar);

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = d.day.substring(0, 3);
    label.style.flex = '1';
    label.style.color = 'var(--text-muted)';
    label.style.fontSize = '9px';
    label.style.textAlign = 'center';
    labels.appendChild(label);
  });
}

// =========== TRIGGERS TABLE ===========
function renderTriggersTable() {
  const rows = [
    { time: '14:32', trigger: '🌧️ Rainfall > 65mm', zone: 'BTM Layout', affected: 847, payout: '₹38,115', status: 'paid' },
    { time: '14:28', trigger: '📉 Earnings drop -62%', zone: 'BTM Layout', affected: 612, payout: '₹27,540', status: 'paid' },
    { time: '14:15', trigger: '🔕 Peer inactivity 74%', zone: 'BTM Layout', affected: 723, payout: '₹32,535', status: 'paid' },
    { time: '09:44', trigger: '😷 AQI > 300', zone: 'Whitefield', affected: 284, payout: '₹12,780', status: 'paid' },
    { time: '08:12', trigger: '🚗 Traffic index 78', zone: 'Koramangala', affected: 193, payout: '₹8,685', status: 'pending' },
  ];
  const tbody = document.getElementById('triggers-tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${r.time}</td>
      <td>${r.trigger}</td>
      <td>${r.zone}</td>
      <td><strong>${r.affected.toLocaleString('en-IN')}</strong></td>
      <td style="font-family:'DM Mono',monospace;color:var(--green)">${r.payout}</td>
      <td><span class="badge ${r.status}">${r.status.toUpperCase()}</span></td>
    </tr>`).join('');
}

// =========== USERS TABLE ===========
function renderUsersTable() {
  const users = [
    { id: 'ZOM-2947381', name: 'Raju Sharma', zone: 'HSR Layout', baseline: '₹5,800', premium: '₹52', status: 'active', fraud: 18 },
    { id: 'ZOM-1823944', name: 'Priya Venkat', zone: 'Indiranagar', baseline: '₹6,200', premium: '₹58', status: 'active', fraud: 12 },
    { id: 'ZOM-3847291', name: 'Mohammed Ismail', zone: 'BTM Layout', baseline: '₹5,400', premium: '₹67', status: 'active', fraud: 22 },
    { id: 'ZOM-9284710', name: 'Kavya Nair', zone: 'Koramangala', baseline: '₹5,950', premium: '₹54', status: 'active', fraud: 8 },
    { id: 'ZOM-5571823', name: 'Arjun Singh', zone: 'Whitefield', baseline: '₹5,100', premium: '₹48', status: 'active', fraud: 35 },
    { id: 'ZOM-4420917', name: 'Lakshmi Bai', zone: 'Jayanagar', baseline: '₹5,600', premium: '₹51', status: 'active', fraud: 15 },
  ];
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${u.id}</td>
      <td><strong>${u.name}</strong></td>
      <td>${u.zone}</td>
      <td style="font-family:'DM Mono',monospace">${u.baseline}</td>
      <td style="font-family:'DM Mono',monospace;color:var(--pink)">${u.premium}</td>
      <td><span class="badge ${u.status}">${u.status.toUpperCase()}</span></td>
      <td>
        <span style="color:${u.fraud < 30 ? 'var(--green)' : u.fraud < 60 ? 'var(--amber)' : 'var(--red)'}">
          ${u.fraud}/100 — ${u.fraud < 30 ? 'LOW' : u.fraud < 60 ? 'MED' : 'HIGH'}
        </span>
      </td>
    </tr>`).join('');
}

// =========== CLAIMS TABLE ===========
function renderClaimsTable() {
  const claims = [
    { id: 'CLM-00847', partner: 'Raju Sharma', trigger: 'Rain + Earnings Drop', amount: '₹450', fraud: 18, time: '58s', status: 'paid' },
    { id: 'CLM-00846', partner: 'Mohammed Ismail', trigger: 'Rainfall > 65mm', amount: '₹620', fraud: 22, time: '61s', status: 'paid' },
    { id: 'CLM-00845', partner: 'Kavya Nair', trigger: 'Rainfall > 65mm', amount: '₹380', fraud: 8, time: '54s', status: 'paid' },
    { id: 'CLM-00844', partner: 'Arjun Singh', trigger: 'AQI > 300', amount: '₹290', fraud: 72, time: '—', status: 'fraud' },
    { id: 'CLM-00843', partner: 'Unknown ZOM-8847', trigger: 'Earnings velocity', amount: '₹500', fraud: 91, time: '—', status: 'fraud' },
    { id: 'CLM-00842', partner: 'Priya Venkat', trigger: 'Traffic index 76', amount: '₹200', fraud: 15, time: '—', status: 'pending' },
  ];
  const tbody = document.getElementById('claims-tbody');
  tbody.innerHTML = claims.map(c => `
    <tr>
      <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${c.id}</td>
      <td><strong>${c.partner}</strong></td>
      <td>${c.trigger}</td>
      <td style="font-family:'DM Mono',monospace;font-weight:700">${c.amount}</td>
      <td style="color:${c.fraud < 40 ? 'var(--green)' : c.fraud < 70 ? 'var(--amber)' : 'var(--red)'}">${c.fraud}/100</td>
      <td style="font-family:'DM Mono',monospace">${c.time}</td>
      <td><span class="badge ${c.status}">${c.status.toUpperCase()}</span></td>
    </tr>`).join('');
}

// =========== FRAUD TABLE ===========
function renderFraudTable() {
  const frauds = [
    { id: 'CLM-00844', partner: 'ZOM-5571823', score: 72, layer: 'GPS Kinematic', pattern: 'Teleport detected (12km jump)', action: 'Hold + Review' },
    { id: 'CLM-00843', partner: 'ZOM-8847XXX', score: 91, layer: 'Peer Network', pattern: 'T_spike 8.4σ — syndicate pattern', action: 'Auto-Reject' },
    { id: 'CLM-00801', partner: 'ZOM-9921847', score: 84, layer: 'Device Cluster', pattern: '3 accounts on 1 device', action: 'Manual Review' },
    { id: 'CLM-00789', partner: 'ZOM-4471823', score: 67, layer: 'DNA Mismatch', pattern: 'Behavior 3.2σ from baseline', action: 'Soft Flag' },
  ];
  const tbody = document.getElementById('fraud-tbody');
  tbody.innerHTML = frauds.map(f => `
    <tr>
      <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${f.id}</td>
      <td style="font-family:'DM Mono',monospace;font-size:12px">${f.partner}</td>
      <td style="color:${f.score < 70 ? 'var(--amber)' : 'var(--red)'}"><strong>${f.score}/100</strong></td>
      <td>${f.layer}</td>
      <td style="font-size:12px;color:var(--text-muted)">${f.pattern}</td>
      <td><span class="badge ${f.score > 80 ? 'fraud' : 'pending'}">${f.action}</span></td>
    </tr>`).join('');
}

// =========== TRIGGER CONFIG ===========
function renderTriggerConfig() {
  const configs = [
    { icon: '🌧️', name: 'Rainfall Threshold', desc: 'IMD API — mm per 3hr window', key: 'rain', val: 65, unit: 'mm', enabled: true },
    { icon: '😷', name: 'AQI Threshold', desc: 'CPCB API — sustained 4 hours', key: 'aqi', val: 300, unit: 'AQI', enabled: true },
    { icon: '🔥', name: 'Heat Alert', desc: 'NIOH outdoor safety threshold', key: 'heat', val: 44, unit: '°C', enabled: true },
    { icon: '🚗', name: 'Traffic Index', desc: 'Traffic congestion score', key: 'traffic', val: 75, unit: 'index', enabled: true },
    { icon: '📉', name: 'Earnings Velocity Crash', desc: 'v_ratio threshold — sustained 2hrs + external signal', key: 'velocity', val: 40, unit: '%', enabled: true },
    { icon: '🔕', name: 'Peer Inactivity', desc: 'Zone peer inactive threshold', key: 'inactivity', val: 70, unit: '%', enabled: true },
  ];
  const list = document.getElementById('triggers-config-list');
  list.innerHTML = configs.map(c => `
    <div class="trigger-config-row">
      <div class="tcr-icon">${c.icon}</div>
      <div class="tcr-info">
        <div class="tcr-name">${c.name}</div>
        <div class="tcr-desc">${c.desc}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <input type="number" class="tcr-input" value="${c.val}" id="tcr-${c.key}">
        <span style="font-size:12px;color:var(--text-muted)">${c.unit}</span>
      </div>
      <div class="tcr-toggle ${c.enabled ? '' : 'off'}" onclick="toggleTrigger(this)"></div>
    </div>`).join('');
}

function toggleTrigger(el) { el.classList.toggle('off'); }

// =========== ZONE HEATMAP ===========
function renderZoneHeatmap() {
  const zones = [
    { name: 'BTM Layout', risk: 'red', claims: 847, label: 'Flood Risk — TRIGGER ACTIVE' },
    { name: 'Koramangala', risk: 'amber', claims: 284, label: 'Moderate — Elevated' },
    { name: 'HSR Layout', risk: 'green', claims: 43, label: 'Safe — Normal' },
    { name: 'Indiranagar', risk: 'green', claims: 67, label: 'Safe — Surge Active' },
    { name: 'Whitefield', risk: 'green', claims: 38, label: 'Safe — Normal' },
    { name: 'Jayanagar', risk: 'amber', claims: 124, label: 'Moderate — Watch' },
    { name: 'Electronic City', risk: 'red', claims: 412, label: 'Waterlogged — ACTIVE' },
    { name: 'Marathahalli', risk: 'amber', claims: 198, label: 'Moderate — Traffic' },
    { name: 'Banashankari', risk: 'green', claims: 29, label: 'Safe — Clear' },
  ];
  const grid = document.getElementById('admin-zone-grid');
  grid.innerHTML = zones.map(z => `
    <div class="heat-zone ${z.risk}">
      <div class="hz-name">${z.name}</div>
      <div class="hz-risk">${z.label}</div>
      <div class="hz-claims">${z.claims} claims this week</div>
    </div>`).join('');
}

// =========== API STATUS ===========
function renderApiStatus() {
  const apis = [
    { name: 'IMD Rainfall API', status: 'live', latency: '142ms', calls: '8,847', last: 'Just now', icon: '🌧️' },
    { name: 'CPCB Air Quality API', status: 'live', latency: '88ms', calls: '4,221', last: '30s ago', icon: '😷' },
    { name: 'Razorpay UPI API', status: 'live', latency: '211ms', calls: '1,247', last: '1m ago', icon: '💸' },
    { name: 'Zomato Partner API', status: 'mock', latency: '—', calls: '12,847', last: 'Simulated', icon: '🛵' },
    { name: 'GPS / Movement API', status: 'mock', latency: '—', calls: '94,284', last: 'Simulated', icon: '📍' },
    { name: 'Google Maps Geocoding', status: 'live', latency: '67ms', calls: '3,847', last: '5s ago', icon: '🗺️' },
  ];
  const container = document.getElementById('api-status-list');
  container.innerHTML = `<div class="table-card">
    <div class="table-header"><span class="table-title">API Integration Status</span></div>
    <table><thead><tr><th>API</th><th>Status</th><th>Latency</th><th>Total Calls (Week)</th><th>Last Ping</th></tr></thead>
    <tbody>${apis.map(a => `
      <tr>
        <td>${a.icon} <strong>${a.name}</strong></td>
        <td><span class="badge ${a.status === 'live' ? 'active' : 'pending'}">${a.status.toUpperCase()}</span></td>
        <td style="font-family:'DM Mono',monospace;font-size:12px">${a.latency}</td>
        <td style="font-family:'DM Mono',monospace">${a.calls}</td>
        <td style="font-size:12px;color:var(--text-muted)">${a.last}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

// =========== LIVE FEED ===========
const LIVE_EVENTS = [
  { icon: '💸', text: 'Raju Sharma (ZOM-2947381) — ₹450 payout sent to raju@upi', amount: '+₹450', type: 'paid' },
  { icon: '🌧️', text: 'Rainfall trigger fired — BTM Layout — 847 partners affected', amount: null, type: null },
  { icon: '🔍', text: 'Fraud detected — ZOM-8847 — T_spike 8.4σ — Auto-rejected', amount: 'FRAUD', type: 'fraud' },
  { icon: '💸', text: 'Mohammed Ismail (ZOM-3847291) — ₹620 payout sent', amount: '+₹620', type: 'paid' },
  { icon: '✅', text: 'Kavya Nair (ZOM-9284710) — claim CLM-00845 auto-approved in 54s', amount: '+₹380', type: 'paid' },
  { icon: '⚡', text: 'Earnings velocity crash detected — Koramangala — pre-validation started', amount: null, type: null },
  { icon: '😷', text: 'AQI crossed 280 in Whitefield — amber alert sent to 284 partners', amount: null, type: null },
  { icon: '🔍', text: 'Fraud review queued — CLM-00801 — 3 accounts on 1 device (IMEI match)', amount: null, type: null },
];

let feedEventIndex = 0;

function renderLiveFeed() {
  const list = document.getElementById('live-feed-list');
  list.innerHTML = '';
  LIVE_EVENTS.slice(0, 6).forEach((e, i) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - (6 - i) * 2);
    list.insertAdjacentHTML('beforeend', makeFeedItem(e, now));
  });
  feedEventIndex = 6;
}

function tickLiveFeed() {
  const list = document.getElementById('live-feed-list');
  const e = LIVE_EVENTS[feedEventIndex % LIVE_EVENTS.length];
  const item = document.createElement('div');
  item.innerHTML = makeFeedItem(e, new Date());
  item.firstChild.style.opacity = '0';
  item.firstChild.style.transition = 'opacity 0.4s';
  list.insertBefore(item.firstChild, list.firstChild);
  setTimeout(() => list.firstChild.style.opacity = '1', 50);
  if (list.children.length > 10) list.removeChild(list.lastChild);
  feedEventIndex++;
}

function makeFeedItem(e, time) {
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `<div class="feed-item">
    <span class="feed-time">${timeStr}</span>
    <span class="feed-icon">${e.icon}</span>
    <span class="feed-text">${e.text}</span>
    ${e.amount ? `<span class="feed-amount ${e.type}">${e.amount}</span>` : ''}
  </div>`;
}
