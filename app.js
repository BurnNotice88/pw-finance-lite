/* ===========================
   FAINANCE – Basis-App (ohne Cloud)
   - Tabs & Views
   - State mit localStorage
   - Übersicht + Zusammenfassungen
   - Zentrale Bearbeitung in "Mehr"
   - Export/Import
   - Kleiner Canvas-Balken-Chart (Demo)
=========================== */

// ---- Utility
const $  = (sel) => document.querySelector(sel);
const CHF = (n) => Number(n||0).toLocaleString('de-CH',{style:'currency',currency:'CHF'});

// ---- Tabs / Views
(function initTabs(){
  const tabs = Array.from(document.querySelectorAll('.tabbar .tab'));
  const views = {
    home:      $('#view-home'),
    wallace:   $('#view-wallace'),
    patricia:  $('#view-patricia'),
    gemeinsam: $('#view-gemeinsam'),
    mehr:      $('#view-mehr'),
  };

  function show(name){
    Object.values(views).forEach(v=>v.classList.remove('is-active'));
    (views[name]||views.home).classList.add('is-active');
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.target===name));
    try{ localStorage.setItem('fainance:lastTab', name); }catch{}
    window.scrollTo({top:0,behavior:'instant'});
  }

  tabs.forEach(btn => btn.addEventListener('click', ()=> show(btn.dataset.target)));

  let start = 'home';
  try {
    const saved = localStorage.getItem('fainance:lastTab');
    if (saved && views[saved]) start = saved;
  } catch {}
  show(start);

  // Expose for later usage if needed
  window.__show = show;
})();

// ---- State (mit Defaults) + Storage
const DEFAULT_STATE = {
  wallace:   { income: 5550, expense: 2360 },
  patricia:  { income: 5200, expense: 2220 },
  gemeinsam: { income: 10750, expense: 4580 }
};

function loadState(){
  try{
    const raw = localStorage.getItem('fainance:state');
    if(!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // merge defaults (falls keys fehlen)
    return {
      wallace:   { ...DEFAULT_STATE.wallace,   ...(parsed.wallace||{}) },
      patricia:  { ...DEFAULT_STATE.patricia,  ...(parsed.patricia||{}) },
      gemeinsam: { ...DEFAULT_STATE.gemeinsam, ...(parsed.gemeinsam||{}) },
    };
  }catch{
    return structuredClone(DEFAULT_STATE);
  }
}
function saveState(s){
  try{ localStorage.setItem('fainance:state', JSON.stringify(s)); }catch{}
}
let STATE = loadState();

// ---- Rendering
function sectionCard(title, obj){
  const bal = Number(obj.income||0) - Number(obj.expense||0);
  const cls = bal>=0 ? 'positive' : 'negative';
  return `
    <article class="card">
      <div class="row"><strong>${title}</strong><span>${CHF(obj.income)}</span></div>
      <div class="row"><span>Ausgaben</span><span>${CHF(obj.expense)}</span></div>
      <div class="row"><span>Bilanz</span><span class="${cls}">${CHF(bal)}</span></div>
    </article>
  `;
}

function renderHome(){
  $('#home-cards').innerHTML = [
    sectionCard('Wallace',   STATE.wallace),
    sectionCard('Patricia',  STATE.patricia),
    sectionCard('Gemeinsam', STATE.gemeinsam),
  ].join('');
}

function renderSummaries(){
  $('#w-summary').innerHTML = sectionCard('Wallace',   STATE.wallace);
  $('#p-summary').innerHTML = sectionCard('Patricia',  STATE.patricia);
  $('#g-summary').innerHTML = sectionCard('Gemeinsam', STATE.gemeinsam);
}

// ---- Mehr-Form (zentral)
function fillMehrForm(){
  $('#mw-income').value  = STATE.wallace.income;
  $('#mw-expense').value = STATE.wallace.expense;
  $('#mp-income').value  = STATE.patricia.income;
  $('#mp-expense').value = STATE.patricia.expense;
  $('#mg-income').value  = STATE.gemeinsam.income;
  $('#mg-expense').value = STATE.gemeinsam.expense;
}

function num(v){ const n = Number(String(v).replace(/[^0-9.\-]/g,'')); return isNaN(n)?0:n; }

$('#form-mehr').addEventListener('submit', (e)=>{
  e.preventDefault();
  STATE.wallace.income   = num($('#mw-income').value);
  STATE.wallace.expense  = num($('#mw-expense').value);
  STATE.patricia.income  = num($('#mp-income').value);
  STATE.patricia.expense = num($('#mp-expense').value);
  STATE.gemeinsam.income = num($('#mg-income').value);
  STATE.gemeinsam.expense= num($('#mg-expense').value);

  saveState(STATE);
  renderHome();
  renderSummaries();
  alert('Gespeichert.');
});

$('#btn-reset-defaults').addEventListener('click', ()=>{
  if(!confirm('Werte auf Standard zurücksetzen?')) return;
  STATE = structuredClone(DEFAULT_STATE);
  saveState(STATE);
  fillMehrForm();
  renderHome();
  renderSummaries();
});

// ---- Export / Import / Clear
$('#btn-export').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(STATE,null,2)], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'fainance-data.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
});

$('#btn-copy').addEventListener('click', async ()=>{
  const text = JSON.stringify(STATE);
  try{ await navigator.clipboard.writeText(text); alert('In Zwischenablage kopiert.'); }
  catch{ prompt('Kopieren mit Auswahl (manuell):', text); }
});

$('#btn-import').addEventListener('click', ()=>{
  const raw = document.getElementById('import-text').value.trim();
  if(!raw){ alert('Bitte JSON einfügen.'); return; }
  try{
    const incoming = JSON.parse(raw);
    STATE = {
      wallace:   { ...DEFAULT_STATE.wallace,   ...(incoming.wallace||{}) },
      patricia:  { ...DEFAULT_STATE.patricia,  ...(incoming.patricia||{}) },
      gemeinsam: { ...DEFAULT_STATE.gemeinsam, ...(incoming.gemeinsam||{}) },
    };
    saveState(STATE);
    fillMehrForm(); renderHome(); renderSummaries();
    alert('Import erfolgreich.');
  }catch(e){
    alert('Ungültiges JSON.');
  }
});

$('#btn-clear').addEventListener('click', ()=>{
  if(confirm('Alle lokalen Daten wirklich löschen?')) {
    try{ localStorage.removeItem('fainance:state'); }catch{}
    STATE = structuredClone(DEFAULT_STATE);
    fillMehrForm(); renderHome(); renderSummaries();
    alert('Zurückgesetzt.');
  }
});

// ---- Mini Balken-Chart (Beispiel)
(function initChart(){
  const canvas = document.getElementById('chart-balance');
  if(!canvas) return;

  const example = [
    { label:'Jan', value: 4800 },
    { label:'Feb', value: 5150 },
    { label:'Mär', value: 4970 },
    { label:'Apr', value: 5580 },
    { label:'Mai', value: 6170 },
    { label:'Jun', value: 5920 },
  ];

  function draw(){
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 300;
    const cssH = canvas.clientHeight || 220;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const P = { top: 12, right: 12, bottom: 28, left: 36 };
    const W = cssW - P.left - P.right;
    const H = cssH - P.top - P.bottom;

    const maxVal = Math.max(...example.map(d=>d.value)) * 1.1;
    const grid = 4;

    // Grid
    ctx.strokeStyle = '#e9eef2'; ctx.lineWidth = 1;
    for(let i=0;i<=grid;i++){
      const y = P.top + (H/grid)*i;
      ctx.beginPath(); ctx.moveTo(P.left, y); ctx.lineTo(cssW-P.right, y); ctx.stroke();
      const v = Math.round(maxVal * (1 - i/grid));
      ctx.fillStyle = '#667085'; ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(v.toLocaleString('de-CH'), P.left-6, y);
    }

    // Bars
    const n = example.length, gap = 10;
    const barW = Math.max(8, (W - (n-1)*gap)/n);
    example.forEach((d,i)=>{
      const x = P.left + i*(barW+gap);
      const h = (d.value/maxVal)*H;
      const y = P.top + (H - h);
      // shadow
      ctx.fillStyle = 'rgba(226,60,47,.18)'; ctx.fillRect(x, y+2, barW, h);
      // bar
      ctx.fillStyle = '#e23c2f'; ctx.fillRect(x, y, barW, h);
      // label
      ctx.fillStyle = '#667085'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(d.label, x + barW/2, cssH - 8);
    });
  }

  draw(); window.addEventListener('resize', draw, {passive:true});
})();

// ---- Initial render
renderHome();
renderSummaries();
fillMehrForm();