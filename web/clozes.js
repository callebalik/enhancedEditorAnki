function clozesMain(editor) {
        // Additional commands for cloze
        editor.addCommand('nextCloze', function () {
            let selected_text = editor.selection.getContent({ format: 'html' });
            let content = editor.getContent();
            let return_text = newClozeText(content, selected_text, false);
            editor.execCommand('mceInsertContent', 0, return_text);
        });
        editor.addShortcut('ctrl+shift+c', 'nextCloze', 'nextCloze');
        editor.ui.registry.addButton('nextCloze', {
            text: 'Cln',
            tooltip: 'nextCloze' + '(' + 'ctrl+shift+c' + ')',
            onAction: () => { editor.execCommand('nextCloze'); }
        });

             // Additional commands for cloze
             editor.addCommand('nextCloze', function () {
            let selected_text = editor.selection.getContent({ format: 'html' });
            let content = editor.getContent();
            let return_text = newClozeText(content, selected_text, false);
            editor.execCommand('mceInsertContent', 0, return_text);
        });
        editor.addShortcut('ctrl+shift+c', 'nextCloze', 'nextCloze');
        editor.ui.registry.addButton('nextCloze', {
            text: 'Cln',
            tooltip: 'nextCloze' + '(' + 'ctrl+shift+c' + ')',
            onAction: () => {editor.execCommand('nextCloze');}
        });


        editor.addCommand('sameCloze', function() {
            let selected_text = editor.selection.getContent({ format: 'html' });
            let content = editor.getContent();
            let return_text = newClozeText(content,selected_text,true);
            editor.execCommand('mceInsertContent', 0, return_text);
        });
        editor.addShortcut('ctrl+alt+shift+c', 'addCloze', 'sameCloze');
        editor.ui.registry.addButton('sameCloze', {
                text: 'Cls',
                tooltip: 'sameCloze' + '(' + 'ctrl+alt+shift+c' + ')',
                onAction: () => {editor.execCommand('sameCloze');}
        });
}