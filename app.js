// --- Monat steuern (Anzeige rot & zentriert durch CSS) ---
const monthDisplay = document.getElementById('monthDisplay');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let active = getStartMonth();
renderMonth();

prevBtn.addEventListener('click', () => { active = addMonths(active, -1); renderMonth(); });
nextBtn.addEventListener('click', () => { active = addMonths(active, +1); renderMonth(); });

function renderMonth(){
  monthDisplay.textContent = formatMonth(active);
  // hier später: Werte für den Monat laden/aktualisieren
}

// Start = heutiger Monat
function getStartMonth(){
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(date, diff){
  return new Date(date.getFullYear(), date.getMonth() + diff, 1);
}
function formatMonth(date){
  return date.toLocaleDateString('de-CH', { month:'long', year:'numeric' });
}

// Dummy-Werte befüllen (Platzhalter, damit UI gefüllt ist)
const fmt = v => 'CHF ' + (v).toLocaleString('de-CH', {minimumFractionDigits:2, maximumFractionDigits:2});
document.getElementById('sumGesamt').textContent = fmt(0);
document.getElementById('wIn').textContent = fmt(0);
document.getElementById('wOut').textContent = fmt(0);
document.getElementById('wBal').textContent = fmt(0);
document.getElementById('pIn').textContent = fmt(0);
document.getElementById('pOut').textContent = fmt(0);
document.getElementById('pBal').textContent = fmt(0);
document.getElementById('gIn').textContent = fmt(0);
document.getElementById('gOut').textContent = fmt(0);
document.getElementById('gBal').textContent = fmt(0);
document.getElementById('wDebt').textContent = fmt(0);
document.getElementById('pDebt').textContent = fmt(0);

// Tabs (optisch aktiv, Navigation-Logik kannst du später ergänzen)
document.querySelectorAll('.tabbar .tab').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('.tabbar .tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
  });
});