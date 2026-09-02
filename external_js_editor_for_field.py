import os

from anki.hooks import addHook
from aqt import mw
from aqt.qt import QKeySequence
from aqt.theme import theme_manager
from aqt.utils import tooltip

from .config import gc
from .dialog import ExtraWysiwygEditorForField
from .helpers import (
    addon_path,
    addonfoldername,
    hiliters_tinymce,
    maybe_pre_process_html,
    readfile,
    user_files_folder,
)

if os.path.isfile(os.path.join(user_files_folder, "additional_editors.py")):
    from .user_files.additional_editors import additional_editors_dict
else:
    additional_editors_dict = {}


if os.path.isfile(os.path.join(user_files_folder, "additional_buttons_menuentries.py")):
    from .user_files.additional_buttons_menuentries import get_additional_arglist
else:

    def get_additional_arglist():
        return []


mw.addonManager.setWebExports(__name__, r"((user_files[/\\])?web[/\\].*)")


def get_settings(chosen_name):
    if chosen_name in ["T6", "TM"]:
        defau1 = (
            "undo redo fontfamily blocks alignleft aligncenter alignright alignjustify "
            "link unlink charmap cleanup nextCloze sameCloze code codesample"
        )
        tb1 = gc("TinyMCE6-toolbar1", defau1)
        defau2 = (
            "bold italic underline strikethrough superscript subscript forecolor backcolor "
            "removeformat hr blockquote numlist bullist anchor outdent indent table ltr rtl"
        )
        tb2 = gc("TinyMCE6-toolbar2", defau2)
        webpath = f"/_addons/{addonfoldername}/web/"
        return {
            "js_file": "tinymce6/js/tinymce/tinymce.min.js",
            "jssavecmd": """
            console.log("saving ...");  // for debugging
            saving = true;  // Set flag to indicate saving process
            tinyMCE.activeEditor.getContent();
            """,
            "wintitle": "Anki - edit current field in TinyMCE",
            "dialogname": "tinymce6",
            "webpath": webpath,
            "body_except_for_field_content": readfile(
                addon_path, "template_tiny6_body.html"
            )
            % {
                "FONTSIZE": gc("fontSize"),
                "FONTNAME": gc("font"),
                #  https://www.tiny.cloud/blog/dark-mode-tinymce-rich-text-editor/
                "CUSTOMBGCOLOR": (
                    ""
                    if theme_manager.night_mode
                    else "this.getDoc().body.style.backgroundColor = '#e4e2e0';"
                ),
                # https://www.tiny.cloud/blog/  dark-mode-tinymce-rich-text-editor/
                "CONTENTCSS": '"custom",' if theme_manager.night_mode else "",
                "SKIN": "oxide-dark" if theme_manager.night_mode else "oxide",
                "THEME": "silver",
                "TOOLBAR1": tb1,
                "TOOLBAR2": tb2,
                "WEBPATH": webpath,
                "HILITERS": (
                    hiliters_tinymce if gc("show background color buttons") else ""
                ),
            },
        }
    for js_editor_name, settings_dict in additional_editors_dict.items():
        if chosen_name == js_editor_name:
            return settings_dict


def show_wysiwyg_dialog(editor, field, editorname):
    """Open the TinyMCE editor window for a specific note field.

    The dialog stores the note ID and field index directly (not the editor reference),
    allowing it to survive browser/editor closure and detect external note changes.
    """
    note = editor.note
    field_content = note.fields[field]

    content_surrounded_with_div = False
    if field_content.startswith("<div>") and field_content.endswith("</div>"):
        content_surrounded_with_div = True

    settings = get_settings(editorname)
    html = maybe_pre_process_html(field_content)
    bodyhtml = settings["body_except_for_field_content"].replace("CONTENTCONTENT", html)

    # Create the editor window with note_id and field_idx instead of editor reference
    # This allows the window to survive browser/editor closure
    ExtraWysiwygEditorForField(
        note_id=note.id,
        field_idx=field,
        original_html=field_content,
        bodyhtml=bodyhtml,
        js_file=settings["js_file"],
        js_save_command=settings["jssavecmd"],
        wintitle=settings["wintitle"],
        dialogname=settings["dialogname"],
        content_surrounded_with_div=content_surrounded_with_div,
        web_path=settings["webpath"],
    )
    # Note: The dialog is non-modal and shows itself in __init__


def external_editor_start(editor, editorname):
    if editor.currentField is None:
        tooltip("no field focussed. Aborting ...")
        return
    editor.myfield = editor.currentField
    editor.saveNow(
        lambda e=editor, f=editor.myfield, n=editorname: show_wysiwyg_dialog(e, f, n)
    )


def keystr(k):
    key = QKeySequence(k)
    return key.toString(QKeySequence.SequenceFormat.NativeText)


def setupEditorButtonsFilter(buttons, editor):
    cut_T6 = gc("TinyMCE6 - shortcut to open dialog")
    tip_T6 = "edit current field in external window"
    if cut_T6:
        tip_T6 += " ({})".format(keystr(cut_T6))

    use_default = True if not gc("_TinyMCE6 - enable") else False
    cut_default = gc("shortcut to open default dialog")
    tip_default = f"edit current field in external window ({keystr(cut_default)})"

    arglist = [
        #  0                        1           2             3          4       5
        # show                    shortcut     tooltip     functionarg  cmd   icon
        [gc("_TinyMCE6 - enable"), cut_T6, tip_T6, "T6", "T6", None],
        [use_default, cut_default, tip_default, "TM", "TM", None],
    ]
    additional_arglist = get_additional_arglist()
    arglist.extend(additional_arglist)
    for line in arglist:
        if not line[0]:
            continue
        b = editor.addButton(
            icon=line[5],  # os.path.join(addon_path, "icons", "tm.png"),
            cmd=line[4],
            func=lambda e=editor, n=line[3]: external_editor_start(e, n),
            tip=line[2],
            keys=keystr(line[1]) if line[1] else "",
        )
        buttons.append(b)

    return buttons


addHook("setupEditorButtons", setupEditorButtonsFilter)
