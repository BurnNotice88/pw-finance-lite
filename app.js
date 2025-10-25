 // Einfache Tab-Steuerung, kein Blau, kein Scroll-Sprung
(function () {
  const tabs = document.querySelectorAll(".tabbar .tab");
  const views = {
    home: document.getElementById("view-home"),
    wallace: document.getElementById("view-wallace"),
    patricia: document.getElementById("view-patricia"),
    gemeinsam: document.getElementById("view-gemeinsam"),
    settings: document.getElementById("view-settings"),
  };

  function activate(targetKey) {
    // Tabs
    tabs.forEach(t => {
      const isActive = t.dataset.target === targetKey;
      t.classList.toggle("tab--active", isActive);
      t.setAttribute("aria-selected", String(isActive));
    });
    // Views
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle("view--active", key === targetKey);
    });
    // nicht nach oben scrollen bei Tap
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      activate(btn.dataset.target);
    }, { passive: true });
  });

  // Startansicht
  activate("home");
})();