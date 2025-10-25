// ----- Minimaler State (kannst du später aus Firebase/LocalStorage laden) -----
const defaults = {
  wallace: { income: 5550, expenses: 2360 },
  patricia: { income: 5200, expenses: 2220 },
  gemeinsam: { income: 10750, expenses: 4580 }
};

function getState() {
  try {
    const raw = localStorage.getItem('budgetState');
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    // Defaults mergen, falls etwas fehlt
    return {
      wallace: { ...defaults.wallace, ...(parsed.wallace||{}) },
      patricia:{ ...defaults.patricia, ...(parsed.patricia||{}) },
      gemeinsam:{ ...defaults.gemeinsam, ...(parsed.gemeinsam||{}) }
    };
  } catch {
    return defaults;
  }
}

function chf(n){
  return n.toLocaleString('de-CH', { style:'currency', currency:'CHF' });
}

function sectionCard(title, rows){
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <div class="row"><strong>${title}</strong><span></span></div>
    ${rows.map(r => `
      <div class="row">
        <span>${r.label}</span>
        <span class="amount ${r.cls||''}">${r.value}</span>
      </div>`).join('')}
  `;
  return div;
}

function renderHome(state){
  const box = document.getElementById('home-cards');
  box.innerHTML = '';
  const wBal = state.wallace.income - state.wallace.expenses;
  const pBal = state.patricia.income - state.patricia.expenses;
  const gBal = state.gemeinsam.income - state.gemeinsam.expenses;

  box.append(
    sectionCard('Wallace', [
      { label:'Einnahmen', value: chf(state.wallace.income) },
      { label:'Ausgaben', value: chf(state.wallace.expenses) },
      { label:'Bilanz', value: chf(wBal), cls: wBal>=0?'positive':'negative' }
    ]),
    sectionCard('Patricia', [
      { label:'Einnahmen', value: chf(state.patricia.income) },
      { label:'Ausgaben', value: chf(state.patricia.expenses) },
      { label:'Bilanz', value: chf(pBal), cls: pBal>=0?'positive':'negative' }
    ]),
    sectionCard('Gemeinsam', [
      { label:'Einnahmen', value: chf(state.gemeinsam.income) },
      { label:'Ausgaben', value: chf(state.gemeinsam.expenses) },
      { label:'Bilanz', value: chf(gBal), cls: gBal>=0?'positive':'negative' }
    ])
  );
}

function renderPerson(id, data, title){
  const box = document.getElementById(`${id}-cards`);
  box.innerHTML = '';
  const bal = data.income - data.expenses;
  box.append(
    sectionCard(title, [
      { label:'Einnahmen', value: chf(data.income) },
      { label:'Ausgaben', value: chf(data.expenses) },
      { label:'Bilanz', value: chf(bal), cls: bal>=0?'positive':'negative' }
    ])
  );
}

function renderAll(){
  const state = getState();
  renderHome(state);
  renderPerson('wallace', state.wallace, 'Wallace');
  renderPerson('patricia', state.patricia, 'Patricia');
  renderPerson('gemeinsam', state.gemeinsam, 'Gemeinsam');
}

// ----- Tabs steuern -----
function activate(target){
  // Tabs
  document.querySelectorAll('.tab').forEach(btn=>{
    const active = btn.dataset.target === target;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  // Views
  document.querySelectorAll('.view').forEach(v=>{
    v.classList.toggle('active', v.id === `view-${target}`);
  });
}

function initTabs(){
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      activate(btn.dataset.target);
    });
  });
  activate('home'); // Start auf Home
}

// ----- Start -----
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderAll();
});