(function () {
  "use strict";

  var EMAIL = "moving@muhtar.ca";

  var state = {
    step: 1,
    started: false,
    completed: false,
    sending: false,
    from: "",
    to: "",
    fromLat: "",
    fromLng: "",
    toLat: "",
    toLng: "",
    moveType: "",
    moveSize: "",
    moveDate: "",
    dateFlexible: false,
    name: "",
    phone: "",
    email: "",
    details: ""
  };

  var STEPS = 5;

  function t(key, vars) {
    if (window.MuhtarI18n && typeof window.MuhtarI18n.t === "function") {
      return window.MuhtarI18n.t(key, vars);
    }
    return key;
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function track(name, props) {
    var payload = props || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, payload));
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }
    var cfg = window.SECURE_CONFIG || window.CONFIG;
    if (cfg && cfg.ENVIRONMENT && cfg.ENVIRONMENT.ENABLE_CONSOLE_LOGS) {
      console.log("[muhtar]", name, payload);
    }
  }

  function resetQuoteAfterSuccess() {
    state.completed = false;
    state.sending = false;
    state.started = false;
    state.step = 1;
    state.from = "";
    state.to = "";
    state.fromLat = "";
    state.fromLng = "";
    state.toLat = "";
    state.toLng = "";
    state.moveType = "";
    state.moveSize = "";
    state.moveDate = "";
    state.dateFlexible = false;
    state.name = "";
    state.phone = "";
    state.email = "";
    state.details = "";
    syncForm();
    setError("");
    var hint = el("quote-success-mailhint");
    if (hint) hint.classList.add("hidden");
  }

  function openQuote(opts) {
    var dialog = $("#quote");
    if (!dialog) return;
    if (state.completed) resetQuoteAfterSuccess();
    if (opts && opts.from) state.from = opts.from;
    if (opts && opts.to) state.to = opts.to;
    if (opts && opts.from && opts.to) state.step = 2;
    else state.step = 1;

    if (!state.started) {
      state.started = true;
      track("quote_form_started", { source: (opts && opts.source) || "dialog" });
    }

    syncForm();
    renderStep();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    trapFocus(dialog);
  }

  function closeQuote() {
    var dialog = $("#quote");
    if (!dialog) return;
    var wasCompleted = state.completed;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    if (state.started && !wasCompleted) {
      track("quote_abandonment", { last_step: state.step });
    }
    if (wasCompleted) {
      resetQuoteAfterSuccess();
      renderStep({ skipFocus: true });
    }
  }

  function trapFocus() {}

  function syncForm() {
    var from = $("#quote-from");
    var to = $("#quote-to");
    if (from) from.value = state.from;
    if (to) to.value = state.to;
    var date = $("#quote-date");
    if (date) date.value = state.moveDate;
    var flex = $("#quote-flexible");
    if (flex) flex.checked = state.dateFlexible;
    var name = $("#quote-name");
    var phone = $("#quote-phone");
    var email = $("#quote-email");
    var details = $("#quote-details");
    if (name) name.value = state.name;
    if (phone) phone.value = state.phone;
    if (email) email.value = state.email;
    if (details) details.value = state.details;
    $$(".choice[data-type]").forEach(function (btn) {
      btn.classList.toggle("is-selected", btn.getAttribute("data-type") === state.moveType);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-type") === state.moveType ? "true" : "false");
    });
    $$(".choice[data-size]").forEach(function (btn) {
      btn.classList.toggle("is-selected", btn.getAttribute("data-size") === state.moveSize);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-size") === state.moveSize ? "true" : "false");
    });
  }

  function readForm() {
    state.from = ($("#quote-from") || {}).value || state.from;
    state.to = ($("#quote-to") || {}).value || state.to;
    state.moveDate = ($("#quote-date") || {}).value || "";
    state.dateFlexible = !!( $("#quote-flexible") && $("#quote-flexible").checked );
    state.name = ($("#quote-name") || {}).value || "";
    state.phone = ($("#quote-phone") || {}).value || "";
    state.email = ($("#quote-email") || {}).value || "";
    state.details = ($("#quote-details") || {}).value || "";
  }

  function setError(msg) {
    var el = $("#quote-error");
    if (el) el.textContent = msg || "";
  }

  function validateStep() {
    readForm();
    if (state.step === 1) {
      if (!state.from.trim() || !state.to.trim()) {
        setError(t("quote_err_route"));
        return false;
      }
    }
    if (state.step === 2 && !state.moveType) {
      setError(t("quote_err_type"));
      return false;
    }
    if (state.step === 3 && !state.moveSize) {
      setError(t("quote_err_size"));
      return false;
    }
    if (state.step === 4 && !state.moveDate && !state.dateFlexible) {
      setError(t("quote_err_date"));
      return false;
    }
    if (state.step === 5) {
      if (!state.name.trim()) {
        setError(t("quote_err_name"));
        return false;
      }
      if (!state.phone.trim()) {
        setError(t("quote_err_phone"));
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
        setError(t("quote_err_email"));
        return false;
      }
    }
    setError("");
    return true;
  }

  var STEP_TITLES = {
    1: "Where are you moving?",
    2: "What type of move?",
    3: "Approximate size",
    4: "When are you moving?",
    5: "How should we reach you?"
  };

  function el(id) {
    return document.getElementById(id);
  }

  function renderStep(opts) {
    opts = opts || {};
    $$(".quote-step").forEach(function (panel) {
      var active = Number(panel.getAttribute("data-step")) === state.step;
      panel.classList.toggle("hidden", !active);
      panel.toggleAttribute("hidden", !active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });
    var progress = el("quote-progress-label");
    if (progress) progress.textContent = t("quote_progress", { n: state.step, total: STEPS });
    var title = el("quote-title");
    if (title) title.textContent = t("quote_title_" + state.step) || STEP_TITLES[state.step] || "Your moving quote";
    var bar = el("quote-progress-bar");
    if (bar) bar.style.width = (state.step / STEPS) * 100 + "%";
    var back = el("quote-back");
    if (back) back.disabled = state.step === 1;
    var next = el("quote-next");
    if (next) {
      if (state.sending) {
        next.disabled = true;
        next.textContent = t("quote_sending");
      } else {
        next.disabled = false;
        next.textContent = state.step === STEPS ? t("quote_request") : t("cta_continue");
      }
    }
    var formView = el("quote-form-view");
    var successView = el("quote-success-view");
    var shell = $(".quote-shell");
    var dialog = $("#quote");
    if (formView) formView.classList.toggle("hidden", state.completed);
    if (successView) successView.classList.toggle("hidden", !state.completed);
    if (shell) shell.classList.toggle("is-complete", state.completed);
    if (dialog) dialog.setAttribute("aria-labelledby", state.completed ? "quote-success-heading" : "quote-title");
    var first = $(".quote-step:not(.hidden) input, .quote-step:not(.hidden) textarea, .quote-step:not(.hidden) .choice");
    if (first && !state.completed && !opts.skipFocus) setTimeout(function () { first.focus(); }, 40);
  }

  function nextStep() {
    if (!validateStep()) return;
    if (state.step === STEPS) {
      submitQuote();
      return;
    }
    state.step += 1;
    track("quote_step", { step: state.step });
    renderStep();
  }

  function prevStep() {
    setError("");
    if (state.step > 1) state.step -= 1;
    renderStep();
  }

  function payload() {
    return {
      _subject: "Moving quote request — " + state.from + " → " + state.to,
      _template: "table",
      _captcha: "false",
      _honey: "",
      name: state.name,
      phone: state.phone,
      email: state.email,
      moving_from: state.from,
      moving_to: state.to,
      pickup_lat: state.fromLat || "",
      pickup_lng: state.fromLng || "",
      dropoff_lat: state.toLat || "",
      dropoff_lng: state.toLng || "",
      move_type: state.moveType,
      move_size: state.moveSize,
      move_date: state.dateFlexible && !state.moveDate ? "Flexible" : state.moveDate,
      date_flexible: state.dateFlexible ? "Yes" : "No",
      additional_details: state.details || "(none)",
      source: window.location.href
    };
  }

  function mailtoHref() {
    var body = [
      "Moving quote request",
      "",
      "From: " + state.from,
      "To: " + state.to,
      "Pickup coords: " + (state.fromLat && state.fromLng ? state.fromLat + ", " + state.fromLng : "(not set)"),
      "Drop-off coords: " + (state.toLat && state.toLng ? state.toLat + ", " + state.toLng : "(not set)"),
      "Type: " + state.moveType,
      "Size: " + state.moveSize,
      "Date: " + (state.dateFlexible && !state.moveDate ? "Flexible" : state.moveDate),
      "Flexible: " + (state.dateFlexible ? "Yes" : "No"),
      "",
      "Name: " + state.name,
      "Phone: " + state.phone,
      "Email: " + state.email,
      "",
      "Details:",
      state.details || "(none)"
    ].join("\n");
    return "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent("Moving quote request — " + state.from + " → " + state.to) +
      "&body=" + encodeURIComponent(body);
  }

  function restoreQuoteNext() {
    var next = $("#quote-next");
    state.sending = false;
    if (next) {
      next.disabled = false;
      next.textContent = t("quote_request");
    }
  }

  function submitQuote() {
    var next = $("#quote-next");
    state.sending = true;
    setError("");
    if (next) {
      next.disabled = true;
      next.textContent = t("quote_sending");
    }
    var data = payload();
    var href = mailtoHref();
    var send = window.MuhtarLeadMail && window.MuhtarLeadMail.send;

    function onSent(result) {
      finishSuccess(result && result.method === "mailto", result && result.mailtoHref);
    }

    function onFail(err) {
      restoreQuoteNext();
      renderStep({ skipFocus: true });
      var fallback = (err && err.mailtoHref) || href;
      setError(t("quote_err_send"));
      var hint = el("quote-success-mailhint");
      var link = el("quote-success-mailto");
      if (hint && link && fallback) {
        link.href = fallback;
        link.textContent = t("quote_success_mailhint");
      }
    }

    if (typeof send === "function") {
      send({
        email: EMAIL,
        data: data,
        mailtoHref: href,
        subject: data._subject,
        timeoutMs: 12000
      }).then(onSent).catch(onFail);
      return;
    }

    fetch("https://formsubmit.co/ajax/" + EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        var ok = json && (json.success === true || json.success === "true");
        if (!res.ok || !ok) throw new Error((json && json.message) || "submit failed");
      });
    }).then(function () {
      onSent({ method: "form", mailtoHref: href });
    }).catch(function () {
      try {
        window.location.href = href;
        onSent({ method: "mailto", mailtoHref: href });
      } catch (err) {
        onFail({ mailtoHref: href });
      }
    });
  }

  function finishSuccess(usedMailto, href) {
    state.completed = true;
    state.sending = false;
    track("quote_form_completed", { method: usedMailto ? "mailto" : "form" });
    var hint = el("quote-success-mailhint");
    var link = el("quote-success-mailto");
    if (hint && link) {
      if (usedMailto && href) {
        link.href = href;
        link.textContent = t("quote_success_mailhint");
        hint.classList.remove("hidden");
      } else {
        hint.classList.add("hidden");
      }
    }
    renderStep({ skipFocus: true });
    restoreQuoteNext();
    var done = el("quote-done");
    if (done) setTimeout(function () { done.focus(); }, 40);
  }

  function bindPlaces() {
    var binder = window.MuhtarAddressSearch && window.MuhtarAddressSearch.bind;
    if (typeof binder !== "function") return;

    function attach(id, side) {
      var input = document.getElementById(id);
      if (!input || input.dataset.placesBound) return;
      var box = document.getElementById(id + "-suggestions");
      binder(input, {
        suggestionsEl: box,
        types: ["geocode"],
        onSelect: function (place) {
          var address = place.formattedAddress || input.value;
          input.value = address;
          if (side === "from") {
            state.from = address;
            state.fromLat = place.location ? String(place.location.lat) : "";
            state.fromLng = place.location ? String(place.location.lng) : "";
          } else {
            state.to = address;
            state.toLat = place.location ? String(place.location.lat) : "";
            state.toLng = place.location ? String(place.location.lng) : "";
          }
        },
        onInput: function () {
          if (side === "from") {
            state.fromLat = "";
            state.fromLng = "";
          } else {
            state.toLat = "";
            state.toLng = "";
          }
        }
      });
      input.dataset.placesBound = "1";
    }

    attach("hero-from", "from");
    attach("hero-to", "to");
    attach("quote-from", "from");
    attach("quote-to", "to");
  }

  window.initMap = bindPlaces;

  function loadMaps() {
    if (typeof window.initSecureGoogleMaps === "function") {
      window.initSecureGoogleMaps();
    }
  }

  function initHeader() {
    var header = $(".site-header");
    var toggle = $(".nav-toggle");
    var mobile = $(".mobile-nav");

    function syncHeader() {
      if (!header) return;
      var menuOpen = !!(mobile && mobile.classList.contains("is-open"));
      header.classList.toggle("is-solid", window.scrollY > 16 || menuOpen);
      header.classList.toggle("is-compact", window.scrollY > 24);
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        syncHeader();
      });
      $$(".mobile-nav a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobile.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          syncHeader();
        });
      });
    }
  }

  function initFilms() {
    var films = $$(".js-film");
    if (!films.length) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function markPlaying(video, on) {
      var film = video.closest(".film") || video.closest(".hero");
      if (film) film.classList.toggle("is-playing", on);
    }

    function loadSrc(video) {
      var src = video.getAttribute("data-src");
      if (src && !video.getAttribute("src") && !video.querySelector("source")) {
        video.src = src;
      }
    }

    function silence(video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.setAttribute("muted", "");
    }

    function tryPlay(video) {
      silence(video);
      loadSrc(video);
      var play = video.play();
      if (play && play.then) {
        play.then(function () { markPlaying(video, true); }).catch(function () {
          markPlaying(video, false);
        });
      }
    }

    films.forEach(function (video) {
      silence(video);
      video.addEventListener("volumechange", function () {
        if (!video.muted || video.volume) silence(video);
      });
      if (reduced) {
        video.removeAttribute("autoplay");
        video.pause();
        markPlaying(video, false);
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) tryPlay(video);
          else video.pause();
        });
      }, { threshold: 0.15 });
      io.observe(video);
      tryPlay(video);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden || reduced) return;
      films.forEach(function (video) {
        var rect = video.getBoundingClientRect();
        var visible = rect.bottom > 80 && rect.top < (window.innerHeight - 40);
        if (visible) tryPlay(video);
      });
    });
  }

  function initReveal() {
    var nodes = $$(".reveal");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initFaq() {
    $$(".faq-item button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var opening = !item.classList.contains("is-open");
        $$(".faq-item").forEach(function (el) {
          el.classList.remove("is-open");
          var b = el.querySelector("button");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (opening) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
        track("faq_interaction", { question: btn.textContent.trim(), open: opening });
      });
    });
  }

  function initTracking() {
    $$("[data-open-quote]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (el.tagName === "A") e.preventDefault();
        track("hero_cta_click", { source: el.getAttribute("data-source") || "cta" });
        openQuote({ source: el.getAttribute("data-source") || "cta" });
      });
    });

    document.addEventListener("click", function (e) {
      var tel = e.target.closest && e.target.closest('a[href^="tel:"]');
      if (tel) track("phone_click", { href: tel.getAttribute("href") });
      var wa = e.target.closest && e.target.closest('a[href*="wa.me"]');
      if (wa) track("whatsapp_click", { href: wa.getAttribute("href") });
      var service = e.target.closest && e.target.closest("[data-service]");
      if (service) track("service_engagement", { service: service.getAttribute("data-service") });
    });

    window.addEventListener("beforeunload", function () {
      if (state.started && !state.completed) {
        track("quote_abandonment", { last_step: state.step, reason: "unload" });
      }
    });
  }

  function initQuote() {
    var dialog = $("#quote");
    var form = $("#hero-route");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var from = ($("#hero-from") || {}).value || "";
        var to = ($("#hero-to") || {}).value || "";
        if (!from.trim() || !to.trim()) {
          openQuote({ source: "hero_route" });
          return;
        }
        track("hero_cta_click", { source: "hero_route" });
        openQuote({ from: from, to: to, source: "hero_route" });
      });
    }

    $$(".choice[data-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.moveType = btn.getAttribute("data-type");
        syncForm();
        setError("");
      });
    });
    $$(".choice[data-size]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.moveSize = btn.getAttribute("data-size");
        syncForm();
        setError("");
      });
    });

    var next = $("#quote-next");
    var back = $("#quote-back");
    if (next) next.addEventListener("click", nextStep);
    if (back) back.addEventListener("click", prevStep);
    var closeBtn = $("#quote-close");
    if (closeBtn) closeBtn.addEventListener("click", closeQuote);
    var doneBtn = $("#quote-done");
    if (doneBtn) doneBtn.addEventListener("click", closeQuote);

    if (dialog) {
      dialog.addEventListener("click", function (e) {
        if (e.target === dialog) closeQuote();
      });
      dialog.addEventListener("cancel", function () {
        if (state.started && !state.completed) {
          track("quote_abandonment", { last_step: state.step, reason: "cancel" });
        }
      });
      dialog.addEventListener("close", function () {
        if (state.completed) {
          resetQuoteAfterSuccess();
          renderStep({ skipFocus: true });
        }
      });
    }

    var date = $("#quote-date");
    if (date) {
      var min = new Date();
      date.min = min.toISOString().split("T")[0];
    }

    if (window.location.hash === "#quote") {
      openQuote({ source: "hash" });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initFilms();
    initReveal();
    initFaq();
    initTracking();
    initQuote();
    loadMaps();
    bindPlaces();
    document.addEventListener("languageChanged", function () {
      renderStep({ skipFocus: true });
    });
  });

  window.MuhtarQuote = { open: openQuote, close: closeQuote, track: track };
})();
