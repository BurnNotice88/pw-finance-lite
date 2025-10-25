/* ---------- Hilfs-Toast, blockiert keine Klicks ---------- */
const toastEl = document.getElementById('toast');
function showToast(msg, ms=2500){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toastEl.classList.remove('show'), ms);
}

/* ---------- Tab-Logik ---------- */
const tabs = Array.from(document.querySelectorAll('.tabbar .tab'));
const screens = new Map(Array.from(document.querySelectorAll('.screen')).map(s=>[s.id,s]));

function activate(targetId){
  // Screens toggeln
  screens.forEach((el,id)=> el.classList.toggle('active', id===targetId));
  // Tabs markieren
  tabs.forEach(btn=>{
    const on = btn.dataset.target===targetId;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on ? 'true':'false');
  });
  // optional: URL-Hash (Back-Button)
  history.replaceState({}, '', `#${targetId}`);
}

tabs.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    // Buttons – kein preventDefault nötig, aber sicherheitshalber:
    e.preventDefault?.();
    const id = btn.dataset.target;
    if(!screens.has(id)){ showToast('Unbekannte Ansicht'); return; }
    activate(id);
  }, {passive:true});
});

// Start mit Hash (wenn vorhanden)
const first = location.hash?.replace('#','') || 'screen-home';
activate(screens.has(first) ? first : 'screen-home');

/* ---------- Typische Fallen entschärfen ---------- */
// Falls irgendwo „Verbergen“ über visibility/opacity gemacht wurde:
document.querySelectorAll('[hidden]').forEach(n=>n.style.display='none');

// Globaler JS-Error -> oben sichtbar machen, bricht sonst Klick-Handler
window.addEventListener('error', ev => showToast(`Fehler: ${ev.message}`));
window.addEventListener('unhandledrejection', ev => showToast(`Fehler: ${ev.reason?.message||ev.reason}`));