/* ==========================================================================
   TaskFlow LP — Main JavaScript
   ========================================================================== */

(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     Sticky Header — scroll shadow
     ----------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector(".header");
    if (!header) return;

    var scrollThreshold = 10;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* -----------------------------------------------------------------------
     Mobile Menu
     ----------------------------------------------------------------------- */
  function initMobileMenu() {
    var hamburger = document.querySelector(".hamburger");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (!hamburger || !mobileMenu) return;

    var menuLinks = mobileMenu.querySelectorAll(".mobile-menu__link");

    function openMenu() {
      hamburger.classList.add("is-active");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", "メニューを閉じる");
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      hamburger.classList.remove("is-active");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "メニューを開く");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  /* -----------------------------------------------------------------------
     Smooth Scroll for anchor links
     ----------------------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#") return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        // Update URL without triggering scroll
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     Scroll Animations — IntersectionObserver
     ----------------------------------------------------------------------- */
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll(
      ".fade-in, .fade-in-left, .fade-in-right, .stagger"
    );

    if (!animatedElements.length) return;

    if (!("IntersectionObserver" in window)) {
      // Fallback: show everything
      animatedElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------------
     FAQ Accordion
     ----------------------------------------------------------------------- */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll(".faq-item");
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var button = item.querySelector(".faq-item__question");
      var answer = item.querySelector(".faq-item__answer");
      if (!button || !answer) return;

      button.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        // Close all other items
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item && otherItem.classList.contains("is-open")) {
            otherItem.classList.remove("is-open");
            otherItem
              .querySelector(".faq-item__question")
              .setAttribute("aria-expanded", "false");
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     Number Counter Animation
     ----------------------------------------------------------------------- */
  function initCounterAnimation() {
    var statNumbers = document.querySelectorAll(".stat-item__number");
    if (!statNumbers.length) return;

    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    // Extract number text (e.g., "10,000" from "10,000社以上")
    var textContent = el.textContent;
    var unitSpan = el.querySelector(".stat-item__unit");
    var unitText = unitSpan ? unitSpan.textContent : "";

    // Get just the number part
    var numberText = textContent.replace(unitText, "").trim();
    var hasComma = numberText.indexOf(",") !== -1;
    var hasDecimal = numberText.indexOf(".") !== -1;
    var targetNumber = parseFloat(numberText.replace(/,/g, ""));

    if (isNaN(targetNumber)) return;

    var duration = 1500;
    var startTime = null;
    var decimalPlaces = hasDecimal
      ? numberText.split(".")[1].replace(/[^\d]/g, "").length
      : 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      var easedProgress = 1 - Math.pow(1 - progress, 3);
      var currentValue = easedProgress * targetNumber;

      // Format number
      var formatted;
      if (hasDecimal) {
        formatted = currentValue.toFixed(decimalPlaces);
      } else {
        formatted = Math.floor(currentValue).toString();
      }

      if (hasComma) {
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      // Build content
      if (unitSpan) {
        el.childNodes[0].textContent = formatted;
      } else {
        el.textContent = formatted;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* -----------------------------------------------------------------------
     Init all modules
     ----------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initFaqAccordion();
    initCounterAnimation();
  });
})();
