(() => {
  "use strict";

  const TARGET = new Date("2026-07-17T09:00:00-03:00");

  const THEME_ORDER = [
    "feliz",
    "saudade",
    "sonhador",
    "animado",
    "romantico",
    "sereno",
    "nostalgico",
  ];

  const THEME_META = {
    feliz: { ambient: null },
    saudade: { ambient: "rain" },
    sonhador: { ambient: "stars" },
    animado: { ambient: null },
    romantico: { ambient: null },
    sereno: { ambient: null },
    nostalgico: { ambient: null },
  };

  // ---- Ambient effects ----

  const Ambient = {
    el: null,

    init() {
      this.el = document.getElementById("ambient");
    },

    clear() {
      const children = this.el.querySelectorAll(".rain-drop, .star");
      children.forEach((c) => c.remove());
    },

    rain() {
      const count = window.innerWidth < 768 ? 35 : 70;
      for (let i = 0; i < count; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = Math.random() * 100 + "%";
        drop.style.animationDuration = 0.7 + Math.random() * 0.5 + "s";
        drop.style.animationDelay = Math.random() * 2 + "s";
        drop.style.height = 12 + Math.random() * 18 + "px";
        drop.style.opacity = 0.15 + Math.random() * 0.2;
        this.el.appendChild(drop);
      }
    },

    stars() {
      const count = window.innerWidth < 768 ? 50 : 100;
      for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.animationDuration = 2 + Math.random() * 4 + "s";
        star.style.animationDelay = Math.random() * 3 + "s";
        const size = 1 + Math.random() * 2;
        star.style.width = size + "px";
        star.style.height = size + "px";
        this.el.appendChild(star);
      }
    },
  };

  // ---- Theme management ----

  function getDailyTheme() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    return THEME_ORDER[dayOfYear % THEME_ORDER.length];
  }

  function applyTheme(themeKey, instant) {
    const body = document.body;
    const ambient = Ambient.el;

    function doSwitch() {
      THEME_ORDER.forEach((t) => body.classList.remove("tema-" + t));
      body.classList.add("tema-" + themeKey);
      Ambient.clear();
      const meta = THEME_META[themeKey];
      if (meta.ambient === "rain") Ambient.rain();
      else if (meta.ambient === "stars") Ambient.stars();
    }

    if (instant) {
      doSwitch();
      ambient.style.opacity = "1";
    } else {
      ambient.style.opacity = "0";
      setTimeout(() => {
        doSwitch();
        requestAnimationFrame(() => {
          ambient.style.opacity = "1";
        });
      }, 500);
    }
  }

  function getActiveThemeKey() {
    try {
      return localStorage.getItem("tema-override");
    } catch {
      return null;
    }
  }

  function setOverride(key) {
    try {
      if (key) localStorage.setItem("tema-override", key);
      else localStorage.removeItem("tema-override");
    } catch {}
  }

  // ---- Countdown ----

  let isReunion = false;

  function updateCountdown() {
    if (isReunion) return;

    const diff = TARGET - new Date();

    const diasEl = document.getElementById("dias");
    const horasEl = document.getElementById("horas");
    const minutosEl = document.getElementById("minutos");
    const segundosEl = document.getElementById("segundos");

    if (diff <= 0) {
      isReunion = true;
      diasEl.textContent = "0";
      horasEl.textContent = "00";
      minutosEl.textContent = "00";
      segundosEl.textContent = "00";
      document.getElementById("dias-label").textContent = "dias";
      document.getElementById("horas-label").textContent = "horas";
      document.getElementById("minutos-label").textContent = "minutos";
      document.getElementById("segundos-label").textContent = "segundos";

      const section = document.getElementById("phrase-section");
      section.innerHTML =
        '<p class="phrase-text reunion">Finalmente juntos</p>';
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    diasEl.textContent = days;
    horasEl.textContent = String(hours).padStart(2, "0");
    minutosEl.textContent = String(minutes).padStart(2, "0");
    segundosEl.textContent = String(seconds).padStart(2, "0");

    document.getElementById("dias-label").textContent =
      days === 1 ? "dia" : "dias";
    document.getElementById("horas-label").textContent =
      hours === 1 ? "hora" : "horas";
    document.getElementById("minutos-label").textContent =
      minutes === 1 ? "minuto" : "minutos";
    document.getElementById("segundos-label").textContent =
      seconds === 1 ? "segundo" : "segundos";
  }

  // ---- Phrases ----

  let lastIndex = -1;

  function getRandomPhrase() {
    if (!window.FRASES || !FRASES.length) return "a gente se encontrar";
    let idx;
    do {
      idx = Math.floor(Math.random() * FRASES.length);
    } while (idx === lastIndex && FRASES.length > 1);
    lastIndex = idx;
    return FRASES[idx];
  }

  function swapPhrase() {
    const el = document.getElementById("frase");
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";

    setTimeout(() => {
      el.textContent = getRandomPhrase();
      el.style.transform = "translateY(6px)";
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }, 300);
  }

  // ---- Admin panel ----

  function initAdmin() {
    const panel = document.getElementById("admin");
    const trigger = document.getElementById("admin-trigger");
    const closeBtn = panel.querySelector(".admin-close");
    const autoBtn = panel.querySelector(".admin-auto");
    const themeButtons = panel.querySelectorAll(".admin-theme");

    function openPanel() {
      panel.classList.add("open");
    }

    function closePanel() {
      panel.classList.remove("open");
      if (location.hash === "#admin") {
        history.replaceState(null, "", location.pathname + location.search);
      }
    }

    function updateActive(themeKey) {
      const override = getActiveThemeKey();
      themeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === themeKey);
      });
      autoBtn.classList.toggle("active", !override);
    }

    if (location.hash === "#admin") openPanel();

    window.addEventListener("hashchange", () => {
      if (location.hash === "#admin") openPanel();
    });

    trigger.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);

    themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.theme;
        setOverride(key);
        applyTheme(key);
        updateActive(key);
      });
    });

    autoBtn.addEventListener("click", () => {
      setOverride(null);
      const daily = getDailyTheme();
      applyTheme(daily);
      updateActive(daily);
    });

    const override = getActiveThemeKey();
    updateActive(override || getDailyTheme());
  }

  // ---- Init ----

  document.addEventListener("DOMContentLoaded", () => {
    Ambient.init();

    const override = getActiveThemeKey();
    applyTheme(override || getDailyTheme(), true);

    updateCountdown();
    setInterval(updateCountdown, 1000);

    document.getElementById("frase").textContent = getRandomPhrase();

    const diceBtn = document.getElementById("dice");
    diceBtn.addEventListener("click", () => {
      if (isReunion) return;
      diceBtn.classList.remove("spin");
      void diceBtn.offsetWidth;
      diceBtn.classList.add("spin");
      swapPhrase();
    });

    initAdmin();
  });
})();
