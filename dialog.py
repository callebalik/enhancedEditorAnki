from __future__ import annotations

from anki.collection import OpChanges
from anki.errors import NotFoundError
from anki.notes import NoteId
from aqt import gui_hooks, mw
from aqt.operations.note import update_note
from aqt.qt import (
    QAction,
    QCloseEvent,
    QKeySequence,
    QMainWindow,
    QMessageBox,
    QShortcut,
    Qt,
    QToolBar,
    QVBoxLayout,
    QWidget,
)
from aqt.utils import askUser, restoreGeom, saveGeom, tooltip

from .helpers import post_process_html
from .my_webview import MyWebView
from .vars import cssfiles, other_jsfiles


class ExtraWysiwygEditorForField(QMainWindow):
    """
    A non-modal editor window for editing a single Anki note field with TinyMCE.

    This window stores the note ID and field index directly (not the editor reference),
    allowing it to survive browser/editor closure and detect external note changes.
    """

    def __init__(
        self,
        note_id: NoteId,
        field_idx: int,
        original_html: str,
        bodyhtml: str,
        js_file: str,
        js_save_command: str,
        wintitle: str,
        dialogname: str,
        content_surrounded_with_div: bool,
        web_path: str,
    ):
        # Use Qt.WindowType.Window for proper standalone window behavior (like EditCurrent)
        super().__init__(None, Qt.WindowType.Window)

        self.note_id = note_id
        self.field_idx = field_idx
        self.original_html = original_html
        self.js_file = js_file
        self.content_surrounded_with_div = content_surrounded_with_div
        self.web_path = web_path
        self.js_save_command = js_save_command
        self._hook_connected = False

        self.setWindowTitle(wintitle)
        self.setMinimumSize(400, 300)

        # Central widget with layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        central_widget.setLayout(main_layout)

        # Toolbar with actions
        self._setup_toolbar()

        # WebView
        self.web = MyWebView(self, self.web_path, self.js_file)
        self.web.allowDrops = True
        self.web.title = dialogname
        self.web.contextMenuEvent = self.contextMenuEvent
        main_layout.addWidget(self.web)

        # Shortcuts
        save_shortcut = QShortcut(QKeySequence("Ctrl+Return"), self)
        save_shortcut.activated.connect(self.on_save)
        save_shortcut2 = QShortcut(QKeySequence("Ctrl+Enter"), self)
        save_shortcut2.activated.connect(self.on_save)
        save_shortcut3 = QShortcut(QKeySequence("Ctrl+S"), self)
        save_shortcut3.activated.connect(self.on_save)

        close_shortcut = QShortcut(QKeySequence("Ctrl+W"), self)
        close_shortcut.activated.connect(self.close)

        zoom_in_shortcut = QShortcut(QKeySequence("Ctrl++"), self)
        zoom_in_shortcut.activated.connect(self.web.zoom_in)
        zoom_out_shortcut = QShortcut(QKeySequence("Ctrl+-"), self)
        zoom_out_shortcut.activated.connect(self.web.zoom_out)

        # Load content into webview
        self.web.stdHtml(
            body=bodyhtml,
            css=cssfiles,
            js=[self.js_file] + other_jsfiles,
            head="",
            context=self,
        )

        # Register hook for external note changes
        gui_hooks.operation_did_execute.append(self.on_operation_did_execute)
        self._hook_connected = True

        # Restore geometry after all setup, with default size for first launch
        restoreGeom(self, "805891399_winsize", default_size=(810, 700))

        self.show()
        self.web.setFocus()

    def _setup_toolbar(self):
        """Create toolbar with Save, Cancel, and Reload actions."""
        toolbar = QToolBar("Main Toolbar")
        toolbar.setMovable(False)
        self.addToolBar(Qt.ToolBarArea.TopToolBarArea, toolbar)

        # Save action
        save_action = QAction("Save", self)
        save_action.setToolTip("Save changes and close (Ctrl+S, Ctrl+Enter)")
        save_action.triggered.connect(self.on_save)
        toolbar.addAction(save_action)

        # Cancel action
        cancel_action = QAction("Cancel", self)
        cancel_action.setToolTip("Discard changes and close")
        cancel_action.triggered.connect(self.on_cancel)
        toolbar.addAction(cancel_action)

        toolbar.addSeparator()

        # Reload Web action
        reload_web_action = QAction("Reload Web", self)
        reload_web_action.setToolTip("Reload the webview (refreshes TinyMCE)")
        reload_web_action.triggered.connect(self.reload_webview)
        toolbar.addAction(reload_web_action)

        # Reload Dev action (for template development)
        reload_dev_action = QAction("Reload Dev", self)
        reload_dev_action.setToolTip(
            "Reload template without Anki restart (development)"
        )
        reload_dev_action.triggered.connect(self.reload_template)
        toolbar.addAction(reload_dev_action)

    def _get_note(self):
        """Load note from database by ID."""
        return mw.col.get_note(self.note_id)

    def _get_editor_content(self) -> str | None:
        """Get current content from the TinyMCE editor."""
        return self.web.sync_execJavaScript(self.js_save_command)

    def _is_dirty(self) -> bool:
        """Check if TinyMCE has unsaved changes."""
        if not self.web:
            return False
        return self.web.sync_execJavaScript(
            "tinymce.activeEditor ? tinymce.activeEditor.isDirty() : false"
        )

    def on_operation_did_execute(
        self, changes: OpChanges, handler: object | None
    ) -> None:
        """Handle external note changes (e.g., from another window)."""
        if not changes.note_text or handler is self:
            return

        # Check if our note still exists and if it changed
        try:
            note = self._get_note()
        except NotFoundError:
            tooltip("Note was deleted. Closing editor.")
            self._cleanup()
            self.close()
            return

        current_db_html = note.fields[self.field_idx]

        # If the DB content changed from what we started with, we have a conflict
        if current_db_html != self.original_html:
            self._handle_conflict(current_db_html)

    def _handle_conflict(self, current_db_html: str):
        """Show conflict resolution dialog when external changes detected."""
        msg = QMessageBox(self)
        msg.setWindowTitle("External Changes Detected")
        msg.setText(
            "The note field was modified externally while you were editing.\n\n"
            "What would you like to do?"
        )
        msg.setInformativeText(
            "• Overwrite: Save your edits, discarding external changes\n"
            "• Load Current: Discard your edits, load the current version\n"
            "• Copy to Clipboard: Copy your edits, then load current version"
        )

        overwrite_btn = msg.addButton("Overwrite", QMessageBox.ButtonRole.AcceptRole)
        load_btn = msg.addButton("Load Current", QMessageBox.ButtonRole.DestructiveRole)
        copy_btn = msg.addButton("Copy to Clipboard", QMessageBox.ButtonRole.ActionRole)
        msg.addButton(QMessageBox.StandardButton.Cancel)

        msg.exec()
        clicked = msg.clickedButton()

        if clicked == overwrite_btn:
            # User wants to keep their edits - update original_html so next save works
            self.original_html = current_db_html
            tooltip("You can now save your changes.")

        elif clicked == load_btn:
            # Discard editor content, load DB version
            self._load_content_into_editor(current_db_html)
            self.original_html = current_db_html
            tooltip("Loaded current version from database.")

        elif clicked == copy_btn:
            # Copy editor content to clipboard, then load DB version
            editor_content = self._get_editor_content()
            if editor_content:
                from aqt.qt import QApplication

                clipboard = QApplication.clipboard()
                clipboard.setText(editor_content)
                tooltip("Your edits copied to clipboard.")

            self._load_content_into_editor(current_db_html)
            self.original_html = current_db_html

    def _load_content_into_editor(self, html: str):
        """Load HTML content into TinyMCE editor."""
        # Escape for JavaScript string
        escaped = html.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")
        self.web.sync_execJavaScript(
            f"tinymce.activeEditor.setContent(`{escaped}`); tinymce.activeEditor.setDirty(false);"
        )

    def on_save(self):
        """Save editor content to the note."""
        js_editor_out = self._get_editor_content()
        if not isinstance(js_editor_out, str):
            tooltip("Error getting editor content. Aborting save.")
            return

        processed_html = post_process_html(
            js_editor_out, self.content_surrounded_with_div
        )

        try:
            note = self._get_note()
        except NotFoundError:
            tooltip("Note was deleted. Cannot save.")
            self._cleanup()
            self.close()
            return

        # Check for conflicts before saving
        current_db_html = note.fields[self.field_idx]
        if current_db_html != self.original_html:
            self._handle_conflict(current_db_html)
            return  # User needs to resolve conflict first

        # Update the note field
        note.fields[self.field_idx] = processed_html

        # Use Anki's update_note operation for proper hook integration and undo support
        update_note(parent=self, note=note).success(
            lambda _: self._on_save_success()
        ).run_in_background(initiator=self)

    def _on_save_success(self):
        """Called after note is successfully saved."""
        tooltip("Saved.")
        self._cleanup()
        self.close()

    def on_cancel(self):
        """Cancel editing and close window."""
        if self._is_dirty():
            ok = askUser("Close and lose current changes?")
            if not ok:
                return
        self._cleanup()
        self.close()

    def _cleanup(self):
        """Clean up resources before closing."""
        if self._hook_connected:
            gui_hooks.operation_did_execute.remove(self.on_operation_did_execute)
            self._hook_connected = False

        saveGeom(self, "805891399_winsize")
        self.web = None
        mw.deferred_delete_and_garbage_collect(self)

    def closeEvent(self, event: QCloseEvent | None) -> None:
        """Handle window close event."""
        if self._is_dirty():
            ok = askUser("Close and lose current changes?")
            if not ok:
                event.ignore()
                return

        self._cleanup()
        event.accept()

    def reload_webview(self):
        """Reload the webview."""
        if self._is_dirty():
            ok = askUser("You have unsaved changes. Reload anyway?")
            if not ok:
                return
        self.web.reload()

    def reload_template(self):
        """Development helper: Reload template file without Anki restart."""
        import sys
        from importlib import reload

        if self._is_dirty():
            ok = askUser("You have unsaved changes. Reload template anyway?")
            if not ok:
                return

        try:
            # Force reload of external_js_editor_for_field module
            module_name = None
            for name in sys.modules:
                if "external_js_editor_for_field" in name:
                    module_name = name
                    break
            if module_name:
                reload(sys.modules[module_name])

            from .external_js_editor_for_field import get_settings

            settings = get_settings("T6")

            # Get current content before reload
            current_content = self.web.sync_execJavaScript(
                "tinymce.activeEditor ? tinymce.activeEditor.getContent() : ''"
            )

            # Rebuild HTML with fresh template
            new_body = settings["body_except_for_field_content"].replace(
                "CONTENTCONTENT", current_content
            )

            # Reload webview with new HTML
            self.web.stdHtml(
                body=new_body,
                css=cssfiles,
                js=[self.js_file] + other_jsfiles,
                head="",
                context=self,
            )

            tooltip("Template reloaded successfully!")
        except Exception as e:
            tooltip(f"Error reloading template: {str(e)}")
