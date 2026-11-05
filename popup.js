const api = globalThis.browser || globalThis.chrome;
const isFirefox = Boolean(globalThis.browser);
const mainExtensionId = isFirefox
  ? MAIN_EXTENSION_IDS.firefox
  : MAIN_EXTENSION_IDS.chrome;

const titleInput = document.getElementById("page-title");
const pageUrl = document.getElementById("page-url");
const folderSelect = document.getElementById("folder-select");
const newFolderInput = document.getElementById("new-folder");
const saveButton = document.getElementById("save-button");
const status = document.getElementById("status");

let currentTab = null;
let ready = false;

function setStatus(message, kind = "") {
  status.textContent = message;
  status.className = "status" + (kind ? " " + kind : "");
}

function sendToMain(message) {
  if (!mainExtensionId) {
    return Promise.reject(new Error("MAIN_EXTENSION_NOT_CONFIGURED"));
  }
  return api.runtime.sendMessage(mainExtensionId, message);
}

function errorMessage(code) {
  const messages = {
    MAIN_EXTENSION_NOT_CONFIGURED: "The 0FluffStart extension ID hasn't been configured yet.",
    STORE_NOT_INITIALIZED: "Open 0FluffStart once, then try again.",
    UNAUTHORIZED_SENDER: "0FluffStart hasn't been configured to trust this companion yet.",
    INVALID_DESTINATION: "That folder no longer exists. Refresh and try again.",
    FOLDER_DEPTH_LIMIT: "That folder is already at the maximum nesting level.",
    INVALID_NAME: "Enter a page title with 1 to 50 characters.",
    INVALID_FOLDER_NAME: "Folder names must be 1 to 50 characters.",
    INVALID_URL: "This page can't be saved. Only HTTP and HTTPS pages are supported."
  };
  return messages[code] || "Couldn't connect to 0FluffStart. Make sure it's installed and enabled.";
}

function setBusy(busy) {
  saveButton.disabled = busy || !ready;
  saveButton.textContent = busy ? "Saving…" : "Save page";
}

function applyTheme(theme) {
  const lightThemes = new Set(["light", "latte", "rose-pine-dawn", "solarized-light"]);
  document.documentElement.classList.toggle("light", lightThemes.has(theme));
}

function renderFolders(folders) {
  folderSelect.replaceChildren(new Option("No folder", ""));
  for (const folder of folders) {
    const indent = "　".repeat(Math.max(0, folder.depth - 1));
    folderSelect.add(new Option(indent + folder.name, folder.id));
  }
}

async function initialize() {
  try {
    const [tabs] = await api.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs;

    if (!tabs?.url || !/^https?:\/\//i.test(tabs.url)) {
      setStatus("This page type can't be saved. Open a regular website.", "error");
      return;
    }

    titleInput.value = (tabs.title || tabs.url).slice(0, 50);
    pageUrl.textContent = tabs.url;

    const data = await sendToMain({ type: "0FLUFF_CAPTURE_GET_DATA" });
    if (!data?.ok) throw new Error(data?.error || "CONNECTION_FAILED");

    renderFolders(data.folders || []);
    applyTheme(data.theme || "dark");
    ready = true;
    setBusy(false);
  } catch (error) {
    setStatus(errorMessage(error.message), "error");
  }
}

saveButton.addEventListener("click", async () => {
  if (!currentTab?.url) return;

  const name = titleInput.value.trim();
  const createFolderName = newFolderInput.value.trim();
  if (!name || name.length > 50) {
    setStatus(errorMessage("INVALID_NAME"), "error");
    return;
  }
  if (createFolderName.length > 50) {
    setStatus(errorMessage("INVALID_FOLDER_NAME"), "error");
    return;
  }

  setBusy(true);
  setStatus("Saving to 0FluffStart…");

  try {
    const result = await sendToMain({
      type: "0FLUFF_CAPTURE_SAVE",
      name,
      url: currentTab.url,
      parentId: folderSelect.value || null,
      createFolderName
    });

    if (!result?.ok) throw new Error(result?.error || "SAVE_FAILED");
    setStatus("Saved to 0FluffStart.", "success");
    saveButton.textContent = "Saved";
  } catch (error) {
    setStatus(errorMessage(error.message), "error");
    setBusy(false);
  }
});

initialize();
