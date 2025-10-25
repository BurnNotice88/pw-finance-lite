// app.js (M1 – Shell, Auto-Login, Tabs, Monat-Dropdown, Sync-Anzeige)
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- Basic UI refs
const loginScreen = $('#login-screen');
const appScreen   = $('#app-screen');
const syncBadge   = $('#sync-indicator');
const whoami      = $('#whoami');
const monthSelect = $('#monthSelect');

// Tabs
const tabs = $$('.tab');
const views = {
  dashboard: $('#view-dashboard'),
  wallace:   $('#view-wallace'),
  patricia:  $('#view-patricia'),
  shared:    $('#view-shared'),
  settings:  $('#view-settings'),
};

// Simple CHF formatter (de-CH)
const fmtCHF = (n=0) =>
  new Intl.NumberFormat('de-CH', { style:'currency', currency:'CHF', minimumFractionDigits:2 }).format(n);

// Network status
function updateOnlineStatus(){
  if (navigator.onLine) {
    syncBadge.textContent = 'Online';
    syncBadge.style.background = '#16A34A';
  } else {
    syncBadge.textContent = 'Offline';
    syncBadge.style.background = '#6B7280';
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Month dropdown (current ± 18 Monate)
function yyyymm(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  return `${y}-${m}`;
}
function monthLabel(ym){
  const [y,m] = ym.split('-').map(Number);
  const d = new Date(y, m-1, 1);
  return d.toLocaleDateString('de-CH', { month:'long', year:'numeric' });
}
function buildMonthOptions(){
  monthSelect.innerHTML = '';
  const now = new Date();
  const options = [];
  for (let delta = -12; delta <= 12; delta++){
    const d = new Date(now.getFullYear(), now.getMonth()+delta, 1);
    const key = yyyymm(d);
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = monthLabel(key);
    options.push(opt);
  }
  options.forEach(o => monthSelect.appendChild(o));
  // select current month
  const cur = yyyymm(new Date());
  monthSelect.value = cur;
}
buildMonthOptions();

// Tab navigation
function showView(key){
  Object.values(views).forEach(v => v.classList.remove('active'));
  Object.keys(views).forEach(k => {
    if (k === key) views[k].classList.add('active');
  });
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === key));
}
tabs.forEach(btn => btn.addEventListener('click', () => {
  showView(btn.dataset.target);
}));

// Dummy dashboard numbers for M1 (placeholder only)
function setPlaceholderNumbers(){
  // All zeros in M1; real values in M2
  $('#sum-income').textContent = fmtCHF(0);
  $('#sum-expense').textContent = fmtCHF(0);
  $('#sum-balance').textContent = fmtCHF(0);

  $('#w-income').textContent = fmtCHF(0);
  $('#w-expense').textContent = fmtCHF(0);
  $('#w-balance').textContent = fmtCHF(0);

  $('#p-income').textContent = fmtCHF(0);
  $('#p-expense').textContent = fmtCHF(0);
  $('#p-balance').textContent = fmtCHF(0);

  $('#s-income').textContent = fmtCHF(0);
  $('#s-expense').textContent = fmtCHF(0);
  $('#s-balance').textContent = fmtCHF(0);

  $('#debt-w').textContent = 'CHF 0.00 | 0/Mt';
  $('#debt-p').textContent = 'CHF 0.00 | 0/Mt';
  $('#debt-s').textContent = 'CHF 0.00 | 0/Mt';
  $('#debt-total').textContent = 'CHF 0.00';
}
setPlaceholderNumbers();

// Auth wiring (from index.html bootstrap)
const fb = window.__firebase || null;

// Login flow (first time only)
function attachLoginHandlers(){
  const btnLogin = $('#btn-login');
  const email    = $('#email');
  const password = $('#password');
  const errEl    = $('#login-error');

  if (!btnLogin) return;

  btnLogin.addEventListener('click', async () => {
    errEl.classList.add('hidden');
    errEl.textContent = '';
    try {
      if (!fb) throw new Error('Firebase nicht geladen.');
      await fb.signInWithEmailAndPassword(fb.auth, email.value.trim(), password.value);
      // success → onAuthStateChanged übernimmt das Umschalten
    } catch (e) {
      errEl.textContent = e?.message || 'Login fehlgeschlagen';
      errEl.classList.remove('hidden');
    }
  });
}

// Logout
$('#btn-logout')?.addEventListener('click', async () => {
  try {
    if (!fb) return;
    await fb.signOut(fb.auth);
  } catch {}
});

// Switch UI based on auth
function setUIForUser(user){
  if (user){
    // App sichtbar
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    whoami.textContent = user.email || 'angemeldet';
    syncBadge.textContent = 'Online';
    syncBadge.style.background = '#16A34A';
  } else {
    // Login sichtbar
    appScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    whoami.textContent = '–';
    updateOnlineStatus();
  }
}

// Wait for auth (provided in index.html)
if (window.__authReady){
  window.__authReady.then((user) => {
    setUIForUser(user);
    attachLoginHandlers();
  });
  // also subscribe to changes
  window.__onAuthChange = (user) => setUIForUser(user);
} else {
  // Fallback: no Firebase present (still let UI load)
  loginScreen.classList.remove('hidden');
  attachLoginHandlers();
}

// Month change (for M1 just placeholder)
monthSelect.addEventListener('change', () => {
  // In M2 wird die Auswahl die Daten-Queries steuern
  // Hier nur eine kleine visuelle Bestätigung via badge
  const nowKey = yyyymm(new Date());
  const isFuture = monthSelect.value > nowKey;
  const isPast   = monthSelect.value < nowKey;

  // Badges (IST/Prognose) – einfache Demo in M1
  $('#badge-w').textContent = isFuture ? 'Prognose' : 'IST';
  $('#badge-p').textContent = isFuture ? 'Prognose' : 'IST';
  $('#badge-s').textContent = isFuture ? 'Prognose' : 'IST';
});