// Kleine Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Month helpers
const fmtCHF = (n=0) =>
  new Intl.NumberFormat('de-CH', { style:'currency', currency:'CHF', minimumFractionDigits:2 }).format(n);

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

const monthSelect = $('#monthSelect');
const prevBtn = $('#prevMonth');
const nextBtn = $('#nextMonth');
const tabs = $$('.tab');
const views = {
  dashboard: $('#view-dashboard'),
  wallace:   $('#view-wallace'),
  patricia:  $('#view-patricia'),
  shared:    $('#view-shared'),
  settings:  $('#view-settings'),
};

// State
let currentDate = new Date();

// Build months list
function buildMonthOptions(){
  monthSelect.innerHTML = '';
  const now = new Date(currentDate);
  for (let delta = -12; delta <= 12; delta++){
    const d = new Date(now.getFullYear(), now.getMonth()+delta, 1);
    const key = yyyymm(d);
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = monthLabel(key);
    if (delta===0) opt.selected = true;
    monthSelect.appendChild(opt);
  }
}
buildMonthOptions();

// Nav handlers (nur Tabs)
function showView(key){
  Object.values(views).forEach(v => v.classList.remove('active'));
  if (views[key]) views[key].classList.add('active');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === key));
}
tabs.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.target)));

// Month handlers
prevBtn.addEventListener('click', ()=>{
  currentDate.setMonth(currentDate.getMonth()-1);
  buildMonthOptions();
});
nextBtn.addEventListener('click', ()=>{
  currentDate.setMonth(currentDate.getMonth()+1);
  buildMonthOptions();
});
monthSelect.addEventListener('change', ()=>{/* später Datenwechsel */});

// Placeholder numbers (wie zuvor)
function setPlaceholder(){
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

  $('#debt-w').textContent = fmtCHF(0);
  $('#debt-p').textContent = fmtCHF(0);
  $('#debt-total').textContent = fmtCHF(0);
}
setPlaceholder();