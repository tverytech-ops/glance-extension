# Glance Link Preview

A lightweight link-preview overlay for Chromium browsers, inspired by Zen Browser's Glance.

## Features

- Modifier + click to preview links (Alt by default).
- Optional modifier + hover and middle-click triggers.
- Optional link context-menu action.
- Dark glass-style preview overlay isolated in a closed Shadow DOM.
- Reload, open-in-new-tab, Escape, and outside-click controls.
- Configurable modal dimensions and trigger preferences.
- Optional temporary, tab-scoped X-Frame-Options compatibility rule.
- SPA history and fragment navigation cleanup.
- Reduced-motion support and editable settings page.

## Security model

Glance does not remove Content-Security-Policy (CSP), the `frame-ancestors` directive, or `X-Content-Type-Options`. Declarative Net Request can remove a response header, but it cannot surgically remove only one directive from a CSP header. Removing the entire CSP header can disable important protections on the destination site.

When enabled, the compatibility option temporarily removes only `X-Frame-Options` for sub-frame responses from the active preview host and tab. It is disabled by default. The rule is removed when the preview closes or its tab is closed. This is not a guarantee that a page can be embedded.

The preview iframe uses a restrictive sandbox with scripts, forms, and popups allowed, but without `allow-same-origin`. Some sites may not function correctly in this isolated environment. Glance cannot inspect cross-origin frame contents or reliably distinguish every browser-level frame denial from a successful page load.

## Install for development

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the extension folder.
5. Open **Extension options** to customize triggers and dimensions.
6. Open a normal webpage and hold the selected modifier while clicking a link.

## Manual test checklist

1. **Install:** Load the unpacked extension and confirm that it has no manifest or service-worker errors.
2. **Default trigger:** With default settings, hold Alt and click a normal HTTP/HTTPS link. The preview should open without navigating the parent page.
3. **Editable controls:** Try links or click targets inside a text input, textarea, select, or contenteditable region. Glance should not intercept those interactions.
4. **Middle-click:** Enable the option, reload the test page, and middle-click a normal link.
5. **Hover:** Enable modifier + hover, hold the selected modifier over a link, and wait for the short hover delay.
6. **Context menu:** Right-click a link and choose **Preview link with Glance**.
7. **Close behavior:** Test the close button, Escape, and clicking the dark backdrop outside the modal.
8. **Toolbar controls:** Test reload and open-in-new-tab.
9. **Options:** Change the modifier key and modal width/height. Confirm that the saved preferences apply without reinstalling.
10. **SPA navigation:** Open a preview, then use the parent page's client-side navigation or fragment navigation. The open preview should close and release its temporary rule.
11. **Compatibility mode:** Test only on a site you trust. Enable frame compatibility and inspect the extension service-worker console for rule errors. Remember that CSP frame-ancestors can still block the page.
12. **Cleanup:** Close the preview and close the tab. Confirm no stale session rule remains in the extension's Declarative Net Request rule viewer.

## Permissions

The extension uses `storage`, `contextMenus`, `declarativeNetRequestWithHostAccess`, and `webNavigation`. It declares broad HTTP/HTTPS host access because its content script is intended to work on arbitrary websites and its optional compatibility rule must be scoped to the preview host. This broad access can produce a prominent permission disclosure in the browser and Chrome Web Store review. Consider an optional-host-permission design if the project later chooses per-site activation instead.

Browser-internal pages, extension pages, and restricted browser surfaces cannot be injected into.

## Known limitations

- Sites may prohibit embedding through CSP `frame-ancestors`, authentication requirements, browser policies, or JavaScript checks.
- Cross-origin iframe content is intentionally not inspected.
- An iframe `load` event does not prove that its document rendered successfully.
- Browser permission behavior varies between Chromium-based browsers.
- A broad host permission requires a clear user-facing justification during store review.

## Project structure

```text
manifest.json
service-worker.js
content.js
modal.css
options.html
options.css
options.js
README.md
LICENSE
```

## License

MIT. See [LICENSE](LICENSE).
