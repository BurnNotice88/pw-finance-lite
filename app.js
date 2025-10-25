/* --------------------------
   Tab-Navigation (ohne Libs)
---------------------------*/
(function () {
  const tabs = Array.from(document.querySelectorAll('.tabbar .tab'));
  const views = {
    home: document.getElementById('view-home'),
    wallace: document.getElementById('view-wallace'),
    patricia: document.getElementById('view-patricia'),
    gemeinsam: document.getElementById('view-gemeinsam'),
    mehr: document.getElementById('view-mehr'),
  };

  function show(target) {
    Object.values(views).forEach(v => v.classList.remove('is-active'));
    (views[target] || views.home).classList.add('is-active');
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.target === target));
    try { localStorage.setItem('lastTab', target); } catch {}
  }

  tabs.forEach(btn => btn.addEventListener('click', () => show(btn.dataset.target)));

  let initial = 'home';
  try {
    const saved = localStorage.getItem('lastTab');
    if (saved && views[saved]) initial = saved;
  } catch {}
  show(initial);

  // Logo pre-laden (hilft bei Pages-Cache)
  const logo = new Image();
  logo.src = './logo-fainance.png';
})();

/* ------------------------------------
   Kleines, schnelles Balkendiagramm
   - keine externe Library
   - responsive via DPR
-------------------------------------*/
(function () {
  const canvas = document.getElementById('chart-balance');
  if (!canvas) return;

  // Beispiel-Daten (Monat, Bilanz in CHF)
  const data = [
    { label: 'Jan', value: 4800 },
    { label: 'Feb', value: 5150 },
    { label: 'Mär', value: 4970 },
    { label: 'Apr', value: 5580 },
    { label: 'Mai', value: 6170 }, // entspricht deiner Übersicht
    { label: 'Jun', value: 5920 },
  ];

  const styles = {
    grid: '#eef1f3',
    text: '#667085',
    bar: '#e23c2f',           // FAINANCE Rot
    barShadow: 'rgba(226,60,47,.18)',
    axis: '#cfd7de',
  };

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Innenabstände
    const P = { top: 12, right: 10, bottom: 28, left: 36 };
    const W = cssW - P.left - P.right;
    const H = cssH - P.top - P.bottom;

    // Skala bestimmen
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
    const yTicks = 4;

    // Grid + Y-Achse
    ctx.strokeStyle = styles.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= yTicks; i++) {
      const y = P.top + (H / yTicks) * i;
      ctx.beginPath();
      ctx.moveTo(P.left, y);
      ctx.lineTo(cssW - P.right, y);
      ctx.stroke();

      // Tick-Label
      const v = Math.round(maxVal * (1 - i / yTicks));
      ctx.fillStyle = styles.text;
      ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(v.toLocaleString('de-CH'), P.left - 6, y);
    }

    // Balken berechnen
    const count = data.length;
    const gap = 10; // Abstand zwischen Bars (CSS-Pixel)
    const barW = Math.max(8, (W - (count - 1) * gap) / count);

    // Bars
    data.forEach((d, i) => {
      const x = P.left + i * (barW + gap);
      const h = (d.value / maxVal) * H;
      const y = P.top + (H - h);

      // Schatten
      ctx.fillStyle = styles.barShadow;
      ctx.fillRect(x, y + 2, barW, h);

      // Balken
      ctx.fillStyle = styles.bar;
      ctx.fillRect(x, y, barW, h);

      // Label (X)
      ctx.fillStyle = styles.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(d.label, x + barW / 2, cssH - 8);
    });
  }

  draw();
  window.addEventListener('resize', draw, { passive: true });
})();