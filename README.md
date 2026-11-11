# Glance Link Preview

A lightweight link-preview overlay for Chromium browsers, inspired by Zen Browser's Glance.

## Features
- Alt + click to preview links (default).
- Optional Alt + hover, middle-click, and link context-menu triggers.
- Dark animated overlay isolated with Shadow DOM.
- Reload, open-in-new-tab, Escape, and outside-click controls.
- Configurable modal dimensions and trigger preferences.
- Optional temporary host-scoped X-Frame-Options compatibility rule.
- Reduced-motion support and editable settings page.

## Security model
Glance does not remove Content-Security-Policy, frame-ancestors, or X-Content-Type-Options. Removing an entire CSP header can disable important destination-site protections.

When enabled, the compatibility option temporarily removes only X-Frame-Options for sub-frame responses from the currently previewed host. It is disabled by default. The rule is removed when the preview closes or the browser starts. This is not a guarantee that a page can be embedded.

The preview iframe uses a restrictive sandbox with scripts, forms, and popups allowed, but without allow-same-origin. Some sites may not function correctly in this isolated environment. Glance cannot inspect cross-origin frame contents or reliably distinguish every browser-level frame denial from a successful page load.

## Install for development
1. Clone or download this repository.
2. Open chrome://extensions.
3. Enable Developer mode.
4. Select Load unpacked and choose the repository folder.
5. Open Extension options to customize triggers and dimensions.
6. Visit a page with links and hold Alt while clicking a link.

## Permissions
The extension uses storage, contextMenus, and Declarative Net Request for the optional temporary X-Frame-Options rule. It declares broad host access because the content script is designed to run on arbitrary websites. Browser-internal pages and restricted surfaces cannot be injected into.

## Known limitations
- Sites may prohibit embedding through CSP frame-ancestors, authentication requirements, browser policies, or JavaScript checks.
- Cross-origin iframe content is intentionally not inspected.
- An iframe load event does not prove that its document rendered successfully.
- Permission behavior varies between Chromium-based browsers.

## Project structure
manifest.json, service-worker.js, content.js, modal.css, options.html, options.css, options.js, README.md, LICENSE.
