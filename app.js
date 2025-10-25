/* Einfache Tab-Navigation (ohne Frameworks) */
const pages = {
  home: document.getElementById('page-home'),
  wallace: document.getElementById('page-wallace'),
  patricia: document.getElementById('page-patricia'),
  gemeinsam: document.getElementById('page-gemeinsam'),
  mehr: document.getElementById('page-mehr'),
};

const tabButtons = Array.from(document.querySelectorAll('.tabbar-btn'));

function showPage(name){
  // Seiten
  Object.values(pages).forEach(p => p.classList.remove('page--active'));
  (pages[name] ?? pages.home).classList.add('page--active');

  // Buttons
  tabButtons.forEach(b => b.classList.remove('tabbar-btn--active'));
  const activeBtn = tabButtons.find(b => b.dataset.target === name);
  if(activeBtn) activeBtn.classList.add('tabbar-btn--active');

  // Hash aktualisieren (optional)
  location.hash = name;
}

// Click-Events
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.target));
});

// Beim Laden: Hash berücksichtigen (z.B. …/#gemeinsam)
const start = location.hash.replace('#','');
if (start && pages[start]) showPage(start);

// Fallback für fehlendes Logo: falls Bild nicht geladen wird, nur Schriftzug zeigen
window.addEventListener('load', () => {
  const img = document.querySelector('.brand-logo');
  if(!img) return;
  img.addEventListener('error', () => {
    img.style.display = 'none';
  });
});