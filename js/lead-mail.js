(function (window) {
  "use strict";

  var MAILTO_MAX = 1800;

  function formSubmitOk(data) {
    if (!data) return false;
    var s = data.success;
    return s === true || s === "true";
  }

  function buildMailto(to, cc, subject, body) {
    var text = String(body || "");
    function href(b) {
      var query = "subject=" + encodeURIComponent(subject || "") +
        "&body=" + encodeURIComponent(b);
      if (cc) query = "cc=" + encodeURIComponent(cc) + "&" + query;
      return "mailto:" + to + "?" + query;
    }
    var out = href(text);
    while (out.length > MAILTO_MAX && text.length > 120) {
      text = text.slice(0, Math.max(80, Math.floor(text.length * 0.75))) +
        "\n\n[Trimmed — full inventory is in the truck loader if needed.]";
      out = href(text);
    }
    return out;
  }

  function openMailto(href) {
    if (!href) return false;
    try {
      var a = document.createElement("a");
      a.href = href;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      return true;
    } catch (err) {
      try {
        window.location.href = href;
        return true;
      } catch (err2) {
        return false;
      }
    }
  }

  function postFormSubmit(email, data, timeoutMs) {
    var ms = timeoutMs || 12000;
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, ms);

    function clear() {
      clearTimeout(timer);
    }

    return fetch("https://formsubmit.co/ajax/" + email, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clear();
      return res.json().catch(function () {
        return {};
      }).then(function (json) {
        if (!res.ok || !formSubmitOk(json)) {
          var err = new Error((json && json.message) || "Form submit failed");
          err.body = json;
          throw err;
        }
        return json;
      });
    }, function (err) {
      clear();
      throw err;
    });
  }

  function sendLead(opts) {
    var email = opts.email;
    var data = opts.data || {};
    var mailtoHref = opts.mailtoHref || buildMailto(email, opts.cc, opts.subject, opts.body);
    return postFormSubmit(email, data, opts.timeoutMs).then(function () {
      return { method: "form", mailtoHref: mailtoHref };
    }).catch(function () {
      var opened = openMailto(mailtoHref);
      if (!opened) {
        var err = new Error("Lead delivery failed");
        err.mailtoHref = mailtoHref;
        throw err;
      }
      return { method: "mailto", mailtoHref: mailtoHref };
    });
  }

  window.MuhtarLeadMail = {
    send: sendLead,
    openMailto: openMailto,
    buildMailto: buildMailto,
    postFormSubmit: postFormSubmit
  };
})(window);
