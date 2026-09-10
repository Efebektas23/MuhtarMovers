(function () {
  "use strict";

  var LANGS = ["en", "fr", "de", "es", "it", "ru", "tr", "zh"];
  var LANG_KEY = "muhtar_lang";
  var HTML_LANG = {
    en: "en",
    fr: "fr",
    de: "de",
    es: "es",
    it: "it",
    ru: "ru",
    tr: "tr",
    zh: "zh-CN"
  };

  function currentLang() {
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored && LANGS.indexOf(stored) >= 0) return stored;
    } catch (err) {}
    return "en";
  }

  function dictFor(lang) {
    var base = {};
    if (window.translations && window.translations.en) {
      Object.assign(base, window.translations.en);
    }
    if (window.MUHTAR_I18N && window.MUHTAR_I18N.en) {
      Object.assign(base, window.MUHTAR_I18N.en);
    }
    if (lang !== "en" && window.translations && window.translations[lang]) {
      Object.assign(base, window.translations[lang]);
    }
    if (lang !== "en" && window.MUHTAR_I18N && window.MUHTAR_I18N[lang]) {
      Object.assign(base, window.MUHTAR_I18N[lang]);
    }
    return base;
  }

  function t(key, vars) {
    if (!key) return "";
    var dict = dictFor(currentLang());
    var s = dict[key];
    if (s == null || s === "") {
      s = dictFor("en")[key] || "";
    }
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = String(s).split("{" + k + "}").join(String(vars[k]));
      });
    }
    return s;
  }

  function apply() {
    var lang = currentLang();
    document.documentElement.lang = HTML_LANG[lang] || lang;

    document.querySelectorAll("[data-translate-html]").forEach(function (el) {
      var val = t(el.getAttribute("data-translate-html"));
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll("[data-translate]").forEach(function (el) {
      if (el.hasAttribute("data-translate-html")) return;
      var val = t(el.getAttribute("data-translate"));
      if (val) el.textContent = val;
    });

    document.querySelectorAll("[data-translate-placeholder]").forEach(function (el) {
      var val = t(el.getAttribute("data-translate-placeholder"));
      if (val) el.setAttribute("placeholder", val);
    });

    document.querySelectorAll("[data-translate-aria]").forEach(function (el) {
      var val = t(el.getAttribute("data-translate-aria"));
      if (val) el.setAttribute("aria-label", val);
    });

    document.querySelectorAll("[data-translate-alt]").forEach(function (el) {
      var val = t(el.getAttribute("data-translate-alt"));
      if (val) el.setAttribute("alt", val);
    });

    var titleEl = document.querySelector("title[data-translate-title]");
    if (titleEl) {
      var titleVal = t(titleEl.getAttribute("data-translate-title"));
      if (titleVal) {
        titleEl.textContent = titleVal;
        document.title = titleVal;
      }
    } else if (dictFor(lang).page_title) {
      document.title = t("page_title");
    }

    document.querySelectorAll(".lang-code").forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });

    document.querySelectorAll(".lang-menu [data-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });

    var switcher = document.querySelector(".language-switcher");
    if (switcher) {
      var span = switcher.querySelector(".selected-language span");
      var flag = switcher.querySelector(".selected-language img");
      if (span) span.textContent = lang.toUpperCase();
      if (flag) {
        var flagCode = lang === "en" ? "us" : lang === "zh" ? "cn" : lang;
        flag.src = "https://cdn.jsdelivr.net/gh/lipis/flag-icon-css@3.5.0/flags/4x3/" + flagCode + ".svg";
        flag.alt = lang;
      }
    }
  }

  function setLanguage(lang) {
    if (LANGS.indexOf(lang) < 0) lang = "en";
    try {
      localStorage.setItem(LANG_KEY, lang);
      localStorage.removeItem("language");
    } catch (err) {}
    apply();
    document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: lang } }));
  }

  function bindNewSwitcher(root) {
    var toggle = root.querySelector(".lang-toggle");
    var menu = root.querySelector(".lang-menu");
    if (!toggle || !menu) return;

    function close() {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    function open() {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.hidden) open();
      else close();
    });

    menu.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        setLanguage(btn.getAttribute("data-lang"));
        close();
      });
    });

    document.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  function bindOldSwitcher(root) {
    var dropdown = root.querySelector(".language-dropdown");
    var selected = root.querySelector(".selected-language");
    if (!dropdown || !selected) return;

    selected.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function () {
      dropdown.style.display = "none";
    });

    dropdown.querySelectorAll("[data-lang]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        setLanguage(a.getAttribute("data-lang"));
        dropdown.style.display = "none";
      });
    });
  }

  window.MuhtarI18n = {
    t: t,
    apply: apply,
    setLang: setLanguage,
    getLang: currentLang
  };

  function init() {
    try { localStorage.removeItem("language"); } catch (err) {}
    document.querySelectorAll(".lang-switch").forEach(bindNewSwitcher);
    document.querySelectorAll(".language-switcher").forEach(bindOldSwitcher);
    apply();
    document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: currentLang() } }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
