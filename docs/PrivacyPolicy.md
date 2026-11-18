# Privacy Policy for Helium Inline Translator

Updated: November 18, 2026

Helium Inline Translator ("Extension") is developed and maintained by Wesley Martins ("we", "our", "us"). This privacy policy explains how the Extension handles data when you install and use it in Chromium-based browsers such as Google Chrome or Microsoft Edge.

## Data Collection and Storage

- The Extension sends one kind of data outside your browser: the content you ask it to translate. Translating a page sends the text of that page; translating a selection sends the selected text.
- That content is sent to `translate.googleapis.com`, Google's public translation endpoint, and is used only to return the translation. Nothing is sent while a translation is not running.
- No browsing history, account details, or identifiers are collected, stored, or sold by the Extension.
- Your preferences (theme, favorite languages, target language) are saved locally using `chrome.storage.sync`. This storage is encrypted by the browser and synchronized between your signed-in devices, subject to the browser vendor's policies.

## Permissions Justification

- `contextMenus`: used to expose translation actions via the right-click menu.
- `storage`: required to persist your preferences (`chrome.storage.sync`).
- Content script on all sites: required to read page text and write the translation back into the page. It is the same script for every site and requests no additional data.

## Third-Party Services

Translation requests are handled by Google Translate, which processes them under its own privacy policy. The Extension does not integrate analytics, advertising, or tracking services. It is not affiliated with, endorsed, or sponsored by Google.

## Data Sharing

The content you translate is shared with Google as described above. No other data is shared, sold, or traded with third parties.

## Security

Translation requests are sent over HTTPS. Apart from the content sent for translation, the Extension does not transmit data to external servers.

## Children’s Privacy

The Extension is not directed to children under the age of 13. It does not knowingly collect personal information from children.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted in the public repository, and the "Updated" date will reflect the most recent revision.
