/*
 * Shared spam protection for every public form on the site.
 *
 * Layers handled here:
 *   1. Cloudflare Turnstile  - proves a real browser submitted the form
 *   2. Timestamp             - records when the form was loaded
 *   3. Honeypot              - a hidden field only bots fill in
 *
 * The matching server-side checks live in /server/index.js.
 *
 * SETUP: replace TURNSTILE_SITE_KEY below with the site key from the
 * Cloudflare dashboard (Turnstile > your widget). The secret key from the
 * same widget goes in the backend environment as TURNSTILE_SECRET_KEY.
 */
(function () {
  'use strict';

  var TURNSTILE_SITE_KEY = 'REPLACE_WITH_TURNSTILE_SITE_KEY';

  // Every form that posts to the API.
  var FORM_IDS = ['contactForm', 'newsletterForm', 'giftBoxForm'];

  function eachForm(callback) {
    FORM_IDS.forEach(function (id) {
      var form = document.getElementById(id);
      if (form) callback(form);
    });
  }

  // --- Honeypot ------------------------------------------------------------
  // Added here so no form can be shipped without one.
  function addHoneypot(form) {
    if (form.querySelector('input[name="website"]')) return;

    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';

    var input = document.createElement('input');
    input.type = 'text';
    input.name = 'website';
    input.tabIndex = -1;
    input.autocomplete = 'off';

    wrap.appendChild(input);
    form.appendChild(wrap);
  }

  // --- Timestamp -----------------------------------------------------------
  function addTimestamp(form) {
    if (form.querySelector('input[name="form_loaded_at"]')) return;

    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'form_loaded_at';
    input.value = String(Date.now());
    form.appendChild(input);
  }

  // --- Turnstile -----------------------------------------------------------
  // The widget renders into a placeholder just above the submit button and
  // writes its token into a hidden field inside the form.
  function addTurnstileHolder(form) {
    if (form.querySelector('.cf-turnstile')) return;

    var holder = document.createElement('div');
    holder.className = 'cf-turnstile';
    holder.style.cssText = 'margin: 16px 0;';

    var button = form.querySelector('button[type="submit"], .submit-button, .newsletter-submit');
    if (button && button.parentNode) {
      button.parentNode.insertBefore(holder, button);
    } else {
      form.appendChild(holder);
    }
  }

  var domReady = false;
  var turnstileLoaded = false;

  function renderWidgets() {
    if (!domReady || !turnstileLoaded || typeof turnstile === 'undefined') return;
    document.querySelectorAll('.cf-turnstile').forEach(function (holder) {
      if (holder.dataset.rendered) return;
      turnstile.render(holder, { sitekey: TURNSTILE_SITE_KEY });
      holder.dataset.rendered = 'true';
    });
  }

  // Named callback loaded by the Turnstile API script tag. It can fire before
  // or after the DOM is ready, so both paths call renderWidgets().
  window.onloadTurnstileCallback = function () {
    turnstileLoaded = true;
    renderWidgets();
  };

  // --- Public helper -------------------------------------------------------
  // Call this when building the JSON body for a form submission.
  window.formSecurity = {
    fields: function (form) {
      if (typeof form === 'string') form = document.getElementById(form);
      if (!form) return {};

      var honeypot = form.querySelector('input[name="website"]');
      var timestamp = form.querySelector('input[name="form_loaded_at"]');
      var token = form.querySelector('[name="cf-turnstile-response"]');

      return {
        website: honeypot ? honeypot.value : '',
        form_loaded_at: timestamp ? timestamp.value : '',
        turnstileToken: token ? token.value : ''
      };
    },

    // Clears the widget after a submission so the next one gets a fresh token.
    reset: function (form) {
      if (typeof form === 'string') form = document.getElementById(form);
      if (!form || typeof turnstile === 'undefined') return;
      var holder = form.querySelector('.cf-turnstile');
      if (holder) turnstile.reset(holder);
    }
  };

  function init() {
    eachForm(function (form) {
      addHoneypot(form);
      addTimestamp(form);
      addTurnstileHolder(form);
    });
    domReady = true;
    renderWidgets();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
