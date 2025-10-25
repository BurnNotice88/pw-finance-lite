/* Einfaches State-Handling für Tabs + Monatsauswahl.
   Bestehende Daten/Logik bleiben unberührt – hier nur Anzeige. */

// ===== Monatslogik =====
const monthLabel = document.getElementById('monthLabel');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let current = new Date(); // heute als Start

function formatMonth(d){
  // Deutsch, z.B. "Oktober 2025"
  return d.toLocaleDateString('de-CH', { month:'long', year:'numeric' });
}

function updateMonthLabel(){
  monthLabel.textContent = capitalize(formatMonth(current));
}

function shiftMonth(delta){
  current.setMonth(current.getMonth() + delta);
  updateMonthLabel();
  // <- hier ggf. Re-Load der Monatsdaten triggern
}

prevBtn.addEventListener('click', () => shiftMonth(-1));
nextBtn.addEventListener('click', () => shiftMonth(1));
updateMonthLabel();

function capitalize(s){
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===== Tabs =====
const tabs = document.querySelectorAll('.tabbar .tab');
const views = document.querySelectorAll('.view');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target; // "home", "wallace", ...

    // Tabs markieren
    tabs.forEach(b => b.classList.toggle('active', b === btn));

    // Views schalten
    views.forEach(v => v.classList.toggle('active', v.id === `view-${target}`));

    // Optional: Scroll-Reset auf View-Start
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ===== Dummy-Zahlen (bleiben 0.00 bis echte Daten kommen) =====
// Falls du hier Summen setzen willst, nutze setAmounts(...)
function setAmounts({ wInc=0, wExp=0, pInc=0, pExp=0, gInc=0, gExp=0 } = {}){
  const fmt = n => `CHF ${n.toLocaleString('de-CH', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  const set = (id,val) => { const el = document.getElementById(id); if(el) el.textContent = fmt(val); };

  set('wInc', wInc); set('wExp', wExp); set('wBal', wInc - wExp);
  set('pInc', pInc); set('pExp', pExp); set('pBal', pInc - pExp);
  set('gInc', gInc); set('gExp', gExp); set('gBal', gInc - gExp);

  const total = (wInc - wExp) + (pInc - pExp) + (gInc - gExp);
  const sum = document.getElementById('sumBalance');
  if(sum){
    sum.textContent = fmt(total);
    sum.classList.toggle('pos', total >= 0);
    sum.classList.toggle('neg', total < 0);
  }
}

// Beispielaufruf (kannst du löschen)
setAmounts({ wInc:0, wExp:0, pInc:0, pExp:0, gInc:0, gExp:0 });