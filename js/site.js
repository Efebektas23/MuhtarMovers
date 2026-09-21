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
    document.body.classList.add("quote-open");
    trapFocus(dialog);
  }

  function closeQuote() {
    var dialog = $("#quote");
    if (!dialog) return;
    var wasCompleted = state.completed;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("quote-open");
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
    var scrollLock = 0;
    function menuOpen() {
      return !!(mobile && mobile.classList.contains("is-open"));
    }

    function syncHeader() {
      if (!header) return;
      var open = menuOpen();
      header.classList.toggle("is-menu", open);
      header.classList.toggle("is-solid", window.scrollY > 16 || open);
      header.classList.toggle("is-compact", window.scrollY > 24);
    }

    function setMenu(open, opts) {
      if (!toggle || !mobile) return;
      opts = opts || {};
      mobile.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
      if (open) {
        scrollLock = window.scrollY || window.pageYOffset || 0;
        document.body.style.position = "fixed";
        document.body.style.top = "-" + scrollLock + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        var first = mobile.querySelector("a, button");
        if (first) first.focus({ preventScroll: true });
      } else {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        var root = document.documentElement;
        var previous = root.style.scrollBehavior;
        var hashTarget = opts.hashTarget;
        root.style.scrollBehavior = "auto";
        window.scrollTo(0, scrollLock);
        root.style.scrollBehavior = previous;
        if (hashTarget) {
          requestAnimationFrame(function () {
            hashTarget.scrollIntoView({ behavior: "auto", block: "start" });
            if (hashTarget.id) history.pushState(null, "", "#" + hashTarget.id);
          });
        }
        if (opts.restoreFocus !== false && document.activeElement && mobile.contains(document.activeElement)) {
          toggle.focus({ preventScroll: true });
        }
      }
      syncHeader();
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820 && menuOpen()) setMenu(false);
      syncHeader();
    });

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        setMenu(!menuOpen());
      });
      $$(".mobile-nav a, .mobile-nav button").forEach(function (link) {
        link.addEventListener("click", function (e) {
          var href = link.getAttribute("href") || "";
          var hashTarget = null;
          if (href.charAt(0) === "#" && href.length > 1) {
            hashTarget = document.querySelector(href);
            if (hashTarget) e.preventDefault();
          }
          setMenu(false, {
            restoreFocus: !hashTarget && !link.hasAttribute("data-open-quote"),
            hashTarget: hashTarget
          });
        });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menuOpen()) setMenu(false);
      });
    }

    document.addEventListener("focusin", function (e) {
      if (e.target && e.target.matches && e.target.matches("input, textarea, select")) {
        document.body.classList.add("input-focus");
      }
    });
    document.addEventListener("focusout", function () {
      setTimeout(function () {
        var active = document.activeElement;
        if (!active || !active.matches || !active.matches("input, textarea, select")) {
          document.body.classList.remove("input-focus");
        }
      }, 30);
    });
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
    var seen = [];
    nodes.forEach(function (n) {
      var parent = n.parentElement;
      var count = 0;
      if (parent) {
        count = seen.filter(function (item) { return item === parent; }).length;
        seen.push(parent);
      }
      n.style.setProperty("--d", Math.min(count, 5) * 80 + "ms");
    });
    function showAll() {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initExperience() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var progress = document.querySelector(".scroll-progress > span");
    var hero = document.querySelector(".hero");
    var heroFilm = document.querySelector("[data-parallax-hero]");
    var heroCopy = document.querySelector(".hero-copy");
    var shifts = $$(".media-shift");
    var rails = $$("[data-rail]");
    var floats = $$("[data-float]");
    var cue = document.querySelector("[data-scroll-target]");
    var marquee = document.querySelector(".trust-track");

    if (cue) {
      cue.addEventListener("click", function () {
        var target = document.querySelector(cue.getAttribute("data-scroll-target"));
        if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
    }

    var sections = $$("main section[id], #contact");
    var navLinks = $$(".nav a[href^='#'], .mobile-nav a[href^='#']");
    if (sections.length && navLinks.length && "IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        });
      }, { rootMargin: "-42% 0px -48% 0px", threshold: 0 });
      sections.forEach(function (section) { spy.observe(section); });
    }

    if (marquee && "IntersectionObserver" in window && !reduced) {
      var watch = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          marquee.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
        });
      });
      var marqueeHost = marquee.closest(".trust");
      if (marqueeHost) watch.observe(marqueeHost);
    }

    if (reduced) return;

    var ticking = false;
    var narrowQuery = window.matchMedia("(max-width: 820px)");

    function apply() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      var vh = window.innerHeight || 1;
      var doc = document.documentElement.scrollHeight - vh;
      var narrow = narrowQuery.matches;
      var depth = narrow ? 0.55 : 1;

      if (progress) {
        var p = doc > 0 ? Math.min(1, Math.max(0, y / doc)) : 0;
        progress.style.transform = "scaleX(" + p + ")";
      }

      if (hero && heroFilm) {
        var heroRect = hero.getBoundingClientRect();
        if (heroRect.bottom > 0 && heroRect.top < vh) {
          heroFilm.style.transform = "translate3d(0," + (y * 0.15 * depth) + "px,0)";
        }
      }

      if (heroCopy && hero) {
        heroCopy.style.opacity = "";
        heroCopy.style.transform = "";
      }

      shifts.forEach(function (el) {
        var host = el.parentElement || el;
        var rect = host.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) return;
        var center = rect.top + rect.height / 2;
        var delta = (center - vh / 2) / vh;
        var maxShift = rect.height * (narrow ? 0.05 : 0.08);
        var travel = Math.max(-maxShift, Math.min(maxShift, delta * maxShift));
        el.style.transform = "translate3d(0," + travel.toFixed(2) + "px,0)";
      });

      rails.forEach(function (rail) {
        var parent = rail.parentElement;
        if (!parent) return;
        var rect = parent.getBoundingClientRect();
        var passed = vh * 0.72 - rect.top;
        var total = Math.max(rect.height * 0.9, 1);
        var amount = Math.max(0, Math.min(1, passed / total));
        rail.style.setProperty("--rail", amount.toFixed(3));
      });

      floats.forEach(function (el) {
        var host = el.parentElement || el;
        var rect = host.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var shift = (rect.top - vh * 0.4) * -0.08 * depth;
        el.style.setProperty("--float", shift.toFixed(1) + "px");
      });
    }

    function requestTick() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
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
        document.body.classList.remove("quote-open");
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

  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;
    var status = $("#contact-status");
    var sendBtn = $("#contact-send");

    function setStatus(key, isError) {
      if (!status) return;
      status.dataset.statusKey = key || "";
      status.hidden = !key;
      status.textContent = key ? t(key) : "";
      status.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending") || form.classList.contains("is-sent")) return;
      var honey = form.querySelector("[name='_honey']");
      if (honey && honey.value) return;

      var name = ($("#contact-name").value || "").trim();
      var phone = ($("#contact-phone").value || "").trim();
      var email = ($("#contact-email").value || "").trim();
      var note = ($("#contact-note").value || "").trim();
      if (!name || !phone || !email || !note) {
        setStatus("contact_required", true);
        return;
      }

      form.classList.add("is-sending");
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = t("quote_sending");
      }
      setStatus("", false);

      var subject = "Website message — " + name;
      var body = [
        "Website message",
        "",
        "Name: " + name,
        "Phone: " + phone,
        "Email: " + email,
        "",
        "Note:",
        note
      ].join("\n");
      var data = {
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: email,
        name: name,
        phone: phone,
        email: email,
        note: note,
        source: window.location.href
      };
      var href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var send = window.MuhtarLeadMail && window.MuhtarLeadMail.send;

      function finish(ok) {
        form.classList.remove("is-sending");
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = t("contact_send");
        }
        if (ok) {
          form.classList.add("is-sent");
          form.reset();
          setStatus("contact_sent", false);
          return;
        }
        setStatus("contact_err", true);
      }

      if (typeof send !== "function") {
        finish(false);
        return;
      }

      send({
        email: EMAIL,
        data: data,
        mailtoHref: href,
        subject: subject,
        body: body,
        timeoutMs: 12000
      }).then(function () {
        finish(true);
      }).catch(function () {
        finish(false);
      });
    });

    document.addEventListener("languageChanged", function () {
      if (sendBtn && !form.classList.contains("is-sending")) sendBtn.textContent = t("contact_send");
      if (status && status.dataset.statusKey) setStatus(status.dataset.statusKey, status.classList.contains("is-error"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initFilms();
    initReveal();
    initExperience();
    initFaq();
    initTracking();
    initQuote();
    initContactForm();
    loadMaps();
    bindPlaces();
    document.addEventListener("languageChanged", function () {
      renderStep({ skipFocus: true });
    });
  });

  window.MuhtarQuote = { open: openQuote, close: closeQuote, track: track };
})();
