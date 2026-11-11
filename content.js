(() => {
  "use strict";
  if (window.top !== window || document.getElementById("glance-shadow-host")) return;

  const DEFAULTS = { altClick: true, hoverAlt: false, middleClick: false, frameStripping: false, modalWidth: 88, modalHeight: 88 };
  let prefs = { ...DEFAULTS };
  chrome.storage.sync.get(DEFAULTS).then(v => { prefs = { ...DEFAULTS, ...v }; applySize(); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, change] of Object.entries(changes)) prefs[key] = change.newValue;
    applySize();
  });

  const state = { active: false, url: "", timer: 0, hoverTimer: 0, previousOverflow: "", previousFocus: null, hoverAnchor: null };
  const host = document.createElement("div");
  host.id = "glance-shadow-host";
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;inset:0;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "closed" });
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = chrome.runtime.getURL("modal.css");
  shadow.append(stylesheet);
  const shell = document.createElement("div");
  shell.innerHTML = `
    <div id="glance-overlay" aria-hidden="true">
      <section id="glance-modal" role="dialog" aria-modal="true" aria-label="Link preview">
        <header id="glance-header"><div class="meta"><span class="dot"></span><div class="title" id="glance-title">Loading preview</div></div>
          <div class="actions"><button class="btn" id="glance-reload" type="button" title="Reload preview">↻ <span>Reload</span></button><button class="btn open" id="glance-open" type="button" title="Open in new tab">↗ <span>Open tab</span></button><button class="btn close" id="glance-close" type="button" title="Close preview (Esc)" aria-label="Close preview">×</button></div>
        </header>
        <div id="glance-body"><div class="skeleton" id="glance-skeleton"><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i></div>
          <div id="glance-loading"><span class="spinner"></span><span>Loading preview…</span></div>
          <div id="glance-message" hidden><div class="message-title">This page may not allow previews</div><div class="message-copy" id="glance-message-copy">The website may block being displayed inside another page.</div><button class="primary" id="glance-message-open" type="button">Open in new tab</button><span class="hint">Glance cannot bypass every website restriction.</span></div>
          <iframe id="glance-frame" title="Website preview" sandbox="allow-scripts allow-forms allow-popups" referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
      </section>
    </div>`;
  shadow.append(shell);
  document.documentElement.append(host);
  const $ = id => shadow.getElementById(id);
  const overlay = $("glance-overlay"), frame = $("glance-frame"), title = $("glance-title");
  const loading = $("glance-loading"), skeleton = $("glance-skeleton"), message = $("glance-message");

  function applySize() {
    if (!$("glance-modal")) return;
    $("glance-modal").style.setProperty("--glance-width", Math.max(55, Math.min(98, Number(prefs.modalWidth) || 88)) + "vw");
    $("glance-modal").style.setProperty("--glance-height", Math.max(55, Math.min(98, Number(prefs.modalHeight) || 88)) + "vh");
  }
  function allowedUrl(raw) {
    try { const u = new URL(raw, location.href); return ["http:", "https:"].includes(u.protocol) ? u.href : ""; }
    catch (_) { return ""; }
  }
  function linkFrom(target) {
    const el = target instanceof Element ? target : target?.parentElement;
    return el?.closest("a[href]") || null;
  }
  function editable(target) {
    const el = target instanceof Element ? target : target?.parentElement;
    return !!el?.closest('input,textarea,select,button,[contenteditable=""],[contenteditable="true"],[role="textbox"],[role="button"],[data-glance-ignore]');
  }
  function startTimer() {
    clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      if (!state.active || !loading.hidden) {
        loading.hidden = true; skeleton.hidden = true; message.hidden = false;
        $("glance-message-copy").textContent = "The page did not finish loading in time, or the website may block embedding. Try opening it in a new tab.";
      }
    }, 18000);
  }
  function navigate(url) {
    state.url = url;
    title.textContent = new URL(url).hostname;
    title.title = url;
    loading.hidden = false; skeleton.hidden = false; message.hidden = true;
    clearTimeout(state.timer);
    frame.src = "about:blank";
    requestAnimationFrame(() => { if (state.active) frame.src = url; });
    chrome.runtime.sendMessage({ type: "GLANCE_PREVIEW_START", url }).catch(() => {});
    startTimer();
  }
  function openPreview(raw) {
    const url = allowedUrl(raw);
    if (!url) return;
    if (!state.active) {
      state.previousFocus = document.activeElement;
      state.previousOverflow = document.documentElement.style.overflow;
      state.active = true;
      overlay.classList.add("active"); overlay.setAttribute("aria-hidden", "false");
      overlay.style.pointerEvents = "auto";
      document.documentElement.style.overflow = "hidden";
    }
    applySize(); navigate(url); $("glance-close").focus();
  }
  function closePreview() {
    if (!state.active) return;
    state.active = false; clearTimeout(state.timer);
    overlay.classList.remove("active"); overlay.setAttribute("aria-hidden", "true");
    overlay.style.pointerEvents = "none";
    document.documentElement.style.overflow = state.previousOverflow;
    frame.src = "about:blank"; loading.hidden = true; skeleton.hidden = true; message.hidden = true;
    chrome.runtime.sendMessage({ type: "GLANCE_PREVIEW_END" }).catch(() => {});
    if (state.previousFocus?.isConnected) state.previousFocus.focus({ preventScroll: true });
  }
  function openTab() {
    if (!state.url) return;
    window.open(state.url, "_blank", "noopener,noreferrer");
    closePreview();
  }
  $("glance-close").addEventListener("click", closePreview);
  $("glance-open").addEventListener("click", openTab);
  $("glance-message-open").addEventListener("click", openTab);
  $("glance-reload").addEventListener("click", () => state.url && navigate(state.url));
  overlay.addEventListener("click", e => { if (e.target === overlay) closePreview(); });
  frame.addEventListener("load", () => {
    if (!state.active) return;
    clearTimeout(state.timer); loading.hidden = true; skeleton.hidden = true;
    // Cross-origin load events do not prove the remote page rendered successfully.
  });
  document.addEventListener("click", e => {
    if (editable(e.target) || !prefs.altClick || !e.altKey || e.button !== 0) return;
    const a = linkFrom(e.target), url = a && allowedUrl(a.href);
    if (!url) return;
    e.preventDefault(); e.stopPropagation(); openPreview(url);
  }, true);
  document.addEventListener("auxclick", e => {
    if (e.button !== 1 || editable(e.target) || !prefs.middleClick) return;
    const a = linkFrom(e.target), url = a && allowedUrl(a.href);
    if (!url) return;
    e.preventDefault(); e.stopPropagation(); openPreview(url);
  }, true);
  document.addEventListener("mouseover", e => {
    if (editable(e.target) || !prefs.hoverAlt || !e.altKey) return;
    const a = linkFrom(e.target), url = a && allowedUrl(a.href);
    if (!url || a === state.hoverAnchor) return;
    state.hoverAnchor = a; clearTimeout(state.hoverTimer);
    state.hoverTimer = setTimeout(() => openPreview(url), 550);
  }, true);
  document.addEventListener("mouseout", e => {
    if (e.relatedTarget && e.target?.contains?.(e.relatedTarget)) return;
    clearTimeout(state.hoverTimer);
  }, true);
  document.addEventListener("keydown", e => {
    if (!state.active) return;
    if (e.key === "Escape") { e.preventDefault(); closePreview(); }
    if (e.key === "Tab") {
      const controls = [$("glance-reload"), $("glance-open"), $("glance-close")];
      if (e.shiftKey && shadow.activeElement === controls[0]) { e.preventDefault(); controls[2].focus(); }
      else if (!e.shiftKey && shadow.activeElement === controls[2]) { e.preventDefault(); controls[0].focus(); }
    }
  }, true);
  chrome.runtime.onMessage.addListener(m => { if (m?.type === "GLANCE_OPEN") openPreview(m.url); });
})();