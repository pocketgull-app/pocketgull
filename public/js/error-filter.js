(function() {
  var origError = console.error;
  function isAllowedGoogleApisHost(filename) {
    if (!filename) return false;
    try {
      var parsed = new URL(filename, window.location.href);
      var host = parsed.hostname;
      return host === 'apis.google.com' || host.endsWith('.apis.google.com');
    } catch (_) {
      return false;
    }
  }
  console.error = function() {
    var msg = Array.prototype.slice.call(arguments).join(' ');
    if (isAllowedGoogleApisHost(msg) || msg.indexOf('u[v]') !== -1) return;
    if (msg.indexOf('@firebase/data-connect') !== -1 && msg.indexOf('NOT_FOUND') !== -1) return;
    if (msg.indexOf('Content Security Policy') !== -1 && msg.indexOf('frame-src') !== -1) return;
    if (msg.indexOf('OTS parsing error') !== -1 || msg.indexOf('Failed to decode downloaded font') !== -1 || msg.indexOf('glyf:') !== -1) return;
    if (msg.indexOf('OscillatorNode is not useful') !== -1 || msg.indexOf('GainNode is not useful') !== -1 || msg.indexOf('Connecting nodes after the context has been closed') !== -1) return;
    origError.apply(console, arguments);
  };
  window.addEventListener('error', function (e) {
    var msg = (e && e.message) || '';
    if ((e.filename && isAllowedGoogleApisHost(e.filename)) || msg.indexOf('u[v]') !== -1 || msg.indexOf('Failed to decode downloaded font') !== -1 || msg.indexOf('OTS parsing error') !== -1) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var reason = (e && e.reason && (e.reason.message || e.reason.stack)) || String(e.reason || '');
    if (reason.indexOf('u[v]') !== -1 || isAllowedGoogleApisHost(reason)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
})();
