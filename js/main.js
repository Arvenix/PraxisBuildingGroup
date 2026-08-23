/* ==========================================================================
   Praxis Building Group, LLC
   main.js  -  shared behavior for the entire site
   --------------------------------------------------------------------------
   Vanilla JavaScript, no dependencies. Loaded with `defer` on every page.

   CONTENTS
     A. Site configuration      <- edit company info and form delivery here
     B. Small helpers
     C. Analytics event layer
     D. Mobile navigation and services dropdown
     E. Consultation / contact form
     F. Project gallery filtering
     G. Footer year and click tracking
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     A. SITE CONFIGURATION
     Everything an operator normally needs to change lives in this object.
     See README.md -> "Configuring the contact form" before editing formDelivery.
     ======================================================================== */

  var PRAXIS = {
    company: "Praxis Building Group, LLC",
    phone: "833-637-8466",
    phoneHref: "tel:+18336378466",
    salesEmail: "sales@praxisbg.com",
    infoEmail: "info@praxisbg.com",

    formDelivery: {
      /* One of: "mailto" | "endpoint" | "formspree"
         ----------------------------------------------------------------
         "mailto"    No backend required. Opens the visitor's email client
                     with the inquiry pre-written to salesEmail. This is the
                     safe default so no lead is silently lost before a
                     backend exists.
         "endpoint"  POSTs JSON to `url` (Azure Function, Resend/SendGrid
                     wrapper, CRM webhook, or your own API route).
         "formspree" POSTs form data to a Formspree form URL.
         ----------------------------------------------------------------
         NEVER put an API key, SMTP password, or other secret in this file.
         It ships to the browser. Keep secrets on the server behind `url`. */
      mode: "mailto",
      url: "", // e.g. "https://praxis-forms.azurewebsites.net/api/inquiry"
      timeoutMs: 15000
    },

    /* Minimum seconds a real person needs to fill out the form.
       Submissions faster than this are treated as bot traffic. */
    minFillSeconds: 3
  };

  /* Expose read-only config for page-level scripts that need it. */
  window.PRAXIS_CONFIG = PRAXIS;


  /* ========================================================================
     B. SMALL HELPERS
     ======================================================================== */

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  }

  function on(el, type, handler, options) {
    if (el) el.addEventListener(type, handler, options);
  }

  var mqDesktop = window.matchMedia("(min-width: 75rem)");


  /* ========================================================================
     C. ANALYTICS EVENT LAYER
     No tracking IDs are hard-coded anywhere in this repository. When GA4,
     Google Tag Manager, Google Ads, or Meta Pixel is installed (see the
     commented block in each page <head>), these events flow through
     automatically. Until then, track() is a safe no-op.
     ======================================================================== */

  function track(eventName, params) {
    var payload = params || {};
    try {
      if (typeof window.dataLayer !== "undefined" && window.dataLayer.push) {
        window.dataLayer.push(
          Object.assign({ event: eventName }, payload)
        );
      }
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      }
      if (typeof window.fbq === "function" && payload.metaEvent) {
        window.fbq("track", payload.metaEvent, payload);
      }
    } catch (err) {
      /* Analytics must never break the page. */
    }
  }

  window.praxisTrack = track;


  /* ========================================================================
     D. MOBILE NAVIGATION AND SERVICES DROPDOWN
     ======================================================================== */

  function initNavigation() {
    var header = $(".site-header");
    if (!header) return;

    var nav = $("#primary-nav", header);
    /* The drawer's own close button also carries .nav-toggle and appears first
       in the DOM, so target the opener by the element it controls. */
    var toggle = $('.nav-toggle[aria-controls="primary-nav"]', header);
    var closeBtn = $(".nav-close", header);
    var lastFocused = null;

    /* ---- Mobile drawer ------------------------------------------------ */

    function openNav() {
      if (!nav || !toggle) return;
      lastFocused = document.activeElement;
      nav.setAttribute("data-open", "true");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      var firstLink = $("a, button", nav);
      if (firstLink) firstLink.focus();
    }

    function closeNav(returnFocus) {
      if (!nav || !toggle) return;
      nav.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      if (returnFocus && lastFocused && lastFocused.focus) lastFocused.focus();
    }

    on(toggle, "click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeNav(true);
      else openNav();
    });

    on(closeBtn, "click", function () {
      closeNav(true);
    });

    /* Keep the drawer's focus inside it while it is open. */
    on(nav, "keydown", function (event) {
      if (event.key !== "Tab" || mqDesktop.matches) return;
      if (nav.getAttribute("data-open") !== "true") return;

      var focusables = $$(
        'a[href], button:not([disabled]), input, select, textarea',
        nav
      ).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    /* Reset drawer state when crossing the desktop breakpoint. */
    function handleBreakpoint() {
      if (mqDesktop.matches) {
        closeNav(false);
      } else {
        closeAllDropdowns();
      }
    }
    if (mqDesktop.addEventListener) {
      mqDesktop.addEventListener("change", handleBreakpoint);
    } else if (mqDesktop.addListener) {
      mqDesktop.addListener(handleBreakpoint);
    }

    /* ---- Services dropdown (desktop panel / mobile accordion) --------- */

    var dropdownTriggers = $$("[data-dropdown-trigger]", header);

    function closeAllDropdowns(except) {
      dropdownTriggers.forEach(function (trigger) {
        if (trigger === except) return;
        var panel = document.getElementById(
          trigger.getAttribute("aria-controls")
        );
        trigger.setAttribute("aria-expanded", "false");
        if (panel) panel.setAttribute("data-open", "false");
      });
    }

    dropdownTriggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;

      on(trigger, "click", function (event) {
        event.preventDefault();
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        closeAllDropdowns(trigger);
        trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
        panel.setAttribute("data-open", isOpen ? "false" : "true");
      });

      /* Hover intent on desktop only, in addition to click and keyboard. */
      var parentItem = trigger.closest("li");
      var hoverTimer = null;
      on(parentItem, "mouseenter", function () {
        if (!mqDesktop.matches) return;
        window.clearTimeout(hoverTimer);
        closeAllDropdowns(trigger);
        trigger.setAttribute("aria-expanded", "true");
        panel.setAttribute("data-open", "true");
      });
      on(parentItem, "mouseleave", function () {
        if (!mqDesktop.matches) return;
        hoverTimer = window.setTimeout(function () {
          trigger.setAttribute("aria-expanded", "false");
          panel.setAttribute("data-open", "false");
        }, 140);
      });
    });

    /* Click outside closes desktop dropdowns. */
    on(document, "click", function (event) {
      if (!mqDesktop.matches) return;
      if (header.contains(event.target)) return;
      closeAllDropdowns();
    });

    /* Escape closes whichever layer is open. */
    on(document, "keydown", function (event) {
      if (event.key !== "Escape") return;
      var anyDropdownOpen = dropdownTriggers.some(function (t) {
        return t.getAttribute("aria-expanded") === "true";
      });
      if (anyDropdownOpen) {
        closeAllDropdowns();
        return;
      }
      if (nav && nav.getAttribute("data-open") === "true") closeNav(true);
    });
  }


  /* ========================================================================
     E. CONSULTATION / CONTACT FORM
     ======================================================================== */

  var FIELD_LABELS = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    projectAddress: "Project address",
    city: "City",
    projectType: "Project type",
    budget: "Estimated budget",
    timeline: "Desired timeline",
    message: "Project description",
    contactMethod: "Preferred contact method",
    consent: "Consent"
  };

  function setFieldError(input, message) {
    var wrapper = input.closest(".field");
    if (!wrapper) return;
    var errorEl = $(".field-error", wrapper);
    if (message) {
      wrapper.setAttribute("data-invalid", "true");
      input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.removeAttribute("data-invalid");
      input.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(input) {
    var value = (input.value || "").trim();
    var label = FIELD_LABELS[input.name] || "This field";

    if (input.type === "checkbox") {
      if (input.required && !input.checked) {
        setFieldError(input, "Please confirm before submitting.");
        return false;
      }
      setFieldError(input, "");
      return true;
    }

    if (input.required && !value) {
      setFieldError(input, label + " is required.");
      return false;
    }

    if (input.type === "email" && value) {
      /* Deliberately permissive: rejects obvious typos, not valid oddities. */
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        setFieldError(input, "Enter a valid email address.");
        return false;
      }
    }

    if (input.type === "tel" && value) {
      var digits = value.replace(/\D/g, "");
      if (digits.length < 10) {
        setFieldError(input, "Enter a 10 digit phone number.");
        return false;
      }
    }

    if (input.name === "message" && value && value.length < 10) {
      setFieldError(input, "Please add a little more detail about the project.");
      return false;
    }

    setFieldError(input, "");
    return true;
  }

  function collectPayload(form) {
    var data = {};
    var formData = new FormData(form);
    formData.forEach(function (value, key) {
      if (key === "praxis_company_website") return; /* honeypot */
      if (key === "praxis_render_time") return;
      data[key] = typeof value === "string" ? value.trim() : value;
    });
    data.pageUrl = window.location.href;
    data.pageTitle = document.title;
    data.submittedAt = new Date().toISOString();
    return data;
  }

  function buildMailto(data) {
    var lines = [
      "New project inquiry from praxisbg.com",
      "",
      "Name: " + (data.firstName || "") + " " + (data.lastName || ""),
      "Email: " + (data.email || ""),
      "Phone: " + (data.phone || ""),
      "Preferred contact: " + (data.contactMethod || "Not specified"),
      "",
      "Project address: " + (data.projectAddress || "Not provided"),
      "City: " + (data.city || "Not provided"),
      "Project type: " + (data.projectType || "Not specified"),
      "Estimated budget: " + (data.budget || "Not specified"),
      "Desired timeline: " + (data.timeline || "Not specified"),
      "",
      "Project description:",
      data.message || "",
      "",
      "---",
      "Submitted from: " + data.pageUrl
    ];

    var subject =
      "Project inquiry: " +
      (data.projectType || "General") +
      " - " +
      (data.lastName || "Website");

    return (
      "mailto:" +
      PRAXIS.salesEmail +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(lines.join("\n"))
    );
  }

  function postToBackend(data, form) {
    var cfg = PRAXIS.formDelivery;
    var controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, cfg.timeoutMs);

    var request;
    if (cfg.mode === "formspree") {
      request = fetch(cfg.url, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
        signal: controller ? controller.signal : undefined
      });
    } else {
      request = fetch(cfg.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller ? controller.signal : undefined
      });
    }

    return request
      .then(function (response) {
        window.clearTimeout(timer);
        if (!response.ok) throw new Error("Request failed: " + response.status);
        return true;
      })
      .catch(function (error) {
        window.clearTimeout(timer);
        throw error;
      });
  }

  function initForms() {
    $$("form[data-praxis-form]").forEach(function (form) {
      var statusEl = $(".form-status", form.parentNode) || $(".form-status", form);
      var successEl = document.getElementById(
        form.getAttribute("data-success-target") || ""
      );
      var submitBtn = $('button[type="submit"]', form);
      var renderTime = Date.now();
      var renderInput = $('input[name="praxis_render_time"]', form);
      if (renderInput) renderInput.value = String(renderTime);

      var validatable = $$("input, select, textarea", form).filter(function (el) {
        return (
          el.name &&
          el.name !== "praxis_company_website" &&
          el.name !== "praxis_render_time" &&
          el.type !== "hidden"
        );
      });

      /* Validate on blur, then live-correct once a field has been flagged. */
      validatable.forEach(function (input) {
        on(input, "blur", function () {
          validateField(input);
        });
        on(input, "input", function () {
          var wrapper = input.closest(".field");
          if (wrapper && wrapper.getAttribute("data-invalid") === "true") {
            validateField(input);
          }
        });
      });

      function showStatus(message, variant) {
        if (!statusEl) return;
        statusEl.hidden = false;
        statusEl.textContent = message;
        statusEl.className = "form-status form-status--" + variant;
      }

      function hideStatus() {
        if (statusEl) statusEl.hidden = true;
      }

      function showSuccess() {
        if (successEl) {
          /* Hide the whole card, not just the fields, so the form heading and
             intro copy do not sit above the confirmation. */
          var card = form.closest(".form-card") || form;
          card.hidden = true;
          successEl.hidden = false;
          successEl.setAttribute("tabindex", "-1");
          successEl.focus();
          successEl.scrollIntoView({ block: "center", behavior: "smooth" });
        } else {
          showStatus(
            "Thank you. Your inquiry has been sent. Praxis will follow up shortly.",
            "pending"
          );
        }
      }

      on(form, "submit", function (event) {
        event.preventDefault();
        hideStatus();

        /* Spam trap 1: hidden field only a bot would complete. */
        var honeypot = $('input[name="praxis_company_website"]', form);
        if (honeypot && honeypot.value) return;

        /* Spam trap 2: submitted implausibly fast. */
        if (Date.now() - renderTime < PRAXIS.minFillSeconds * 1000) {
          showStatus(
            "Please take a moment to review the form, then submit again.",
            "error"
          );
          return;
        }

        var firstInvalid = null;
        validatable.forEach(function (input) {
          var ok = validateField(input);
          if (!ok && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
          showStatus(
            "Please correct the highlighted fields and submit again.",
            "error"
          );
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }

        var data = collectPayload(form);
        var cfg = PRAXIS.formDelivery;

        track("consultation_submit", {
          form_id: form.id || "consultation",
          project_type: data.projectType || "unspecified",
          metaEvent: "Lead"
        });

        if (cfg.mode === "mailto" || !cfg.url) {
          /* No backend configured. Hand the inquiry to the visitor's mail
             client so the lead still reaches sales@praxisbg.com. */
          window.location.href = buildMailto(data);
          showSuccess();
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.originalText = submitBtn.textContent;
          submitBtn.textContent = "Sending...";
        }
        showStatus("Sending your inquiry...", "pending");

        postToBackend(data, form)
          .then(function () {
            hideStatus();
            showSuccess();
          })
          .catch(function () {
            showStatus(
              "Your inquiry could not be sent. Please call " +
                PRAXIS.phone +
                " or email " +
                PRAXIS.salesEmail +
                " and we will pick it up from there.",
              "error"
            );
          })
          .then(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent =
                submitBtn.dataset.originalText || "Request a Consultation";
            }
          });
      });
    });
  }


  /* ========================================================================
     F. PROJECT GALLERY FILTERING
     ======================================================================== */

  function initGallery() {
    var gallery = $("[data-gallery]");
    if (!gallery) return;

    var chips = $$("[data-filter]");
    var items = $$("[data-category]", gallery);
    var emptyEl = $("[data-gallery-empty]");
    var liveRegion = $("[data-gallery-count]");

    function applyFilter(value) {
      var shown = 0;
      items.forEach(function (item) {
        var categories = (item.getAttribute("data-category") || "").split(" ");
        var match = value === "all" || categories.indexOf(value) !== -1;
        item.hidden = !match;
        if (match) shown += 1;
      });

      chips.forEach(function (chip) {
        chip.setAttribute(
          "aria-pressed",
          chip.getAttribute("data-filter") === value ? "true" : "false"
        );
      });

      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (liveRegion) {
        liveRegion.textContent =
          shown + (shown === 1 ? " project shown" : " projects shown");
      }
    }

    chips.forEach(function (chip) {
      on(chip, "click", function () {
        applyFilter(chip.getAttribute("data-filter"));
      });
    });

    /* Allow deep links such as projects.html#kitchens */
    var hash = window.location.hash.replace("#", "");
    if (hash && chips.some(function (c) {
      return c.getAttribute("data-filter") === hash;
    })) {
      applyFilter(hash);
    }
  }


  /* ========================================================================
     G. FOOTER YEAR AND CONVERSION CLICK TRACKING
     ======================================================================== */

  function initYear() {
    $$("[data-current-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function initClickTracking() {
    on(document, "click", function (event) {
      var link = event.target.closest ? event.target.closest("a, button") : null;
      if (!link) return;

      var href = link.getAttribute("href") || "";

      if (href.indexOf("tel:") === 0) {
        track("phone_click", {
          link_url: href,
          link_location: link.closest(".site-header")
            ? "header"
            : link.closest(".site-footer")
            ? "footer"
            : "body",
          metaEvent: "Contact"
        });
        return;
      }

      if (href.indexOf("mailto:") === 0) {
        track("email_click", { link_url: href, metaEvent: "Contact" });
        return;
      }

      if (link.hasAttribute("data-cta")) {
        track("consultation_click", {
          cta_label: link.getAttribute("data-cta"),
          page_path: window.location.pathname
        });
      }
    });

    /* Fires once per service page view so service performance is comparable. */
    var servicePage = document.body.getAttribute("data-service");
    if (servicePage) {
      track("service_page_conversion", { service: servicePage });
    }
  }


  /* ========================================================================
     BOOTSTRAP
     ======================================================================== */

  function init() {
    initNavigation();
    initForms();
    initGallery();
    initYear();
    initClickTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
