(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";

  const logo = `
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M15.9 3.7a8.5 8.5 0 1 0 4.4 13.8A7.3 7.3 0 0 1 15.9 3.7Z" stroke="currentColor" stroke-width="1.5"/>
        <path d="m6.7 15.7 10.7-7.4-7.3 10.8.7-4.1-4.1.7Z" fill="currentColor"/>
      </svg>
    </span>`;

  const navHref = (anchor) => {
    if (anchor === "services") return "/services/";
    if (anchor === "process") return "/how-it-works/";
    return page === "home" ? `#${anchor}` : `/#${anchor}`;
  };

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <header class="site-header" id="siteHeader">
        <nav class="nav container" aria-label="Primary navigation">
          <a class="brand" href="/" aria-label="Midnight Travel Consulting home">
            ${logo}
            <span class="brand-copy">
              <span class="brand-name">Midnight Travel Consulting</span>
              <span class="brand-sub">Private travel desk</span>
            </span>
          </a>
          <div class="nav-links">
            <a href="${navHref("services")}" class="${page === "services" ? "active" : ""}">Services</a>
            <a href="${navHref("process")}" class="${page === "process" ? "active" : ""}">How It Works</a>
            <a href="${navHref("results")}">Results</a>
            <a href="${navHref("about")}">About</a>
            <a href="/testimonials/" class="${page === "testimonials" ? "active" : ""}">Traveler Notes</a>
            <a href="/pricing/" class="${page === "pricing" ? "active" : ""}">Pricing</a>
          </div>
          <a class="btn btn-primary" href="/consultation/">Free Consultation <span aria-hidden="true">↗</span></a>
          <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to light mode" aria-pressed="false">
            <span class="window-frame" aria-hidden="true">
              <span class="window-view"></span>
              <span class="window-shade"><span class="window-moon">🌙</span><span class="shade-handle"></span></span>
            </span>
          </button>
          <button class="menu-toggle" id="menuToggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileMenu">
            <svg viewBox="0 0 24 24" width="19" fill="none" aria-hidden="true"><path d="M4 7.5h16M4 12h16M4 16.5h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
        </nav>
        <div class="mobile-menu" id="mobileMenu">
          <div class="container">
            <a href="${navHref("services")}">Services</a>
            <a href="${navHref("process")}">How It Works</a>
            <a href="${navHref("results")}">Results</a>
            <a href="${navHref("about")}">About</a>
            <a href="/testimonials/">Traveler Notes</a>
            <a href="/pricing/">Pricing</a>
            <a href="/consultation/">Free Consultation</a>
          </div>
        </div>
      </header>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <div>
              <a class="brand" href="/">
                ${logo}
                <span class="brand-copy"><span class="brand-name">Midnight Travel Consulting</span><span class="brand-sub">Travel, intelligently managed</span></span>
              </a>
              <p class="footer-copy">Independent flight research, booking support, points guidance, loyalty consulting, and travel-spend optimization.</p>
            </div>
            <div class="footer-col">
              <strong>Navigate</strong>
              <a href="/">Home</a>
              <a href="/pricing/">Pricing</a>
              <a href="/consultation/">Free Consultation</a>
            </div>
            <div class="footer-col">
              <strong>Explore</strong>
              <a href="${navHref("services")}">Services</a>
              <a href="${navHref("process")}">How It Works</a>
              <a href="/testimonials/">Traveler Notes</a>
              <a href="${navHref("results")}">Experience</a>
              <a href="${navHref("about")}">About</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© <span id="year"></span> Midnight Travel Consulting. All rights reserved.</span>
            <span>Independent travel consulting and booking support. Airfare is presented without a consulting markup. Airline pricing, availability, rules, benefits, and loyalty-program outcomes remain subject to the applicable provider.</span>
          </div>
        </div>
      </footer>`;
  }

  const siteHeader = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const themeToggle = document.getElementById("themeToggle");

  const updateThemeToggle = () => {
    const light = root.dataset.theme === "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", light ? "#e7edf5" : "#05070d");
    themeToggle?.setAttribute("aria-pressed", String(light));
    themeToggle?.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  };
  updateThemeToggle();
  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    const applyTheme = () => {
      root.dataset.theme = nextTheme;
      localStorage.setItem("mtc-theme", nextTheme);
      updateThemeToggle();
    };

    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  });

  const updateHeader = () => siteHeader?.classList.toggle("scrolled", window.scrollY > 10);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 65}ms`;
    revealObserver.observe(el);
  });

  document.querySelectorAll(".faq-item").forEach((item) => {
    const button = item.querySelector(".faq-q");
    const answer = item.querySelector(".faq-a");
    button?.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-q")?.setAttribute("aria-expanded", "false");
        const otherAnswer = other.querySelector(".faq-a");
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });
      if (!wasOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = `${answer.scrollHeight + 24}px`;
      }
    });
  });

  const formatValue = (value, el) => {
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    return `${prefix}${Math.round(value).toLocaleString("en-US")}${suffix}`;
  };

  const scrambleStat = (el) => {
    const target = Number(el.dataset.value || 0);
    const duration = 1350;
    const start = performance.now();
    const final = formatValue(target, el);
    const chars = "0123456789";
    let lastSwap = 0;

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const current = target * eased;
      let display = formatValue(current, el);

      if (p < .82 && now - lastSwap > 45) {
        display = display.split("").map((ch) => /\d/.test(ch) && Math.random() < .35 ? chars[Math.floor(Math.random() * 10)] : ch).join("");
        lastSwap = now;
      }

      el.textContent = p >= 1 ? final : display;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      scrambleStat(entry.target);
      statObserver.unobserve(entry.target);
    });
  }, { threshold: .6 });
  document.querySelectorAll("[data-value]").forEach((el) => statObserver.observe(el));

  const logoExtensions = ["webp", "png", "jpg", "jpeg"];
  document.querySelectorAll("img[data-logo]").forEach((img) => {
    const name = img.dataset.logo;
    let extensionIndex = 0;
    const tryNextLogo = () => {
      if (extensionIndex >= logoExtensions.length) {
        img.removeAttribute("src");
        img.classList.remove("loaded");
        return;
      }
      img.src = `/assets/logos/${name}.${logoExtensions[extensionIndex++]}`;
    };
    img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
    img.addEventListener("error", tryNextLogo);
    tryNextLogo();
  });

  document.getElementById("year")?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));
})();
