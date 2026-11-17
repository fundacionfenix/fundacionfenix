(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var WA_NUMBER = "573207212004";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  /* ---------- Menú móvil ---------- */
  var toggle = $(".nav-toggle");
  var nav = $("#nav");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function () { setMenu(false); });
  }

  /* ---------- Pestañas (modelo, misión/visión, programas) ---------- */
  var tabBoxes = [];

  function initTabs(box) {
    var tabs = $$('[role="tab"]', box);
    var current = 0;
    var timer = null;
    var stopped = false;
    var inView = false;
    var paused = false;

    tabs.forEach(function (t, i) { if (t.getAttribute("aria-selected") === "true") current = i; });

    function select(i, focus) {
      current = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, j) {
        var on = j === current;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle("is-active", on);
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        panel.classList.toggle("is-active", on);
        if (on) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
      });
      if (focus) tabs[current].focus();
    }

    function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function sync() {
      clearTimer();
      if (box.hasAttribute("data-autoplay") && !reduce && !stopped && inView && !paused) {
        timer = setInterval(function () { select(current + 1); }, 6500);
      }
    }
    function stop() { stopped = true; sync(); }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { stop(); select(i); });
      t.addEventListener("keydown", function (e) {
        var map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (map[e.key]) { e.preventDefault(); stop(); select(current + map[e.key], true); }
        else if (e.key === "Home") { e.preventDefault(); stop(); select(0, true); }
        else if (e.key === "End") { e.preventDefault(); stop(); select(tabs.length - 1, true); }
      });
    });

    if (box.hasAttribute("data-autoplay")) {
      box.addEventListener("mouseenter", function () { paused = true; sync(); });
      box.addEventListener("mouseleave", function () { paused = false; sync(); });
      box.addEventListener("focusin", function () { paused = true; sync(); });
      box.addEventListener("focusout", function () { paused = false; sync(); });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) box.classList.add("in-view");
        sync();
      }, { threshold: 0.35 }).observe(box);
    } else {
      box.classList.add("in-view");
    }

    var api = { box: box, tabs: tabs, select: select, stop: stop };
    tabBoxes.push(api);
    return api;
  }

  var modelApi = null;
  $$("[data-tabs]").forEach(function (box) {
    var api = initTabs(box);
    if (box.classList.contains("model")) modelApi = api;
  });

  /* ---------- Terapias: filtro por dimensión ---------- */
  var chips = $$("[data-filter-btn]");
  var cards = $$(".t-card");

  function replay(el, delay) {
    el.style.setProperty("--d", delay + "ms");
    if (el.classList.contains("is-visible")) {
      el.classList.remove("is-visible");
      void el.offsetWidth;
      el.classList.add("is-visible");
    }
  }

  function applyFilter(dim) {
    var n = 0;
    chips.forEach(function (c) {
      var on = c.getAttribute("data-filter-btn") === dim;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    cards.forEach(function (card) {
      var show = dim === "all" || card.getAttribute("data-dim") === dim;
      card.hidden = !show;
      if (show) replay(card, Math.min(n++, 8) * 60);
    });
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () { applyFilter(c.getAttribute("data-filter-btn")); });
  });

  $$("[data-filter]").forEach(function (a) {
    a.addEventListener("click", function () { applyFilter(a.getAttribute("data-filter")); });
  });

  $$("[data-goto-dim]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!modelApi) return;
      var id = "tab-" + b.getAttribute("data-goto-dim");
      var idx = modelApi.tabs.findIndex(function (t) { return t.id === id; });
      if (idx < 0) return;
      modelApi.stop();
      modelApi.select(idx);
      var target = $("#modelo");
      if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- Valores: tarjetas que giran (táctil) ---------- */
  $$(".flip-inner").forEach(function (b) {
    b.addEventListener("click", function () {
      if (canHover) return;
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    });
  });

  /* ---------- Filosofía: texto que se ilumina al avanzar ---------- */
  var hl = $("[data-hl]");
  var words = [];
  if (hl) {
    var text = hl.textContent.trim().split(/\s+/);
    hl.textContent = "";
    text.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      hl.appendChild(s);
      if (i < text.length - 1) hl.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }

  /* ---------- Scroll: progreso, paralaje, texto y línea de tiempo ---------- */
  var bar = $(".progress span");
  var philBg = $(".phil-bg");
  var journey = $(".journey");
  var journeyLine = $(".journey-line");
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty("--sp", max > 0 ? (window.scrollY / max).toFixed(4) : "0");

    if (philBg && !reduce) {
      var r = philBg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) philBg.style.setProperty("--py", (r.top * -0.12).toFixed(1) + "px");
    }

    if (words.length) {
      var hr = hl.getBoundingClientRect();
      var p = reduce ? 1 : clamp((vh * 0.85 - hr.top) / (hr.height + vh * 0.4), 0, 1);
      var lit = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) {
        var on = i < lit;
        if (words[i].classList.contains("on") !== on) words[i].classList.toggle("on", on);
      }
    }

    if (journey && journeyLine) {
      var jr = journey.getBoundingClientRect();
      var jp = clamp((vh * 0.85 - jr.top) / (jr.height * 0.9), 0, 1);
      journeyLine.style.setProperty("--p", (jp * 100).toFixed(1) + "%");
    }
  }

  function requestUpdate() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  /* ---------- Revelado al entrar en pantalla ---------- */
  var revealSel = ".section-head, .t-card, .flip, .j-card, .glass, .composer, .start-copy, .contact-card, " +
    ".model, .about, .programs, .cta-inner, .model-cta, .closing, .phil-closing, .chips, .location, .spec-card, .spec-cta";
  var items = $$(revealSel);
  items.forEach(function (el) { el.classList.add("reveal"); });

  if (!("IntersectionObserver" in window) || reduce) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", Math.min(batch++, 6) * 70 + "ms");
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Contadores del hero ---------- */
  $$("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || isNaN(target)) return;
    var start = null;
    el.textContent = "0";
    function step(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / 1400, 0, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.setTimeout(function () { window.requestAnimationFrame(step); }, 350);
    window.setTimeout(function () { el.textContent = String(target); }, 2600);
  });

  /* ---------- Inclinación del logo (solo con puntero) ---------- */
  var art = $(".hero-art");
  var tilt = $("[data-tilt]");
  if (art && tilt && canHover && !reduce) {
    art.addEventListener("pointermove", function (e) {
      var r = art.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      tilt.style.setProperty("--rx", (y * -8).toFixed(2) + "deg");
    });
    art.addEventListener("pointerleave", function () {
      tilt.style.setProperty("--ry", "0deg");
      tilt.style.setProperty("--rx", "0deg");
    });
  }

  /* ---------- Resplandor que sigue al puntero ---------- */
  if (canHover) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".t-card, .glass, .contact-card");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- Mensaje de WhatsApp a medida ---------- */
  var form = $("#composer");
  var send = $("#wa-send");
  var bubble = $("#bubble-text");

  if (form && send && bubble) {
    var WHO = {
      yo: "Hola, necesito ayuda para iniciar un proceso de recuperación.",
      familiar: "Hola, un familiar mío necesita ayuda y quisiera orientación para iniciar un proceso de recuperación.",
      amigo: "Hola, un amigo necesita ayuda y quisiera orientación para iniciar un proceso de recuperación."
    };
    var WHAT = {
      orientacion: "Me gustaría recibir orientación sobre cuál es el mejor camino.",
      involuntario: "Mi familiar aún no quiere recibir ayuda y quisiera orientación sobre el manejo de pacientes involuntarios.",
      internamiento: "Me interesa conocer el programa de internamiento.",
      ambulatorio: "Me interesa conocer el programa ambulatorio.",
      modelo: "Quisiera conocer el Modelo Holístico Clínico y sus terapias."
    };

    var build = function () {
      var note = form.elements.note.value.trim();
      var msg = WHO[form.elements.who.value] + " " + WHAT[form.elements.what.value];
      if (note) msg += "\n\n" + note;
      msg += "\n\nEscribo desde la página web de la Fundación Fénix Fénix.";
      bubble.textContent = msg;
      send.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
    };
    form.addEventListener("input", build);
    form.addEventListener("change", build);
    build();
  }

  /* ---------- Aviso del botón flotante ---------- */
  var tip = $("#wa-tip");
  if (tip) {
    var seen = false;
    try { seen = sessionStorage.getItem("fenix-wa-tip") === "1"; } catch (e) { /* sin almacenamiento */ }

    var hideTip = function () {
      tip.hidden = true;
      try { sessionStorage.setItem("fenix-wa-tip", "1"); } catch (e) { /* sin almacenamiento */ }
    };

    if (!seen) {
      window.setTimeout(function () {
        var start = $("#empezar");
        var r = start ? start.getBoundingClientRect() : null;
        var onStart = r && r.top < window.innerHeight && r.bottom > 0;
        if (!onStart) {
          tip.hidden = false;
          window.setTimeout(hideTip, 14000);
        }
      }, 8000);
    }
    $(".wa-tip-close", tip).addEventListener("click", hideTip);
    $(".whatsapp-float").addEventListener("click", hideTip);
  }
})();
