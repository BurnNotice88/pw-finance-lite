// ==== Daten + Utils ====
const DEFAULTS = {
  currency: "CHF",
  wallace: {
    income: [{label:"Lohn",amount:5200},{label:"Nebenjob",amount:350}],
    expenses:[{label:"Miete",amount:1500},{label:"Versicherungen",amount:220},{label:"ÖV/Auto",amount:120},{label:"Lebensmittel",amount:520}]
  },
  patricia: {
    income: [{label:"Lohn",amount:4800},{label:"Salon-Bonus",amount:400}],
    expenses:[{label:"Miete",amount:1400},{label:"Versicherungen",amount:210},{label:"Lebensmittel",amount:500},{label:"ÖV/Auto",amount:110}]
  }
};
const KEY = "pw_finance_lite_settings";
const load = () => JSON.parse(localStorage.getItem(KEY) || JSON.stringify(DEFAULTS));
const save = (cfg) => localStorage.setItem(KEY, JSON.stringify(cfg));
const chf = n => (Number(n)||0).toLocaleString("de-CH",{minimumFractionDigits:2,maximumFractionDigits:2})+" CHF";
const sum = list => list.reduce((a,b)=>a+(Number(b.amount)||0),0);
const totals = b => ({inc:sum(b.income), exp:sum(b.expenses), bal:sum(b.income)-sum(b.expenses)});

// ==== Render ====
function renderOverview(cfg){
  const w = totals(cfg.wallace), p = totals(cfg.patricia);
  const g = {inc:w.inc+p.inc, exp:w.exp+p.exp, bal:(w.inc+p.inc)-(w.exp+p.exp)};
  return `
  <h1>Übersicht</h1>
  <div class="grid-3">
    <div class="card">
      <div class="row"><span><b>Wallace</b> – Einnahmen</span><b>${chf(w.inc)}</b></div>
      <div class="row"><span>Ausgaben</span><b>${chf(w.exp)}</b></div>
      <div class="row total ${w.bal>=0?"pos":"neg"}"><span>Bilanz</span><b>${chf(w.bal)}</b></div>
    </div>
    <div class="card">
      <div class="row"><span><b>Patricia</b> – Einnahmen</span><b>${chf(p.inc)}</b></div>
      <div class="row"><span>Ausgaben</span><b>${chf(p.exp)}</b></div>
      <div class="row total ${p.bal>=0?"pos":"neg"}"><span>Bilanz</span><b>${chf(p.bal)}</b></div>
    </div>
    <div class="card">
      <div class="row"><span><b>Gemeinsam</b> – Einnahmen</span><b>${chf(g.inc)}</b></div>
      <div class="row"><span>Ausgaben</span><b>${chf(g.exp)}</b></div>
      <div class="row total ${g.bal>=0?"pos":"neg"}"><span>Bilanz</span><b>${chf(g.bal)}</b></div>
    </div>
  </div>`;
}

function renderPerson(name, data){
  const rows = list => list.map(r=>`<tr><td>${r.label||"—"}</td><td class="num">${(Number(r.amount)||0).toFixed(2)}</td></tr>`).join("");
  return `
  <h1>${name}</h1>
  <div class="two-col">
    <div class="card">
      <table>
        <thead><tr><th>Einnahmen</th><th class="num">Betrag (CHF)</th></tr></thead>
        <tbody>${rows(data.income)}</tbody>
      </table>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Ausgaben</th><th class="num">Betrag (CHF)</th></tr></thead>
        <tbody>${rows(data.expenses)}</tbody>
      </table>
    </div>
  </div>`;
}

function renderSettings(cfg){
  const row = (p,lbl,amt)=>`
    <div class="form-row">
      <input type="text"  name="${p}_label"  value="${lbl||""}" placeholder="Bezeichnung">
      <input type="number" step="0.01" name="${p}_amount" value="${amt!==""?(Number(amt)||0).toFixed(2):""}" placeholder="Betrag (CHF)">
    </div>`;
  const block = (prefix, arr)=>[...arr.map(r=>row(prefix,r.label,r.amount)), row(prefix,"",""), row(prefix,"","")].join("");
  return `
  <h1>Einstellungen</h1>
  <div class="flash"><div class="msg" id="saveMsg" style="display:none">Gespeichert.</div></div>
  <form class="card form" id="settingsForm">
    <h3>Wallace</h3>
    <div class="flex">
      <div><h4>Einnahmen</h4><div class="rows" id="rows_w_income">${block("w_income", cfg.wallace.income)}</div></div>
      <div><h4>Ausgaben</h4><div class="rows" id="rows_w_expenses">${block("w_expenses", cfg.wallace.expenses)}</div></div>
    </div>
    <h3>Patricia</h3>
    <div class="flex">
      <div><h4>Einnahmen</h4><div class="rows" id="rows_p_income">${block("p_income", cfg.patricia.income)}</div></div>
      <div><h4>Ausgaben</h4><div class="rows" id="rows_p_expenses">${block("p_expenses", cfg.patricia.expenses)}</div></div>
    </div>
    <div class="actions"><button type="submit">Speichern</button></div>
  </form>`;
}

function collectRows(container){
  const labels  = [...container.querySelectorAll('input[name$="_label"]')].map(i=>i.value.trim());
  const amounts = [...container.querySelectorAll('input[name$="_amount"]')].map(i=>Number((i.value||"").replace(",", "."))||0);
  const out=[]; for(let i=0;i<labels.length;i++){ if(!labels[i] && !amounts[i]) continue; out.push({label:labels[i]||"—", amount:amounts[i]}); }
  return out;
}

// ==== App Mount + Tabs ====
function mount(){
  let cfg = load();

  const renderAll = ()=>{
    document.querySelector("#view-overview").innerHTML = renderOverview(cfg);
    document.querySelector("#view-wallace").innerHTML = renderPerson("Wallace", cfg.wallace);
    document.querySelector("#view-patricia").innerHTML = renderPerson("Patricia", cfg.patricia);
    document.querySelector("#view-gemeinsam").innerHTML = renderPerson("Gemeinsam", {
      income:[...cfg.wallace.income, ...cfg.patricia.income],
      expenses:[...cfg.wallace.expenses, ...cfg.patricia.expenses]
    });
    document.querySelector("#view-einstellungen").innerHTML = renderSettings(cfg);

    // Save-Handler neu binden
    const form = document.querySelector("#settingsForm");
    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const next = {
        currency:"CHF",
        wallace:{
          income:  collectRows(document.getElementById("rows_w_income")),
          expenses:collectRows(document.getElementById("rows_w_expenses"))
        },
        patricia:{
          income:  collectRows(document.getElementById("rows_p_income")),
          expenses:collectRows(document.getElementById("rows_p_expenses"))
        }
      };
      save(next); cfg = next; renderAll();
      const msg = document.getElementById("saveMsg"); if(msg){ msg.style.display="block"; setTimeout(()=>msg.style.display="none",1200); }
    }, {once:true});
  };

  renderAll();

  const buttons = document.querySelectorAll(".tabs button");
  const show = route=>{
    buttons.forEach(b=>b.classList.toggle("active", b.dataset.route===route));
    document.querySelectorAll(".view").forEach(v=>v.hidden=true);
    document.querySelector("#view-"+route).hidden=false;
    window.scrollTo({top:0, behavior:"instant"});
  };
  buttons.forEach(b=>b.addEventListener("click", ()=>show(b.dataset.route)));
  show("overview");
}
document.addEventListener("DOMContentLoaded", mount);