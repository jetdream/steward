# Project Links

A minimal VS Code extension that adds one-click status bar buttons to open project URLs in VS Code's Simple Browser or an external browser.

## Installation

### VS Code Desktop

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `Developer: Install Extension from Location...`
3. Select the `.vscode/project-links` folder
4. Reload the window

### code-server / VS Code Server (CLI)

Create a symlink from the extension folder into the code-server extensions directory:

```bash
ln -s "$(pwd)/.vscode/project-links" ~/.local/share/code-server/extensions/project-links
```

Then reload the window (`Ctrl+Shift+P` → `Developer: Reload Window`).

To uninstall:

```bash
rm ~/.local/share/code-server/extensions/project-links
```

## Configuration

Edit `.vscode/project-links.json` in your workspace root to add or modify links:

```json
{
  "links": [
    { "label": "$(globe) App", "url": "http://localhost:5000", "priority": 100 },
    { "label": "$(database) Drizzle", "url": "https://local.drizzle.studio", "priority": 99 },
    { "label": "$(link-external) Docs", "url": "https://example.com/docs", "priority": 98, "external": true }
  ]
}
```

### Link properties

| Property | Description |
|----------|-------------|
| `label` | Status bar button text. Supports [VS Code codicons](https://code.visualstudio.com/api/references/icons-in-labels) like `$(globe)`, `$(database)`, `$(book)`, `$(server)` |
| `url` | URL to open |
| `priority` | Controls button position in the status bar (higher = further left) |
| `external` | _(Optional)_ If `true`, opens in external browser. If `false` or omitted, opens in VS Code's Simple Browser |

## Adding a new link

Add an entry to the `links` array in `.vscode/project-links.json` and reload the window (`Ctrl+Shift+P` → `Developer: Reload Window`).
