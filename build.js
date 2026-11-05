const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const output = path.join(root, "dist");
const sharedFiles = ["popup.html", "popup.css", "popup.js", "config.js"];

function build(browser) {
  const destination = path.join(output, browser);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });

  for (const file of sharedFiles) {
    fs.copyFileSync(path.join(root, file), path.join(destination, file));
  }

  const manifest = browser === "firefox"
    ? "manifest.firefox.json"
    : "manifest.json";

  fs.copyFileSync(
    path.join(root, manifest),
    path.join(destination, "manifest.json"),
  );

  console.log("Built " + browser + " extension: dist/" + browser);
}

build("chrome");
build("firefox");
