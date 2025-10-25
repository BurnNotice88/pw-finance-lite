/* FAINANCE – einfache View-Navigation (ohne Abhängigkeiten) */
(function () {
  // Tabs & Views
  const tabs  = Array.from(document.querySelectorAll(".tabbar .tab"));
  const views = Array.from(document.querySelectorAll(".view"));

  function activate(targetId) {
    // Views umschalten
    views.forEach(v => v.classList.toggle("is-active", v.id === targetId));
    // Tabs markieren + ARIA aktualisieren
    tabs.forEach(t => {
      const on = t.dataset.target === targetId;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    // Scroll nach oben für mobile UX
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // Initial
  activate("view-home");

  // Events
  tabs.forEach(btn => {
    btn.addEventListener("click", () => activate(btn.dataset.target));
  });

  // Optional: Persistente Auswahl (zurückkehren auf letzte View)
  const LAST_KEY = "fainance:lastView";
  window.addEventListener("beforeunload", () => {
    const active = document.querySelector(".view.is-active");
    if (active) localStorage.setItem(LAST_KEY, active.id);
  });
  const last = localStorage.getItem(LAST_KEY);
  if (last && document.getElementById(last)) activate(last);

  // --- Platzhalter: hier könntest du später Firebase etc. einbinden ---
  // Alle alten „BudgetAI“ Strings wurden zu „FAINANCE“ geändert.
})();