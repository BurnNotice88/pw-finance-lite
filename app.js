// ---------- Datenhaltung ----------
const LS_KEY = 'fainance:data';

const demoData = {
  wallace: {
    income: [{ label: 'Lohn', amount: 5550 }],
    expenses: [
      { label: 'Miete', amount: 1650 },
      { label: 'Versicherungen', amount: 310 },
      { label: 'Lebensmittel', amount: 500 },
    ],
  },
  patricia: {
    income: [
      { label: 'Lohn', amount: 5200 },
      { label: 'Salon-Bonus', amount: 400 },
    ],
    expenses: [
      { label: 'Miete', amount: 1400 },
      { label: 'Versicherungen', amount: 210 },
      { label: 'ÖV/Auto', amount: 110 },
      { label: 'Lebensmittel', amount: 500 },
    ],
  },
};

function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(demoData);
    const data = JSON.parse(raw);
    ['wallace', 'patricia'].forEach(k => {
      data[k] ??= { income: [], expenses: [] };
      data[k].income ??= [];
      data[k].expenses ??= [];
    });
    return data;
  } catch {
    return structuredClone(demoData);
  }
}
function saveData() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  renderAll();
}

let state = loadData();

// ---------- Helpers ----------
const CHF = n =>
  'CHF ' +
  Number(n || 0).toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const sum = arr => arr.reduce((a, b) => a + (Number(b.amount) || 0), 0);

const personTotals = person => {
  const income = sum(person.income);
  const expenses = sum(person.expenses);
  return { income, expenses, balance: income - expenses };
};

function setText(id, txt, positive = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = txt;
  el.classList.remove('positive', 'negative');
  el.classList.add(positive ? 'positive' : 'negative');
}

// ---------- Rendering: Übersicht & Tabs ----------
function renderHome() {
  const w = personTotals(state.wallace);
  const p = personTotals(state.patricia);
  const g = { income: w.income + p.income, expenses: w.expenses + p.expenses };
  g.balance = g.income - g.expenses;

  setText('home-w-income', CHF(w.income));
  setText('home-w-expense', CHF(w.expenses));
  setText('home-w-balance', CHF(w.balance), w.balance >= 0);

  setText('home-p-income', CHF(p.income));
  setText('home-p-expense', CHF(p.expenses));
  setText('home-p-balance', CHF(p.balance), p.balance >= 0);

  setText('home-g-income', CHF(g.income));
  setText('home-g-expense', CHF(g.expenses));
  setText('home-g-balance', CHF(g.balance), g.balance >= 0);
}

function renderPersonCards() {
  const w = personTotals(state.wallace);
  setText('w-income', CHF(w.income));
  setText('w-expense', CHF(w.expenses));
  setText('w-balance', CHF(w.balance), w.balance >= 0);

  const p = personTotals(state.patricia);
  setText('p-income', CHF(p.income));
  setText('p-expense', CHF(p.expenses));
  setText('p-balance', CHF(p.balance), p.balance >= 0);

  const gInc = w.income + p.income;
  const gExp = w.expenses + p.expenses;
  const gBal = gInc - gExp;

  setText('g-income', CHF(gInc));
  setText('g-expense', CHF(gExp));
  setText('g-balance', CHF(gBal), gBal >= 0);
}

// ---------- Einstellungen (Editor) ----------
function renderEditorList(containerId, items, onChange) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <input class="input" type="text" placeholder="Bezeichnung" value="${item.label ?? ''}">
      <input class="amount" type="number" inputmode="decimal" step="0.01" placeholder="Betrag (CHF)" value="${item.amount ?? ''}">
      <button class="del" title="Entfernen">✕</button>
    `;
    const [labelEl, amountEl, delBtn] = div.children;

    // Während des Tippens NUR in-memory aktualisieren – kein saveData()
    labelEl.addEventListener('input', () => {
      items[idx].label = labelEl.value;
    });
    amountEl.addEventListener('input', () => {
      // Erlaube Eingaben wie "10000" ohne sofortiges Speichern
      const v = amountEl.value.replace(',', '.');
      items[idx].amount = v === '' ? '' : parseFloat(v) || 0;
    });

    // Speichern erst bei Blur oder Enter
    const commit = () => {
      // Leere Beträge -> 0 speichern
      if (items[idx].amount === '') items[idx].amount = 0;
      saveData();
      // neu rendern, damit formatierte Zahlen erscheinen
      onChange();
    };
    labelEl.addEventListener('blur', commit);
    amountEl.addEventListener('blur', commit);
    labelEl.addEventListener('keydown', e => { if (e.key === 'Enter') labelEl.blur(); });
    amountEl.addEventListener('keydown', e => { if (e.key === 'Enter') amountEl.blur(); });

    delBtn.addEventListener('click', () => {
      items.splice(idx, 1);
      saveData();
      onChange();
    });

    container.appendChild(div);
  });
}

function renderSettings() {
  renderEditorList('w-income-list', state.wallace.income, renderSettings);
  renderEditorList('w-expense-list', state.wallace.expenses, renderSettings);
  renderEditorList('p-income-list', state.patricia.income, renderSettings);
  renderEditorList('p-expense-list', state.patricia.expenses, renderSettings);
}

function addItem(where) {
  if (where === 'w-income') state.wallace.income.push({ label: '', amount: 0 });
  if (where === 'w-expense') state.wallace.expenses.push({ label: '', amount: 0 });
  if (where === 'p-income') state.patricia.income.push({ label: '', amount: 0 });
  if (where === 'p-expense') state.patricia.expenses.push({ label: '', amount: 0 });
  saveData();
  renderSettings();
}

// ---------- Export / Import / Reset ----------
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fainance-export.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state = data;
      saveData();
      renderSettings();
    } catch {
      alert('Datei ungültig.');
    }
  };
  reader.readAsText(file);
}
function resetDemo() {
  if (!confirm('Beispieldaten laden und aktuelle Werte überschreiben?')) return;
  state = structuredClone(demoData);
  saveData();
  renderSettings();
}

// ---------- Navigation ----------
const tabButtons = document.querySelectorAll('.bottom-nav .chip');
const tabs = {
  home: document.getElementById('tab-home'),
  wallace: document.getElementById('tab-wallace'),
  patricia: document.getElementById('tab-patricia'),
  gemeinsam: document.getElementById('tab-gemeinsam'),
  settings: document.getElementById('tab-settings'),
};
function showTab(name) {
  Object.values(tabs).forEach(t => t.classList.remove('active'));
  tabs[name]?.classList.add('active');
  tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  renderAll();
}
tabButtons.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

// ---------- Init ----------
function renderAll() {
  renderHome();
  renderPersonCards();
  if (tabs.settings.classList.contains('active')) renderSettings();
}

function initActions() {
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addItem(btn.dataset.add));
  });
  document.getElementById('export-json').addEventListener('click', exportJSON);
  document.getElementById('import-json').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('reset-demo').addEventListener('click', resetDemo);
}

initActions();
renderAll();