(function () {
  // ✅ Your ngrok backend
  const API = "https://3e98def9c1be.ngrok-free.app/collect";

  function uuid() {
    return crypto.randomUUID();
  }

  function getCookie(name) {
    return document.cookie
      .split("; ")
      .find(row => row.startsWith(name + "="))
      ?.split("=")[1];
  }

  function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/; max-age=1800; SameSite=Lax`;
  }

  /* ---------------- SESSION (30 min) ---------------- */
  let sessionId = getCookie("attr_session_id");
  if (!sessionId) {
    sessionId = "sess_" + uuid();
    setCookie("attr_session_id", sessionId);
  }

  /* ---------------- UTM (FIRST TOUCH) ---------------- */
  const params = new URLSearchParams(window.location.search);

  const incomingUtms = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term")
  };

  let storedUtms = null;

  try {
    storedUtms = JSON.parse(localStorage.getItem("utm_data"));
  } catch (e) {}

  // Save UTMs only once (first-touch)
  if (incomingUtms.utm_source && !storedUtms) {
    storedUtms = {
      ...incomingUtms,
      landing_page: window.location.pathname,
      first_visit_at: new Date().toISOString()
    };
    localStorage.setItem("utm_data", JSON.stringify(storedUtms));
  }

  const utms = storedUtms || {};

  /* ---------------- SEND EVENT ---------------- */
  function send(event, extra = {}) {
    const payload = {
      event,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      ...utms,
      ...extra
    };

    navigator.sendBeacon(API, JSON.stringify(payload));
  }

  /* ---------------- AUTO PAGE VIEW ---------------- */
  send("page_view");

  /* ---------------- PUBLIC API ---------------- */
  window.AttributionPixel = {
    trackPurchase: function ({ order_id, revenue, currency }) {
      send("purchase", { order_id, revenue, currency });
    }
  };
})();
