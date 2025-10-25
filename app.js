// ------------------------------
// FAINANCE – lokale Datenspeicherung
// ------------------------------
const LS_KEY = "fainance_v1";

function monthKey(date) {
  // yyyy-mm
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
}
function formatCHF(n) {
  const val = Number(n || 0);
  return "CHF " + val.toLocaleString("de-CH", {minimumFractionDigits:2, maximumFractionDigits:2});
}
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return { months:{}, debts:{wallace:[], patricia:[]} };
    return JSON.parse(raw);
  }catch(e){
    return { months:{}, debts:{wallace:[], patricia:[]} };
  }
}
function saveState(state){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function ensureMonth(state, mk){
  if(!state.months[mk]){
    state.months[mk] = {
      wallace: { income:[], expense:[] },
      patricia:{ income:[], expense:[] },
      shared:  { income:[], expense:[] }
    };
  }
}

// ------------------------------
// UI-State
// ------------------------------
let state = loadState();
let currentDate = new Date();          // Start: aktueller Monat
let currentView = "home";

// DOM Refs
const monthLabel = document.getElementById("monthLabel");
const btnMonth   = document.getElementById("btnMonth");
const monthPicker = document.getElementById("monthPicker");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

const views = {
  home:      document.getElementById("view-home"),
  wallace:   document.getElementById("view-wallace"),
  patricia:  document.getElementById("view-patricia"),
  gemeinsam: document.getElementById("view-gemeinsam"),
  settings:  document.getElementById("view-settings"),
};
const tabs = Array.from(document.querySelectorAll(".tabbar .tab"));

// ------------------------------
// Monat UI
// ------------------------------
function labelForMonth(d){
  return d.toLocaleDateString("de-CH", {month:"long", year:"numeric"});
}
function setMonth(d){
  currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
  monthLabel.textContent = labelForMonth(currentDate);
  // sync hidden month input (für schnelles Springen)
  monthPicker.value = monthKey(currentDate);
  renderAll();
}
btnPrev.addEventListener("click", ()=>{
  const d = new Date(currentDate); d.setMonth(d.getMonth()-1); setMonth(d);
});
btnNext.addEventListener("click", ()=>{
  const d = new Date(currentDate); d.setMonth(d.getMonth()+1); setMonth(d);
});
btnMonth.addEventListener("click", ()=> {
  // iOS Safari zeigt "month" nicht immer im Overlay – wir simulieren Klick
  monthPicker.showPicker?.();
  monthPicker.focus();
});
monthPicker.addEventListener("change", (e)=>{
  const [y,m] = e.target.value.split("-").map(Number);
  if(y && m){
    setMonth(new Date(y, m-1, 1));
  }
});

// ------------------------------
// Navigation
// ------------------------------
tabs.forEach(t=>{
  t.addEventListener("click", ()=>{
    const to = t.dataset.view;
    if(to===currentView) return;
    currentView = to;
    Object.values(views).forEach(v=>v.classList.remove("active"));
    views[to].classList.add("active");
    tabs.forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    renderAll();
  });
});

// ------------------------------
// Daten-Helfer
// ------------------------------
function addItem(scope, kind, label, amount){
  const mk = monthKey(currentDate);
  ensureMonth(state, mk);
  const bucket = state.months[mk][scope][kind]; // scope: wallace|patricia|shared, kind: income|expense
  bucket.push({ label: label.trim(), amount: Number(String(amount).replace(",", ".")) || 0 });
  saveState(state);
  renderAll();
}
function delItem(scope, kind, idx){
  const mk = monthKey(currentDate);
  const bucket = state.months[mk][scope][kind];
  bucket.splice(idx,1);
  saveState(state);
  renderAll();
}
function sumsFor(scope){
  const mk = monthKey(currentDate);
  ensureMonth(state, mk);
  const m = state.months[mk][scope];
  const si = m.income.reduce((a,x)=>a+(+x.amount||0),0);
  const se = m.expense.reduce((a,x)=>a+(+x.amount||0),0);
  return { income: si, expense: se, balance: si-se };
}
function sumsTotal(){
  const w = sumsFor("wallace");
  const p = sumsFor("patricia");
  const g = sumsFor("shared");
  return {
    income: w.income + p.income + g.income,
    expense: w.expense + p.expense + g.expense,
    balance: (w.income + p.income + g.income) - (w.expense + p.expense + g.expense)
  };
}

// ------------------------------
// Render
// ------------------------------
function renderHome(){
  const w = sumsFor("wallace");
  const p = sumsFor("patricia");
  const g = sumsFor("shared");
  const t = sumsTotal();

  document.getElementById("sum-w-income").textContent = formatCHF(w.income);
  document.getElementById("sum-w-expense").textContent = formatCHF(w.expense);
  document.getElementById("sum-w-balance").textContent = formatCHF(w.balance);

  document.getElementById("sum-p-income").textContent = formatCHF(p.income);
  document.getElementById("sum-p-expense").textContent = formatCHF(p.expense);
  document.getElementById("sum-p-balance").textContent = formatCHF(p.balance);

  document.getElementById("sum-g-income").textContent = formatCHF(g.income);
  document.getElementById("sum-g-expense").textContent = formatCHF(g.expense);
  document.getElementById("sum-g-balance").textContent = formatCHF(g.balance);

  document.getElementById("sum-total").textContent = formatCHF(t.balance);
}
function renderPersonCards(){
  const w = sumsFor("wallace");
  document.getElementById("w-i").textContent = formatCHF(w.income);
  document.getElementById("w-e").textContent = formatCHF(w.expense);
  document.getElementById("w-b").textContent = formatCHF(w.balance);

  const p = sumsFor("patricia");
  document.getElementById("p-i").textContent = formatCHF(p.income);
  document.getElementById("p-e").textContent = formatCHF(p.expense);
  document.getElementById("p-b").textContent = formatCHF(p.balance);

  const g = sumsFor("shared");
  document.getElementById("g-i").textContent = formatCHF(g.income);
  document.getElementById("g-e").textContent = formatCHF(g.expense);
  document.getElementById("g-b").textContent = formatCHF(g.balance);
}
function renderSettingsLists(){
  const mk = monthKey(currentDate);
  ensureMonth(state, mk);
  const m = state.months[mk];

  const map = [
    ["list-w-i", m.wallace.income,  "wallace","income"],
    ["list-w-e", m.wallace.expense, "wallace","expense"],
    ["list-p-i", m.patricia.income, "patricia","income"],
    ["list-p-e", m.patricia.expense,"patricia","expense"],
    ["list-g-i", m.shared.income,   "shared","income"],
    ["list-g-e", m.shared.expense,  "shared","expense"],
  ];

  for(const [ulId, arr, scope, kind] of map){
    const ul = document.getElementById(ulId);
    ul.innerHTML = "";
    arr.forEach((item, idx)=>{
      const li = document.createElement("li");
      const left = document.createElement("div");
      left.className = "item-label";
      left.textContent = item.label || "—";

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.alignItems = "center";
      right.style.gap = "8px";

      const amt = document.createElement("div");
      amt.className = "item-amount";
      amt.textContent = formatCHF(item.amount);

      const del = document.createElement("button");
      del.className = "btn del";
      del.textContent = "Löschen";
      del.addEventListener("click", ()=> delItem(scope, kind, idx));

      right.appendChild(amt);
      right.appendChild(del);

      li.appendChild(left);
      li.appendChild(right);
      ul.appendChild(li);
    });
  }
}
function renderAll(){
  renderHome();
  renderPersonCards();
  renderSettingsLists();
}

// ------------------------------
// Hinzufügen (Einstellungen)
// ------------------------------
function parseAmount(v){ return Number(String(v).replace(",", ".")) || 0; }

document.querySelectorAll("button[data-add]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const target = btn.dataset.add; // e.g. "w-i"
    const [who, kind] = target.split("-"); // w|p|g  +  i|e
    const scopeMap = { w:"wallace", p:"patricia", g:"shared" };
    const kindMap  = { i:"income",  e:"expense"  };

    const scope = scopeMap[who];
    const cat   = kindMap[kind];

    const labelEl  = document.getElementById(`add-${who}-${kind}-label`);
    const amountEl = document.getElementById(`add-${who}-${kind}-amount`);
    const label  = (labelEl.value || "").trim();
    const amount = parseAmount(amountEl.value);

    if(label && amount !== 0){
      addItem(scope, cat, label, amount);
      labelEl.value = "";
      amountEl.value = "";
      labelEl.blur(); amountEl.blur();
    }
  });
});

// ------------------------------
// Init
// ------------------------------
setMonth(currentDate);