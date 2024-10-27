// shortcuts.js

function defineShortcuts(editor) {
    editor.addShortcut("Ctrl+107", 'Superscript', 'Superscript');
    editor.addShortcut("Ctrl+187", 'Subscript', 'Subscript');
    editor.addShortcut("Ctrl+r", 'RemoveFormat', 'RemoveFormat');
    editor.addShortcut("Ctrl+Shift+X", 'mceCodeEditor', 'mceCodeEditor');

    editor.addShortcut('Ctrl+M', 'indent', 'Indent');
    editor.addShortcut('Ctrl+Alt+M', 'outdent', 'Outdent');

    // editor.addShortcut("F7", "nextCloze", "nextCloze");  // nextCloze defined above
    // editor.addShortcut("F8", "addCloze", "sameCloze");  // sameCloze defined above
    editor.addShortcut("F9", "InsertUnorderedList", "InsertUnorderedList");
    editor.addShortcut("F10", "InsertOrderedList", "InsertOrderedList");
    editor.addShortcut("F11", "Subscript", "Subscript");
    editor.addShortcut("F12", "Superscript", "Superscript");

    editor.addShortcut("Ctrl+E", "Special character", function() {editor.execCommand("mceShowCharmap");});
    editor.addShortcut("Alt+39", "Insert → (Alt+ArrowRight)", function () {editor.execCommand("mceInsertContent", 0, "→");});
    editor.addShortcut("Shift+Alt+39", "Insert ⇒ (Shift+Alt+ArrowRight)", function () {editor.execCommand("mceInsertContent", 0, "⇒");});
    editor.addShortcut("Ctrl+Alt+39", "Insert ↔ (Ctrl+Alt+ArrowRight)", function () {editor.execCommand("mceInsertContent", 0, "↔");});
    editor.addShortcut("Ctrl+Shift+Alt+39", "Insert ⇔ (Ctrl+Shift+Alt+ArrowRight)", function () {editor.execCommand("mceInsertContent", 0, "⇔");});
    editor.addShortcut("Alt+37", "Insert ← (Alt+ArrowLeft)", function () {editor.execCommand("mceInsertContent", 0, "←");});
    editor.addShortcut("Shift+Alt+37", "Insert ⇐ (Shift+Alt+ArrowLeft)", function () {editor.execCommand("mceInsertContent", 0, "⇐");});
    editor.addShortcut("Alt+38", "Insert ↑ (Alt+ArrowUp)", function () {editor.execCommand("mceInsertContent", 0, "↑");});
    editor.addShortcut("Shift+Alt+38", "Insert ⇑ (Shift+Alt+ArrowUp)", function () {editor.execCommand("mceInsertContent", 0, "⇑");});
    editor.addShortcut("Alt+40", "Insert ↓ (Alt+ArrowDown)", function () {editor.execCommand("mceInsertContent", 0, "↓");});
    editor.addShortcut("Shift+Alt+40", "Insert ⇓ (Shift+Alt+ArrowDown)", function () {editor.execCommand("mceInsertContent", 0, "⇓");});
    editor.addShortcut("Alt+A", "Insert α (Alt+A)", function () {editor.execCommand("mceInsertContent", 0, "α");});
    editor.addShortcut("Alt+Shift+A", "Insert Α (Alt+Shift+A)", function () {editor.execCommand("mceInsertContent", 0, "Α");});
    editor.addShortcut("Alt+B", "Insert β (Alt+B)", function () {editor.execCommand("mceInsertContent", 0, "β");});
    editor.addShortcut("Alt+Shift+B", "Insert β (Alt+Shift+B)", function () {editor.execCommand("mceInsertContent", 0, "β");});
    editor.addShortcut("Alt+G", "Insert γ (Alt+G)", function () {editor.execCommand("mceInsertContent", 0, "γ");});

    editor.addShortcut("Alt+D", "Insert δ (Alt+D)", function () {editor.execCommand("mceInsertContent", 0, "δ");});
    editor.addShortcut("Alt+E", "Insert ε (Alt+E)", function () {editor.execCommand("mceInsertContent", 0, "ε");});
    editor.addShortcut("Ctrl+Alt+39", "Insert ∴ (therefore) (Ctrl+Alt+ArrowRight)", function () {editor.execCommand("mceInsertContent", 0, "∴");});
    editor.addShortcut("Ctrl+Alt+U", "Upper case (Ctrl+Alt+U)", function () {editor.execCommand("mceInsertRawHTML", 0, editor.selection.getContent({ format: "html" }).toUpperCase());});
    editor.addShortcut("Ctrl+Alt+L", "Lower case (Ctrl+Alt+L)", function () {editor.execCommand("mceInsertRawHTML", 0, editor.selection.getContent({ format: "html" }).toLowerCase());});

    // Remap Heading 1-6 from Ctrl+Alt+1-6 to Ctrl+Shift+1-6 to avoid conflict with browser shortcuts, especially Ctrl+Alt+2 becoming "
    // this get's only the selected content
//   editor.addShortcut("Ctrl+Shift+1", "Heading 1", function () {editor.execCommand("mceInsertContent", 0, "<h1>" + editor.selection.getContent({ format: "html" }) + "</h1>");});
    editor.addShortcut("Alt+F1", "h1 current block", function () {editor.execCommand("mceToggleFormat", false, "h1");});
    editor.addShortcut("Alt+F2", "h2 current block", function () {editor.execCommand("mceToggleFormat", false, "h2");});
    editor.addShortcut("Alt+F3", "h3 current block", function () {editor.execCommand("mceToggleFormat", false, "h3");});
    editor.addShortcut("Alt+F4", "h4 current block", function () {editor.execCommand("mceToggleFormat", false, "h4");});
    editor.addShortcut("Alt+F5", "h5 current block", function () {editor.execCommand("mceToggleFormat", false, "h5");});
    editor.addShortcut("Alt+F6", "h6 current block", function () {editor.execCommand("mceToggleFormat", false, "h6");});

    //         In TinyMCE, the execCommand method is used to execute a command on the current editor instance. The method takes three arguments:

    // command: The name of the command to execute.
    // ui: A boolean indicating whether the command should be executed in the UI context. If true, the command is executed in the UI context. If false, the command is executed in the non-UI context.
    // value: The value to pass to the command.

    // Add shortcut to show visual blocks (cmd mceVisualBlocks) and insvisible characters (cmd mceVisualChars)
    editor.addShortcut("Ctrl+Shift+Alt+V", "VisualBlocks", function () {editor.execCommand("mceVisualBlocks");});
    editor.addShortcut("Ctrl+Shift+Alt+I", "VisualChars", function () {editor.execCommand("mceVisualChars");});
}

function shortcutsMain(editor) {
    // Add shortcuts
    defineShortcuts(editor);
}