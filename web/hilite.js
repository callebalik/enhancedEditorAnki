     // usused
        // highlight
        // https://stackoverflow.com/a/17611715
        // https://stackoverflow.com/a/49841804


function hilite(editor, tinymce, name, color, key, buttontext){
    // https://www.tiny.cloud/docs/api/tinymce/tinymce.editor/#addcommand
    // the command that you add with addCommand can be executed with execCommand.
    editor.addCommand(name, function () {
        let n = tinymce.activeEditor.selection.getNode();
        let c = tinymce.activeEditor.dom.getStyle(n, 'background-color', true);
        if (c ==color) {
            nc = "transparent";
        }
        else{
            nc =color;
        }
        tinymce.activeEditor.execCommand('HiliteColor', false, nc);
    });
    editor.addShortcut(key, name, name);
    // https://www.tiny.cloud/docs/ui-components/typesoftoolbarbuttons/
    editor.ui.registry.addButton(name, {
        text: buttontext,
        tooltip: name + '(' + key + ')',
        onAction: () => {editor.execCommand(name);}
    });
}