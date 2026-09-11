(function (window) {
  "use strict";

  function placesReady() {
    return !!(window.google && google.maps && google.maps.places);
  }

  function mapsKey() {
    var secure = window.SECURE_CONFIG;
    if (secure && secure.GOOGLE_MAPS && secure.GOOGLE_MAPS.API_KEY) {
      return secure.GOOGLE_MAPS.API_KEY;
    }
    var cfg = window.CONFIG;
    if (!cfg) return "";
    if (cfg.GOOGLE_MAPS && cfg.GOOGLE_MAPS.API_KEY) return cfg.GOOGLE_MAPS.API_KEY;
    return cfg.GOOGLE_MAPS_API_KEY || "";
  }

  function loadGoogle() {
    if (placesReady()) return;
    if (document.querySelector("script[data-muhtar-maps]")) return;
    var key = mapsKey();
    if (!key || String(key).indexOf("YOUR_") === 0) return;
    var script = document.createElement("script");
    script.setAttribute("data-muhtar-maps", "1");
    script.async = true;
    script.defer = true;
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) +
      "&libraries=places&callback=initMap&loading=async";
    script.onerror = function () {
      console.warn("Google Maps did not load; street search will use the same fallback as Load a truck.");
    };
    document.head.appendChild(script);
  }

  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function latLng(location) {
    if (!location) return null;
    var lat = typeof location.lat === "function" ? location.lat() : location.lat;
    var lng = typeof location.lng === "function" ? location.lng() : location.lng;
    lat = Number(lat);
    lng = Number(lng);
    if (!isFinite(lat) || !isFinite(lng)) return null;
    return { lat: lat, lng: lng };
  }

  function nominatimLabel(result) {
    var address = (result && result.address) || {};
    var street = [address.house_number, address.road || address.pedestrian || address.residential]
      .filter(Boolean)
      .join(" ");
    var locality = address.city || address.town || address.village || address.hamlet;
    var region = address.state;
    var parts = [];
    if (street) parts.push(street);
    if (locality) parts.push(locality);
    if (region) parts.push(region);
    if (address.postcode) parts.push(address.postcode);
    if (parts.length) return parts.join(", ");
    var name = (result && result.display_name) || "";
    return name.split(",").slice(0, 3).map(function (part) { return part.trim(); }).filter(Boolean).join(", ");
  }

  function nominatimDetails(result) {
    var address = (result && result.address) || {};
    var parts = [];
    var locality = address.city || address.town || address.village || address.hamlet;
    if (locality) parts.push(locality);
    if (address.state) parts.push(address.state);
    if (address.postcode) parts.push(address.postcode);
    if (address.country) {
      parts.push(address.country === "United States" ? "USA" : address.country);
    }
    return parts.join(", ");
  }

  function bind(input, opts) {
    opts = opts || {};
    if (!input) return;

    var box = opts.suggestionsEl;
    if (!box) {
      box = document.createElement("div");
      box.className = "address-suggestions";
    }
    var host = input.closest(".field, .route-field, .address-input-container, .form-group") || input.parentNode;
    if (host && box.parentNode !== host) {
      host.appendChild(box);
    }

    var selectedIndex = -1;
    var timer = null;
    var googleTimer = null;
    var sessionToken = null;
    var detailsService = null;
    var lastQuery = "";
    var searchGen = 0;

    function hide() {
      box.style.display = "none";
      box.innerHTML = "";
      selectedIndex = -1;
    }

    function placeBox() {
      box.style.position = "absolute";
      box.style.left = "0";
      box.style.right = "0";
      box.style.top = "100%";
      box.style.width = "100%";
      box.style.display = "block";
      box.style.zIndex = "40";
    }

    function showMessage(text, kind) {
      box.innerHTML = '<div class="suggestion-item ' + (kind || "loading") + '">' + esc(text) + "</div>";
      placeBox();
    }

    function items() {
      return box.querySelectorAll(".suggestion-item[data-source]");
    }

    function paintSelection() {
      var rows = items();
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.toggle("active", i === selectedIndex);
      }
    }

    function emit(payload) {
      hide();
      if (typeof opts.onSelect === "function") opts.onSelect(payload);
    }

    function chooseGoogle(placeId, fallbackText) {
      if (!placesReady() || !placeId) {
        input.value = fallbackText || input.value;
        emit({ formattedAddress: input.value, location: null, placeId: "", provider: "typed" });
        return;
      }

      if (!detailsService) {
        var attr = document.getElementById("muhtar-places-attr");
        if (!attr) {
          attr = document.createElement("div");
          attr.id = "muhtar-places-attr";
          attr.style.display = "none";
          document.body.appendChild(attr);
        }
        detailsService = new google.maps.places.PlacesService(attr);
      }

      detailsService.getDetails({
        placeId: placeId,
        fields: ["formatted_address", "geometry", "address_components", "name"],
        sessionToken: sessionToken || undefined
      }, function (place, status) {
        sessionToken = null;
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          input.value = fallbackText || input.value;
          emit({ formattedAddress: input.value, location: null, placeId: placeId, provider: "google" });
          return;
        }
        var address = place.formatted_address || place.name || fallbackText || input.value;
        input.value = address;
        emit({
          formattedAddress: address,
          location: latLng(place.geometry && place.geometry.location),
          placeId: placeId,
          provider: "google",
          place: place
        });
      });
    }

    function chooseNominatim(row) {
      var address = row.getAttribute("data-label") || input.value;
      var lat = Number(row.getAttribute("data-lat"));
      var lng = Number(row.getAttribute("data-lng"));
      input.value = address;
      emit({
        formattedAddress: address,
        location: isFinite(lat) && isFinite(lng) ? { lat: lat, lng: lng } : null,
        placeId: row.getAttribute("data-osm") || "",
        provider: "nominatim"
      });
    }

    function chooseRow(row) {
      if (!row) return;
      if (row.getAttribute("data-source") === "google") {
        chooseGoogle(row.getAttribute("data-place-id"), row.getAttribute("data-label"));
        return;
      }
      chooseNominatim(row);
    }

    function renderGoogle(predictions) {
      box.innerHTML = "";
      predictions.forEach(function (prediction) {
        var main = (prediction.structured_formatting && prediction.structured_formatting.main_text) || prediction.description;
        var secondary = (prediction.structured_formatting && prediction.structured_formatting.secondary_text) || "";
        var row = document.createElement("div");
        row.className = "suggestion-item";
        row.setAttribute("data-source", "google");
        row.setAttribute("data-place-id", prediction.place_id || "");
        row.setAttribute("data-label", prediction.description || main);
        row.innerHTML =
          '<div class="suggestion-main">' + esc(main) + "</div>" +
          '<div class="suggestion-details">' + esc(secondary) + "</div>";
        row.addEventListener("mousedown", function (e) {
          e.preventDefault();
          chooseRow(row);
        });
        box.appendChild(row);
      });
      selectedIndex = -1;
      placeBox();
    }

    function renderNominatim(results) {
      box.innerHTML = "";
      results.forEach(function (result) {
        var label = nominatimLabel(result);
        var row = document.createElement("div");
        row.className = "suggestion-item";
        row.setAttribute("data-source", "nominatim");
        row.setAttribute("data-label", label);
        row.setAttribute("data-lat", result.lat);
        row.setAttribute("data-lng", result.lon);
        row.setAttribute("data-osm", String(result.osm_id || ""));
        row.innerHTML =
          '<div class="suggestion-main">' + esc(label) + "</div>" +
          '<div class="suggestion-details">' + esc(nominatimDetails(result)) + "</div>";
        row.addEventListener("mousedown", function (e) {
          e.preventDefault();
          chooseRow(row);
        });
        box.appendChild(row);
      });
      selectedIndex = -1;
      placeBox();
    }

    function searchNominatim(query, gen) {
      fetch("https://nominatim.openstreetmap.org/search?" +
        "q=" + encodeURIComponent(query) +
        "&format=json&limit=8&countrycodes=us,ca&addressdetails=1&accept-language=en")
        .then(function (res) {
          if (!res.ok) throw new Error("search failed");
          return res.json();
        })
        .then(function (results) {
          if (gen !== searchGen || query !== lastQuery) return;
          if (!results || !results.length) {
            showMessage("No matching addresses", "no-results");
            return;
          }
          renderNominatim(results);
        })
        .catch(function () {
          if (gen !== searchGen || query !== lastQuery) return;
          showMessage("Address search unavailable", "error");
        });
    }

    function searchGoogle(query, gen) {
      if (!sessionToken && google.maps.places.AutocompleteSessionToken) {
        sessionToken = new google.maps.places.AutocompleteSessionToken();
      }
      var service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: query,
        componentRestrictions: { country: ["us", "ca"] },
        types: opts.types || ["geocode"],
        sessionToken: sessionToken || undefined
      }, function (predictions, status) {
        if (gen !== searchGen || query !== lastQuery) return;
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length) {
          if (googleTimer) {
            clearTimeout(googleTimer);
            googleTimer = null;
          }
          renderGoogle(predictions);
          return;
        }
        searchNominatim(query, gen);
      });
    }

    function search(query) {
      lastQuery = query;
      searchGen += 1;
      var gen = searchGen;
      if (googleTimer) {
        clearTimeout(googleTimer);
        googleTimer = null;
      }
      if (query.length < 3) {
        hide();
        return;
      }
      showMessage("Searching…", "loading");
      if (placesReady()) {
        searchGoogle(query, gen);
        googleTimer = setTimeout(function () {
          if (gen !== searchGen) return;
          searchNominatim(query, gen);
        }, 1200);
        return;
      }
      searchNominatim(query, gen);
    }

    input.addEventListener("input", function () {
      var query = input.value.trim();
      clearTimeout(timer);
      timer = setTimeout(function () { search(query); }, 280);
      if (typeof opts.onInput === "function") opts.onInput(query);
    });

    input.addEventListener("keydown", function (e) {
      var rows = items();
      if (!rows.length || box.style.display === "none") return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, rows.length - 1);
        paintSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        paintSelection();
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        chooseRow(rows[selectedIndex]);
      } else if (e.key === "Escape") {
        hide();
      }
    });

    document.addEventListener("click", function (e) {
      if (e.target !== input && !box.contains(e.target)) hide();
    });

    window.addEventListener("resize", hide);
    var scroller = input.closest(".quote-body, .modal-body, .inv-panel, dialog");
    if (scroller) scroller.addEventListener("scroll", hide, { passive: true });
  }

  window.MuhtarAddressSearch = {
    bind: bind,
    ready: placesReady,
    loadGoogle: loadGoogle
  };
})(window);
