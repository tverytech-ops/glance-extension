\# Glance Link Preview Extension 🚀



A polished, high-compatibility link preview extension for Chromium-based browsers (like \*\*Helium\*\* and \*\*Chrome\*\*), inspired by \*\*Zen Browser's Glance\*\* feature.



Glance lets you preview links instantly inside a smooth, modern overlay modal on top of your current page without navigating away or opening unnecessary tabs.



\---



\## ✨ Features



\* \*\*Alt + Click Trigger:\*\* Hold `Alt` and click any link to instantly preview it in an overlay window.

\* \*\*Smooth Animations:\*\* Buttery-smooth cubic-bezier scaling and backdrop blurs.

\* \*\*Maximum Compatibility:\*\* Built-in background rule handlers that dynamically strip `X-Frame-Options` and `Content-Security-Policy` security headers so more websites can render seamlessly in frames.

\* \*\*Error \& Loading States:\*\* Clean built-in loaders and fallback buttons if a target site restricts embedding.

\* \*\*Quick Keyboard Navigation:\*\* Press `Esc` at any time to instantly dismiss the preview.

\* \*\*Quick Action Toolbar:\*\* Easily jump straight from the preview into a full browser tab with a single click.



\---



\## 🛠️ File Structure



```text

glance-extension/

├── manifest.json       # Extension configuration (Manifest V3)

├── background.js       # Dynamic network header modifier

├── content.js          # Event listener, overlay injection, and UI logic

├── styles.css          # Sleek dark-mode styling and animations

├── LICENSE             # Open-source MIT license

└── README.md           # Project documentation

