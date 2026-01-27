# Copilot Instructions for Enhanced Editor Addon

## Project Overview
This is an Anki addon (package ID: 805891399) that provides an enhanced WYSIWYG editor for Anki card fields. It bundles **TinyMCE 6** as the primary editor with custom JavaScript utilities for DOM manipulation, formatting, cloze handling, and table management.

### Architecture
- **Python Layer** (`__init__.py`, `external_js_editor_for_field.py`, `dialog.py`): Anki integration using hooks and dialog windows
- **Qt/WebView Layer** (`my_webview.py`, `dialog.py`): Custom QWebEngineView extension for rendering the editor
- **JavaScript Layer** (`web/*.js`): TinyMCE extensions and custom utilities
- **HTML Templates** (`template_tiny6_body.html`): Dynamic HTML skeleton injected with editor configuration

## Key Components

### Python Addon Entry Points
- **`__init__.py`**: Registers the addon hook on `profileLoaded` event; handles config auto-reset
- **`external_js_editor_for_field.py`**: Manages the editor dialog lifecycle, field content synchronization, and Anki event handlers (save, update, button setup)
- **`dialog.py`**: `ExtraWysiwygEditorForField` QDialog class that wraps the webview; handles window geometry persistence via `saveGeom`/`restoreGeom`
- **`my_webview.py`**: Extends `AnkiWebView` to override script/CSS loading (`bundledScript`, `bundledCSS`); uses `sync_execJavaScript` for synchronous JS execution

### Configuration System
- `config.py`: Simple getter `gc(key, fallback)` that reads from `mw.addonManager.getConfig(__name__)`
- `config.json`: Default configuration (toolbar buttons, font, font size, shortcuts)
- User can customize TinyMCE toolbars via `TinyMCE6-toolbar1` and `TinyMCE6-toolbar2` keys

### Data Flow: Opening Editor
1. Anki field is focused; user presses shortcut (default: Ctrl+Shift+0)
2. `setupEditorButtonsFilter()` hook triggers `external_editor_start(editor, "T6")`
3. `show_wysiwyg_dialog()` loads field content via `editor.note.fields[field]`
4. `maybe_pre_process_html()` replaces empty divs with comments (TinyMCE workaround)
5. HTML is templated into `template_tiny6_body.html` and rendered in MyWebView
6. User saves → `on_dialog_finished()` calls `editor_update_field()`
7. `editor._pastePreFilter()` processes images/tags; field synced via `editor.note.flush()`

### Data Flow: Saving from Editor
- TinyMCE onSave executes Python code via `editor.edited_field_content` (set by JS)
- `post_process_html()` removes fragment markers, unwraps divs if not originally wrapped, optionally minifies
- Content passed back to Anki's field editing system

## JavaScript Utilities (in `web/`)

| File | Purpose |
|------|---------|
| `dom-utilities.js` | TinyMCE menu extension: element properties, class management, formatters (empty elements, font-size stripping, heading unnesting) |
| `element-properties.js` | Dialog for inspecting/modifying element attributes and inline styles |
| `formatter.js` | Regex-based content transformations (remove line breaks, strip formatting) |
| `clozes.js` | Cloze deletion helpers (next/same cloze numbering) |
| `hilite.js` | Highlight color buttons (green, blue, red, yellow with keyboard shortcuts) |
| `tables.js` | Table creation and manipulation helpers |
| `text-patterns.js` | Auto-formatting patterns (e.g., lists, headings) |
| `toggable_headers.js` | Collapsible section headers |
| `shortcuts.js` | Custom keyboard shortcut registration |

All JS files are loaded into the webview via the template; they register with TinyMCE via `editor.ui.registry`.

## Important Patterns & Conventions

### HTML Pre/Post Processing
- **Pre-processing**: Empty `<div></div>` → `<div><!--1043915942--></div>` (prevents TinyMCE's nbsp insertion)
- **Post-processing**: Removes `<!--StartFragment-->`, unwraps auto-added divs, optional minification
- See [helpers.py](helpers.py#L25-L60) for implementation

### Anki Version Compatibility
- `anki_version_detection.py` abstracts version differences (point_version vs pointVersion)
- Dialog garbage collection differs: `mw.setupDialogGC()` (≤2.1.44) vs `mw.garbage_collect_on_dialog_finish()` (≥2.1.50)
- See [anki_version_detection.py](anki_version_detection.py) and [dialog.py](dialog.py#L36-L40)

### Web Assets Export
- `mw.addonManager.setWebExports(__name__, r"((user_files[/\\])?web[/\\].*)")` exposes `web/` folder to webview
- Custom plugin folder: `web/custom_plugins/` for additional TinyMCE plugins

### User Extensibility
- `user_files/additional_editors.py` (optional): Custom editor implementations (checked in `external_js_editor_for_field.py`)
- `user_files/additional_buttons_menuentries.py` (optional): Custom button arguments

### Bundled Dependencies
- **TinyMCE 6**: MIT licensed in `web/tinymce6/`
- **htmlmin**: Python minifier (used for optional post-processing)
- **jQuery 3.5.1**: In `web/` for any utility needs
- **sync_execJavaScript**: From Anki; enables blocking JS execution from Python

## Common Tasks

### Adding a New TinyMCE Menu Item
1. Create utility function in new JS file in `web/`
2. Register via `editor.ui.registry.addMenuButton()` or `addMenuItem()` in that file
3. Add script include in `vars.py` → `other_jsfiles` list
4. File will auto-load via MyWebView's template injection

### Modifying Editor Configuration
- Edit `config.json` for defaults
- User customizes via Anki add-on config panel
- Access in Python via `gc("key_name", fallback_value)`
- Access in template via string substitution with `%` operator

### Debugging Field Content
- Use `editor.note.fields[field_number]` to inspect raw HTML
- Check browser console in webview (right-click → Inspect)
- Log via `console.log()` in JS; appears in Anki debug console if enabled

### Image Handling
- Anki's `editor._pastePreFilter()` converts inline images to external files (perf optimization)
- **Do not** bypass this; it prevents laggy browse window after pasting
- See [external_js_editor_for_field.py](external_js_editor_for_field.py#L45-L46) comment

## Testing & Iteration
- No automated tests currently; manual testing in Anki required
- Changes to JS files: Reload addon via Anki add-on manager (or restart Anki)
- Changes to Python: Restart Anki
- Addon loads on `profileLoaded` hook (after Anki profile initializes)
