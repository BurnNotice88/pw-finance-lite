// ---------- Utilities ----------
const CHF = n => {
  const v = Number(n || 0);
  return v.toLocaleString("de-CH", { style:"currency", currency:"CHF", maximumFractionDigits:2 });
};
const sum = arr => (arr || []).reduce((a, x) => a + (Number(x.value)||0), 0);

// ---------- Data (localStorage) ----------
const LS_KEY = "fainance-data-v1";
const DEFAULT_DATA = {
  wallace: {
    income:  [{ name:"Lohn", value: 5550 }, { name:"Nebenjob", value: 0 }],
    expense: [{ name:"Miete", value: 1350 }, { name:"Versicherungen", value: 1000 }],
  },
  patricia: {
    income:  [{ name:"Lohn", value: 5200 }, { name:"Salon-Bonus", value: 400 }],
    expense: [{ name:"Miete", value: 1400 }, { name:"Versicherungen", value: 210 }],
  },
  joint: {
    income:  [{ name:"Nebeneinkünfte", value: 500 }],
    expense: [{ name:"Haushalt", value: 500 }],
  }
};

let data = load();
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : structuredClone(DEFAULT_DATA);
  }catch(_){
    return structuredClone(DEFAULT_DATA);
  }
}
function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  renderAll();
}

// ---------- Navigation ----------
const views = document.querySelectorAll(".view");
const tabs = document.querySelectorAll(".tabbar .tab");
tabs.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    tabs.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    const id = btn.dataset.target;
    views.forEach(v=>v.classList.toggle("active", v.id===id));
  });
});

// ---------- Rendering ----------
function renderSummary(){
  const wI = sum(data.wallace.income),  wE = sum(data.wallace.expense);
  const pI = sum(data.patricia.income), pE = sum(data.patricia.expense);
  const jI = sum(data.joint.income),    jE = sum(data.joint.expense);

  // Home
  setText("sum-w-income", CHF(wI));
  setText("sum-w-expense", CHF(wE));
  setText("sum-w-balance", CHF(wI-wE));
  setText("sum-p-income", CHF(pI));
  setText("sum-p-expense", CHF(pE));
  setText("sum-p-balance", CHF(pI-pE));
  setText("sum-j-income", CHF(jI));
  setText("sum-j-expense", CHF(jE));
  setText("sum-j-balance", CHF(jI-jE));

  // Personenseiten
  setText("w-income", CHF(wI));    setText("w-expense", CHF(wE));    setText("w-balance", CHF(wI-wE));
  setText("p-income", CHF(pI));    setText("p-expense", CHF(pE));    setText("p-balance", CHF(pI-pE));
  setText("j-income", CHF(jI));    setText("j-expense", CHF(jE));    setText("j-balance", CHF(jI-jE));
}
function setText(id, text){ const el = document.getElementById(id); if(el) el.textContent = text; }

function loadFormValues(){
  document.querySelectorAll("#form-settings [data-path]").forEach(input=>{
    const val = getByPath(data, input.dataset.path);
    input.value = isMoneyField(input) ? money(val) : (val?.toString() ?? "");
  });
}
const isMoneyField = (el)=> /\.\w+value\]?$/.test(el.dataset.path);
const money = v => (Number(v||0)).toString();

function getByPath(obj, path){
  // e.g. "wallace.income[0].value"
  return path.split('.').reduce((acc, part)=>{
    const m = part.match(/^(\w+)\[(\d+)\]$/);
    if(m){ acc = acc?.[m[1]]?.[Number(m[2])]; }
    else  { acc = acc?.[part]; }
    return acc;
  }, obj);
}
function setByPath(obj, path, value){
  const parts = path.split('.');
  let cur = obj;
  for(let i=0;i<parts.length;i++){
    const m = parts[i].match(/^(\w+)\[(\d+)\]$/);
    if(i === parts.length-1){
      if(m) cur[m[1]][Number(m[2])] = value;
      else  cur[parts[i]] = value;
    }else{
      if(m){ cur = cur[m[1]][Number(m[2])]; }
      else  { cur = cur[parts[i]]; }
    }
  }
}

// ---------- Form logic (NO auto save) ----------
const form = document.getElementById("form-settings");
form.addEventListener("submit", (e)=>{
  e.preventDefault();

  // Build a draft copy from current inputs
  const draft = structuredClone(data);
  document.querySelectorAll("#form-settings [data-path]").forEach(input=>{
    const raw = input.value.trim();
    const path = input.dataset.path;
    // Decide whether it's a name or a numeric value
    if(isMoneyField(input)){
      const n = Number(raw.replace(/[^0-9.,-]/g,"").replace(',','.'));
      // find holding object and set its value, preserving name
      const holder = getByPath(draft, path.replace(/\.value$/,''));
      setByPath(draft, path.replace(/\.value$/,''), { ...holder, value: isFinite(n)? n : 0 });
    }else{
      const holder = getByPath(draft, path.replace(/\.name$/,''));
      setByPath(draft, path.replace(/\.name$/,''), { ...holder, name: raw });
    }
  });

  data = draft;
  save();
  alert("Gespeichert.");
});

// Reset (lädt aktuelle gespeicherte Werte erneut ins Formular)
document.getElementById("btn-cancel").addEventListener("click", ()=>{
  loadFormValues();
});

// Verhindere Autospeichern / Blur-Aktion -> nichts
document.querySelectorAll("#form-settings input").forEach(inp=>{
  inp.addEventListener("input", ()=>{/* live nichts speichern */});
  inp.addEventListener("change", ()=>{/* nichts */});
  inp.addEventListener("blur", ()=>{/* nichts */});
});

// ---------- Initial ----------
function renderAll(){
  renderSummary();
}
renderAll();
loadFormValues();