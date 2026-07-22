const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const DEFAULT_LINKS = [
  { label: "$(globe) App", url: "http://localhost:3000", priority: 100 },
  { label: "$(database) Drizzle", url: "https://local.drizzle.studio", priority: 99 },
];

function loadLinks() {
  // 1. Try workspace .vscode/project-links.json
  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    const configPath = path.join(folders[0].uri.fsPath, ".vscode", "project-links.json");
    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (Array.isArray(content.links) && content.links.length > 0) {
          return content.links;
        }
      } catch (e) {
        console.warn("project-links: failed to parse config", e.message);
      }
    }
  }

  // 2. Fallback to defaults
  return DEFAULT_LINKS;
}

function activate(context) {
  const links = loadLinks();
  const statusBarItems = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const cmdId = `projectLinks.open_${i}`;

    const disposable = vscode.commands.registerCommand(cmdId, () => {
      const uri = vscode.Uri.parse(link.url);
      if (link.external) {
        vscode.env.openExternal(uri);
      } else {
        vscode.commands.executeCommand("simpleBrowser.show", uri);
      }
    });

    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, link.priority ?? 0);
    item.text = link.label;
    item.tooltip = `Open ${link.url}${link.external ? ' (external browser)' : ''}`;
    item.command = cmdId;
    item.show();

    statusBarItems.push(item);
    context.subscriptions.push(disposable, item);
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
