from aqt import mw
from aqt.qt import (
    QDialog,
    QDialogButtonBox,
    QHBoxLayout,
    QKeySequence,
    QMetaObject,
    QPushButton,
    QShortcut,
    Qt,
    QVBoxLayout,
)
from aqt.utils import askUser, restoreGeom, saveGeom

from .anki_version_detection import anki_point_version
from .helpers import post_process_html
from .my_webview import MyWebView
from .vars import cssfiles, other_jsfiles


class ExtraWysiwygEditorForField(QDialog):
    def __init__(
        self,
        editor,
        bodyhtml,
        js_file,
        js_save_command,
        wintitle,
        dialogname,
        content_surrounded_with_div,
        web_path,
    ):
        # editor.widget is self.form.fieldsArea which is a QWidget
        super(ExtraWysiwygEditorForField, self).__init__(editor.widget)

        if anki_point_version <= 44:
            mw.setupDialogGC(self)
        else:
            mw.garbage_collect_on_dialog_finish(self)

        self.js_file = js_file
        self.content_surrounded_with_div = content_surrounded_with_div
        self.web_path = web_path
        self.js_save_command = js_save_command
        self.editor = editor
        self.parent = editor.parentWindow
        self.setWindowTitle(wintitle)
        self.resize(810, 700)
        # Restore the window size and position
        restoreGeom(self, "805891399_winsize")

        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        self.setLayout(main_layout)
        self.web = MyWebView(self, self.web_path, self.js_file)
        self.web.allowDrops = True  # default in webview/AnkiWebView is False
        self.web.title = dialogname
        self.web.contextMenuEvent = self.contextMenuEvent
        main_layout.addWidget(self.web)

        self.buttonBox = QDialogButtonBox(self)
        self.buttonBox.setOrientation(Qt.Orientation.Horizontal)
        self.buttonBox.setStandardButtons(
            QDialogButtonBox.StandardButton.Cancel
            | QDialogButtonBox.StandardButton.Save
        )
        main_layout.addWidget(self.buttonBox)

        # Add maximize, reload webview, reload template, and reload backend buttons
        maximize_button = QPushButton("Maximize")
        maximize_button.clicked.connect(self.maximize_window)
        reload_webview_button = QPushButton("Reload Webview")
        reload_webview_button.clicked.connect(self.reload_webview)
        reload_template_button = QPushButton("Reload Template (Dev)")
        reload_template_button.clicked.connect(self.reload_template)
        reload_backend_button = QPushButton("Reload Backend")
        reload_backend_button.clicked.connect(self.reload_backend)
        button_layout = QHBoxLayout()
        button_layout.addWidget(maximize_button)
        button_layout.addWidget(reload_webview_button)
        button_layout.addWidget(reload_template_button)
        button_layout.addWidget(reload_backend_button)
        main_layout.addLayout(button_layout)

        # Add a shortcut for maximizing the window
        maximize_shortcut = QShortcut(QKeySequence("Win+F11"), self)
        maximize_shortcut.activated.connect(self.maximize_window)

        self.buttonBox.accepted.connect(self.onAccept)
        self.buttonBox.rejected.connect(self.onReject)
        QMetaObject.connectSlotsByName(self)
        accept_shortcut = QShortcut(QKeySequence("Ctrl+Return"), self)
        accept_shortcut.activated.connect(self.onAccept)

        zoom_in_shortcut = QShortcut(QKeySequence("Ctrl++"), self)
        zoom_in_shortcut.activated.connect(self.web.zoom_in)

        zoom_out_shortcut = QShortcut(QKeySequence("Ctrl+-"), self)
        zoom_out_shortcut.activated.connect(self.web.zoom_out)

        self.web.stdHtml(
            body=bodyhtml,
            css=cssfiles,
            js=[self.js_file] + other_jsfiles,
            head="",
            context=self,
        )

    def onAccept(self):
        js_editor_out = self.web.sync_execJavaScript(self.js_save_command)
        self.editor.edited_field_content = post_process_html(
            js_editor_out, self.content_surrounded_with_div
        )
        self.web = None
        # self.web._page.windowCloseRequested()  # native qt signal not callable
        # self.web._page.windowCloseRequested.connect(self.web._page.window_close_requested)
        saveGeom(self, "805891399_winsize")
        self.accept()
        # self.done(0)

    def onReject(self):
        ok = askUser("Close and lose current input?")
        if ok:
            saveGeom(self, "805891399_winsize")
            self.web = None
            self.reject()

    def closeEvent(self, event):
        ok = askUser("Close and lose current input?")
        if ok:
            self.web = None
            event.accept()
        else:
            event.ignore()

    def maximize_window(self):
        self.showMaximized()

    def reload_webview(self):
        # Check if TinyMCE has unsaved changes
        is_dirty = self.web.sync_execJavaScript(
            "tinymce.activeEditor ? tinymce.activeEditor.isDirty() : false"
        )

        if is_dirty:
            ok = askUser(
                "You have unsaved changes. Are you sure you want to reload the webview?"
            )
            if not ok:
                return

        # Reload the webview
        self.web.reload()

    def reload_template(self):
        """Development helper: Reload template file without Anki restart"""
        import sys
        from importlib import reload

        from aqt.utils import tooltip

        # Check if TinyMCE has unsaved changes
        is_dirty = self.web.sync_execJavaScript(
            "tinymce.activeEditor ? tinymce.activeEditor.isDirty() : false"
        )

        if is_dirty:
            ok = askUser(
                "You have unsaved changes. Are you sure you want to reload the template?"
            )
            if not ok:
                return

        try:
            # Force reload of external_js_editor_for_field module to clear cache
            module_name = None
            for name, mod in sys.modules.items():
                if "external_js_editor_for_field" in name:
                    module_name = name
                    break
            if module_name:
                reload(sys.modules[module_name])

            # Get fresh settings with reloaded template
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

    def reload_backend(self):
        from aqt.utils import tooltip

        tooltip(
            "Backend changes require an Anki restart. Please close this dialog and restart Anki."
        )

    def reload_template(self):
        """Development helper: Reload template file without Anki restart"""
        from aqt.utils import tooltip

        # Check if TinyMCE has unsaved changes
        is_dirty = self.web.sync_execJavaScript(
            "tinymce.activeEditor ? tinymce.activeEditor.isDirty() : false"
        )

        if is_dirty:
            ok = askUser(
                "You have unsaved changes. Are you sure you want to reload the template?"
            )
            if not ok:
                return

        # Re-import to get fresh template
        import sys
        from importlib import reload

        from .external_js_editor_for_field import get_settings

        # Force reload of external_js_editor_for_field module to clear cache
        module_name = None
        for name, mod in sys.modules.items():
            if "external_js_editor_for_field" in name:
                module_name = name
                break
        if module_name:
            reload(sys.modules[module_name])

        # Get fresh settings with reloaded template
        settings = get_settings("T6")  # Assuming TinyMCE6

        # Get current content before reload
        current_content = self.web.sync_execJavaScript(
            "tinymce.activeEditor ? tinymce.activeEditor.getContent() : ''"
        )

        # Rebuild HTML with fresh template
        new_body = settings["body_except_for_field_content"].replace(
            "CONTENTCONTENT", current_content
        )

        # Reload webview with new HTML
        from .vars import cssfiles, other_jsfiles

        self.web.stdHtml(
            body=new_body,
            css=cssfiles,
            js=[self.js_file] + other_jsfiles,
            head="",
            context=self,
        )

        tooltip("Template reloaded successfully!")
