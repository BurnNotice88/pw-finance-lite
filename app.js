// Minimal store using localStorage
const DEFAULTS = {
  currency: "CHF",
  wallace: {
    income: [
      { label: "Lohn", amount: 5200.00 },
      { label: "Nebenjob", amount: 350.00 }
    ],
    expenses: [
      { label: "Miete", amount: 1500.00 },
      { label: "Versicherungen", amount: 220.00 },
      { label: "ÖV/Auto", amount: 120.00 },
      { label: "Lebensmittel", amount: 520.00 }
    ]
  },
  patricia: {
    income: [
      { label: "Lohn", amount: 4800.00 },
      { label: "Salon-Bonus", amount: 400.00 }
    ],
    expenses: [
      { label: "Miete", amount: 1400.00 },
      { label: "Versicherungen", amount: 210.00 },
      { label: "Lebensmittel", amount: 500.00 },
      { label: "ÖV/Auto", amount: 110.00 }
    ]
  }
};

const KEY = "pw_finance_lite_settings";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : structuredClone(DEFAULTS);
  } catch {
    return structuredClone(DEFAULTS);
  }
}
function save(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

function chf(n){ return (Number(n)||0).toLocaleString("de-CH", {minimumFractionDigits:2, maximumFractionDigits:2}) + " CHF"; }

function sum(list){ return list.reduce((a,b)=>a+(Number(b.amount)||0),0); }

function totals(block){
  const inc = sum(block.income);
  const exp = sum(block.expenses);
  return {inc, exp, bal: inc-exp};
}

function renderOverview(cfg){
  const w = totals(cfg.wallace);
  const p = totals(cfg.patricia);
  const g = { inc: w.inc+p.inc, exp: w.exp+p.exp, bal: (w.inc+p.inc)-(w.exp+p.exp) };
  return `
  <h1>Overview</h1>
  <div class="grid-3">
    <div class="card">
      <h3>Wallace</h3>
      <div class="row"><span>Einnahmen</span><b>${chf(w.inc)}</b></div>
      <div class="row"><span>Ausgaben</span><b>${chf(w.exp)}</b></div>
      <div class="row total ${w.bal>=0?"pos":"neg"}"><span>Bilanz</span><b>${chf(w.bal)}</b></div>
    </div>
    <div class="card">
      <h3>Patricia</h3>
      <div class="row"><span>Einnahmen</span><b>${chf(p.inc)}</b></div>
      <div class="row"><span>Ausgaben</span><b>${chf(p.exp)}</b></div>
      <div class="row total ${p.bal>=0?"pos":"neg"}"><span>Bilanz</span><b>${chf(p.bal)}</b></div>
    </div>
    <div class="card">
      <h3>Gemeinsam</h3>
      <div class="row"><span>Einnahmen</span><b>${chf(g.inc)}</b></div>
      <div class="row"><span>Ausgaben</span><b>${chf(g.exp)}</b></div>
      <div class="row total ${g.bal>=0?"pos":"neg"}"><span>Bilanz</span><b>${chf(g.bal)}</b></div>
    </div>
  </div>`;
}

function renderPerson(name, data){
  const rows = (list)=> list.map(r=>`<tr><td>${r.label||"—"}</td><td class="num">${(Number(r.amount)||0).toFixed(2)}</td></tr>`).join("");
  return `
    <h1>${name}</h1>
    <div class="two-col">
      <div class="card">
        <h3>Einnahmen</h3>
        <table>
          <thead><tr><th>Beschreibung</th><th class="num">Betrag (CHF)</th></tr></thead>
          <tbody>${rows(data.income)}</tbody>
        </table>
      </div>
      <div class="card">
        <h3>Ausgaben</h3>
        <table>
          <thead><tr><th>Beschreibung</th><th class="num">Betrag (CHF)</th></tr></thead>
          <tbody>${rows(data.expenses)}</tbody>
        </table>
      </div>
    </div>`;
}

function renderSettings(cfg){
  function block(prefix, arr){
    const rows = arr.map((r,i)=>`
      <div class="form-row">
        <input type="text" name="${prefix}_label" value="${r.label||""}" placeholder="Bezeichnung">
        <input type="number" step="0.01" name="${prefix}_amount" value="${(Number(r.amount)||0).toFixed(2)}" placeholder="Betrag (CHF)">
      </div>`).join("");
    const addRows = Array.from({length:2}).map(()=>`
      <div class="form-row">
        <input type="text" name="${prefix}_label" placeholder="Bezeichnung">
        <input type="number" step="0.01" name="${prefix}_amount" placeholder="Betrag (CHF)">
      </div>`).join("");
    return rows + addRows;
  }
  return `
  <h1>Einstellungen</h1>
  <div class="flash"><div class="msg" id="saveMsg" style="display:none">Gespeichert.</div></div>
  <form class="card form" id="settingsForm">
    <h3>Wallace</h3>
    <div class="flex">
      <div>
        <h4>Einnahmen</h4>
        <div class="rows">${block("w_income", cfg.wallace.income)}</div>
      </div>
      <div>
        <h4>Ausgaben</h4>
        <div class="rows">${block("w_expenses", cfg.wallace.expenses)}</div>
      </div>
    </div>
    <h3>Patricia</h3>
    <div class="flex">
      <div>
        <h4>Einnahmen</h4>
        <div class="rows">${block("p_income", cfg.patricia.income)}</div>
      </div>
      <div>
        <h4>Ausgaben</h4>
        <div class="rows">${block("p_expenses", cfg.patricia.expenses)}</div>
      </div>
    </div>
    <div class="actions"><button type="submit">Speichern</button></div>
  </form>`;
}

function collectRows(section){
  const labels = Array.from(section.querySelectorAll('input[name$="_label"]')).map(i=>i.value.trim());
  const amounts = Array.from(section.querySelectorAll('input[name$="_amount"]')).map(i=>Number(i.value.replace(",", "."))||0);
  const rows = [];
  for(let i=0;i<labels.length;i++){
    if(!labels[i] && !amounts[i]) continue;
    rows.push({label: labels[i] || "—", amount: amounts[i]});
  }
  return rows;
}

function mount(){
  const cfg = load();
  // Initial render
  document.querySelector("#view-overview").innerHTML = renderOverview(cfg);
  document.querySelector("#view-wallace").innerHTML = renderPerson("Wallace", cfg.wallace);
  document.querySelector("#view-patricia").innerHTML = renderPerson("Patricia", cfg.patricia);
  const combined = { income:[...cfg.wallace.income, ...cfg.patricia.income], expenses:[...cfg.wallace.expenses, ...cfg.patricia.expenses] };
  document.querySelector("#view-gemeinsam").innerHTML = renderPerson("Gemeinsam", combined);
  document.querySelector("#view-einstellungen").innerHTML = renderSettings(cfg);

  // Save handler
  const form = document.querySelector("#settingsForm");
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const root = form;
    const next = {
      currency: "CHF",
      wallace: { 
        income: collectRows(root.querySelector(".rows:nth-of-type(1)")),
        expenses: collectRows(root.querySelector(".rows:nth-of-type(2)"))
      },
      patricia: {
        income: collectRows(root.querySelectorAll(".rows")[2]),
        expenses: collectRows(root.querySelectorAll(".rows")[3])
      }
    };
    save(next);
    // Re-render quick
    document.querySelector("#view-overview").innerHTML = renderOverview(next);
    document.querySelector("#view-wallace").innerHTML = renderPerson("Wallace", next.wallace);
    document.querySelector("#view-patricia").innerHTML = renderPerson("Patricia", next.patricia);
    const comb2 = { income:[...next.wallace.income, ...next.patricia.income], expenses:[...next.wallace.expenses, ...next.patricia.expenses] };
    document.querySelector("#view-gemeinsam").innerHTML = renderPerson("Gemeinsam", comb2);
    const msg = document.querySelector("#saveMsg"); msg.style.display="block"; setTimeout(()=>msg.style.display="none", 1500);
  });

  // Router
  document.querySelectorAll(".sidebar nav a").forEach(a=>{
    a.addEventListener("click", ()=>{
      document.querySelectorAll(".sidebar nav a").forEach(x=>x.classList.remove("active"));
      a.classList.add("active");
      const route = a.dataset.route;
      document.querySelectorAll(".view").forEach(v=>v.hidden=true);
      document.querySelector("#view-"+route).hidden = false;
      window.scrollTo({top:0, behavior:"instant"});
    });
  });
}

document.addEventListener("DOMContentLoaded", mount);
