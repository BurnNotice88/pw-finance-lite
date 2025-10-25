/* -------------------------------
   Monat steuern (zentriert/rot im CSS)
----------------------------------*/
const monthLabel = document.getElementById('monthLabel');
const prevBtn = document.getElementById('monthPrev');
const nextBtn = document.getElementById('monthNext');

let current = new Date(); // aktuelles Datum

function formatMonth(d){
  // z.B. "Oktober 2025"
  return d.toLocaleDateString('de-CH', { month:'long', year:'numeric' });
}
function updateMonthLabel(){
  monthLabel.textContent = formatMonth(current);
}
prevBtn.addEventListener('click', ()=>{
  current.setMonth(current.getMonth()-1);
  updateMonthLabel();
});
nextBtn.addEventListener('click', ()=>{
  current.setMonth(current.getMonth()+1);
  updateMonthLabel();
});
updateMonthLabel();

/* -------------------------------
   Bottom-Navigation (Tabs)
----------------------------------*/
const tabs = document.querySelectorAll('.tabbar .tab');
const views = document.querySelectorAll('.view');

tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    // Active Tab
    tabs.forEach(t=>t.classList.remove('tab--active'));
    tab.classList.add('tab--active');

    // View umschalten
    const id = tab.dataset.target;
    views.forEach(v=>v.classList.remove('view--active'));
    document.getElementById(id).classList.add('view--active');

    // Scroll an den Anfang der Seite (Inhalt), Tabbar bleibt sichtbar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, { passive:true });
});