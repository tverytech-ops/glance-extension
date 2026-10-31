(function () {
  if (window.self !== window.top) return;

  let activeUrl = "";
  let loadTimeout = null;

  // Build Structured UI Elements
  const overlay = document.createElement("div");
  overlay.id = "glance-overlay";

  overlay.innerHTML = `
    <div id="glance-modal">
      <div id="glance-header">
        <div class="glance-meta">
          <div id="glance-indicator" title="Active connection"></div>
          <span id="glance-title">Loading preview...</span>
        </div>
        <div id="glance-actions">
          <button class="glance-btn" id="glance-open-tab" title="Open in new tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Open Tab
          </button>
          <button class="glance-btn glance-icon-btn" id="glance-close" title="Close (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div id="glance-body-container">
        <div id="glance-loader">
          <div class="glance-spinner"></div>
          <span style="font-size: 13px; color: #9ca3af;">Fetching preview...</span>
        </div>
        <div id="glance-error" class="hidden">
          <h3>Unable to Embed Website</h3>
          <p id="glance-error-msg">This target page actively restricts inline embedding or took too long to respond.</p>
          <button class="glance-primary-btn" id="glance-fallback-tab">Open in New Tab Instead</button>
        </div>
        <iframe id="glance-iframe" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const iframe = overlay.querySelector("#glance-iframe");
  const title = overlay.querySelector("#glance-title");
  const loader = overlay.querySelector("#glance-loader");
  const errorScreen = overlay.querySelector("#glance-error");
  const closeBtn = overlay.querySelector("#glance-close");
  const openTabBtn = overlay.querySelector("#glance-open-tab");
  const fallbackTabBtn = overlay.querySelector("#glance-fallback-tab");

  // Event: Intercept Alt + Click
  document.addEventListener("click", (e) => {
    if (!e.altKey) return;

    const anchor = e.target.closest("a");
    if (anchor && anchor.href && anchor.href.startsWith("http")) {
      e.preventDefault();
      e.stopPropagation();
      openGlance(anchor.href);
    }
  }, true);

  function openGlance(url) {
    activeUrl = url;
    title.textContent = url;
    errorScreen.classList.add("hidden");
    loader.classList.remove("hidden");
    iframe.src = "about:blank";

    overlay.classList.add("glance-active");
    document.body.style.overflow = "hidden"; // Prevent background page scrolling

    // Load URL into iframe after small tick for smooth render transition
    setTimeout(() => {
      iframe.src = url;
    }, 100);

    // Safety timeout: if site blocks iframe or fails to report load within 6 seconds, show error screen
    clearTimeout(loadTimeout);
    loadTimeout = setTimeout(() => {
      if (overlay.classList.contains("glance-active") && !iframe.contentDocument) {
        loader.classList.add("hidden");
        errorScreen.classList.remove("hidden");
      }
    }, 6000);
  }

  iframe.addEventListener("load", () => {
    clearTimeout(loadTimeout);
    loader.classList.add("hidden");
  });

  function closeGlance() {
    overlay.classList.remove("glance-active");
    document.body.style.overflow = "";
    clearTimeout(loadTimeout);
    setTimeout(() => {
      iframe.src = "about:blank";
      errorScreen.classList.add("hidden");
    }, 250); // Clear source after close animation completes
  }

  // Action Bindings
  closeBtn.addEventListener("click", closeGlance);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeGlance();
  });

  // Keyboard shortcut support (Escape key or Ctrl+Backspace/Alt+W options)
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("glance-active")) return;
    
    if (e.key === "Escape") {
      e.preventDefault();
      closeGlance();
    }
  });

  openTabBtn.addEventListener("click", () => {
    if (activeUrl) {
      window.open(activeUrl, "_blank");
      closeGlance();
    }
  });

  fallbackTabBtn.addEventListener("click", () => {
    if (activeUrl) {
      window.open(activeUrl, "_blank");
      closeGlance();
    }
  });
})();