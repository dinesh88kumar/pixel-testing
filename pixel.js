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


  // Session handling (30 min)
  let sessionId = getCookie("attr_session_id");
  if (!sessionId) {
    sessionId = "sess_" + uuid();
    setCookie("attr_session_id", sessionId);
  }


  const params = new URLSearchParams(window.location.search);
  const utms = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term")
  };


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


  // Page view
  send("page_view");


  // Public API
  window.AttributionPixel = {
    trackPurchase: function ({ order_id, revenue, currency }) {
      send("purchase", { order_id, revenue, currency });
    }
  };
})();





