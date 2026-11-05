# 0FluffCapture

A lightweight browser extension for quickly saving the current tab to your 0FluffStart dashboard.

## Status

Early development. The companion requires the matching 0FluffStart development build with its external capture bridge enabled.

## Build

Requires Node.js. No dependencies are needed.

```sh
node build.js
```

This creates two unpacked extension directories:

- `dist/chrome`
- `dist/firefox`

## Install for testing

### Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Select **Load unpacked**.
4. Choose the `dist/chrome` directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Choose `dist/firefox/manifest.json`.

## Connection setup

The Firefox companion ID is configured in the main 0FluffStart development bridge. Chrome requires the published or locally installed companion extension ID to be added to the main extension's allowlist, and the main 0FluffStart Chrome extension ID must be entered in `config.js`.

The main extension must be installed and opened at least once before captures can be saved.

## Privacy

0FluffCapture has no backend, analytics, accounts, or third-party scripts. It sends the current page title and URL directly to the installed 0FluffStart extension.
