/* --------- Utilities --------- */
const fmtCHF = (n=0) =>
  `CHF ${Number(n || 0).toLocaleString('de-CH', {minimumFractionDigits:2, maximumFractionDigits:2})}`;

const clampMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

/* --------- Storage (localStorage v1) --------- */
const STORAGE_KEY = 'fainance.v1';
function loadStore(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch{ return {}; }
}
function saveStore(store){ localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }

/* Datenstruktur:
store[yyyy-mm] = {
  w:{ income:[{t,a}], expense:[{t,a}], debt:[{t,a}] },
  p:{ income:[...], expense:[...], debt:[...] },
  g:{ income:[...], expense:[...] }
}
debt: separat gespeichert, aber in Home nur Summe gezeigt; (keine Monatslogik nötig – wir führen sie dennoch pro Monat, damit es konsistent bleibt)
*/
function ensureMonth(store, key){
  if(!store[key]) store[key] = {
    w:{income:[],expense:[],debt:[]},
    p:{income:[],expense:[],debt:[]},
    g:{income:[],expense:[]}
  };
}

/* --------- View/State --------- */
const state = {
  current: clampMonth(new Date()),
  activeView: 'view-home'
};

const monthSelect = document.getElementById('monthSelect');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

function monthKey(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function monthLabel(d){
  return d.toLocaleDateString('de-CH', {month:'long', year:'numeric'});
}
function rebuildMonthSelect(){
  monthSelect.innerHTML = '';
  // 18 Monate zurück/ vor
  const start = new Date(state.current); start.setMonth(start.getMonth()-12);
  for(let i=0;i<25;i++){
    const d = new Date(start); d.setMonth(start.getMonth()+i);
    const opt = document.createElement('option');
    opt.value = monthKey(d);
    opt.textContent = monthLabel(d);
    if(monthKey(d) === monthKey(state.current)) opt.selected = true;
    monthSelect.appendChild(opt);
  }
}
prevBtn.addEventListener('click', ()=>{ state.current.setMonth(state.current.getMonth()-1); rebuildMonthSelect(); renderAll(); });
nextBtn.addEventListener('click', ()=>{ state.current.setMonth(state.current.getMonth()+1); rebuildMonthSelect(); renderAll(); });
monthSelect.addEventListener('change', (e)=>{
  const [y,m] = e.target.value.split('-').map(Number);
  state.current = new Date(y, m-1, 1);
  renderAll();
});

/* --------- Tabs --------- */
document.querySelectorAll('.tabbar .tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tabbar .tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    state.activeView = target;
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    renderAll();
  });
});

/* --------- CRUD Helpers --------- */
function addItem(scope, type, title, amount){
  const key = monthKey(state.current);
  const store = loadStore(); ensureMonth(store, key);
  const list = store[key][scope][type];
  list.push({t: String(title||'Ohne Titel').trim(), a: Number(amount||0)});
  saveStore(store);
}

function removeItem(scope, type, idx){
  const key = monthKey(state.current);
  const store = loadStore(); ensureMonth(store, key);
  store[key][scope][type].splice(idx,1);
  saveStore(store);
}

/* --------- Rendering --------- */
function sum(list){ return list.reduce((s,x)=> s + Number(x.a||0), 0); }

function renderHome(){
  const key = monthKey(state.current);
  const store = loadStore(); ensureMonth(store, key);
  const m = store[key];

  // Wallace
  const wInc = sum(m.w.income), wExp = sum(m.w.expense), wBal = wInc - wExp;
  document.getElementById('w-inc').textContent = fmtCHF(wInc);
  document.getElementById('w-exp').textContent = fmtCHF(wExp);
  const wBalEl = document.getElementById('w-bal');
  wBalEl.textContent = fmtCHF(wBal);
  wBalEl.classList.toggle('positive', wBal >= 0);
  wBalEl.classList.toggle('negative', wBal < 0);

  // Patricia
  const pInc = sum(m.p.income), pExp = sum(m.p.expense), pBal = pInc - pExp;
  document.getElementById('p-inc').textContent = fmtCHF(pInc);
  document.getElementById('p-exp').textContent = fmtCHF(pExp);
  const pBalEl = document.getElementById('p-bal');
  pBalEl.textContent = fmtCHF(pBal);
  pBalEl.classList.toggle('positive', pBal >= 0);
  pBalEl.classList.toggle('negative', pBal < 0);

  // Gemeinsam
  const gInc = sum(m.g.income), gExp = sum(m.g.expense), gBal = gInc - gExp;
  document.getElementById('g-inc').textContent = fmtCHF(gInc);
  document.getElementById('g-exp').textContent = fmtCHF(gExp);
  const gBalEl = document.getElementById('g-bal');
  gBalEl.textContent = fmtCHF(gBal);
  gBalEl.classList.toggle('positive', gBal >= 0);
  gBalEl.classList.toggle('negative', gBal < 0);

  // Schulden (Summen)
  document.getElementById('w-debt').textContent = fmtCHF(sum(m.w.debt));
  document.getElementById('p-debt').textContent = fmtCHF(sum(m.p.debt));
}

function renderLists(){
  const key = monthKey(state.current);
  const store = loadStore(); ensureMonth(store, key);
  const m = store[key];

  const fillKV = (containerId, list) => {
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    if(!list.length){
      const empty = document.createElement('div');
      empty.className = 'row';
      empty.innerHTML = `<span class="muted">– keine Einträge –</span><span></span>`;
      c.appendChild(empty);
      return;
    }
    list.forEach(it=>{
      const r = document.createElement('div'); r.className='row';
      r.innerHTML = `<span>${it.t}</span><span class="money">${fmtCHF(it.a)}</span>`;
      c.appendChild(r);
    });
  };

  fillKV('w-inc-list', m.w.income);
  fillKV('w-exp-list', m.w.expense);
  fillKV('p-inc-list', m.p.income);
  fillKV('p-exp-list', m.p.expense);
  fillKV('g-inc-list', m.g.income);
  fillKV('g-exp-list', m.g.expense);
}

function renderEditors(){
  const key = monthKey(state.current);
  const store = loadStore(); ensureMonth(store, key);
  const m = store[key];

  const mount = (rootId, list, scope, type) => {
    const root = document.getElementById(rootId);
    root.innerHTML = '';
    list.forEach((it, idx)=>{
      const row = document.createElement('div'); row.className='row';
      row.innerHTML = `
        <span>${it.t}</span>
        <span class="money">${fmtCHF(it.a)}</span>
        <button class="action-link" data-del='1' data-scope='${scope}' data-type='${type}' data-idx='${idx}'>Löschen</button>
      `;
      root.appendChild(row);
    });
    // click del
    root.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        removeItem(btn.dataset.scope, btn.dataset.type, Number(btn.dataset.idx));
        renderAll();
      });
    });
  };

  mount('w-income-edit', m.w.income, 'w', 'income');
  mount('w-expense-edit', m.w.expense, 'w', 'expense');
  mount('p-income-edit', m.p.income, 'p', 'income');
  mount('p-expense-edit', m.p.expense, 'p', 'expense');
  mount('g-income-edit', m.g.income, 'g', 'income');
  mount('g-expense-edit', m.g.expense, 'g', 'expense');
  mount('w-debt-edit', m.w.debt, 'w', 'debt');
  mount('p-debt-edit', m.p.debt, 'p', 'debt');
}

function renderAll(){
  rebuildMonthSelect();
  renderHome();
  renderLists();
  renderEditors();
}

/* --------- Form Handling (Einstellungen) --------- */
/* WICHTIG: Es wird NICHT beim ersten Tastendruck gespeichert.
   Nur bei Klick auf „Hinzufügen“. */
document.querySelectorAll('form.form-grid .btn[data-action="add"]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const form = e.target.closest('form');
    const scope = form.dataset.scope;            // w | p | g
    const type = form.dataset.type;              // income | expense | debt
    const [titleEl, amountEl] = form.querySelectorAll('input');
    const title = titleEl.value.trim();
    const amount = parseFloat((amountEl.value || '0').replace(',', '.'));
    if(!title || isNaN(amount)){ 
      amountEl.blur(); titleEl.blur();
      return;
    }
    addItem(scope, type, title, amount);
    // Felder leeren, Fokus auf Titel – kein Auto-Save, keine Tastatur-Schließung
    titleEl.value=''; amountEl.value='';
    titleEl.focus();
    renderAll();
  });
});

/* --------- Init --------- */
(function init(){
  renderAll();
})();