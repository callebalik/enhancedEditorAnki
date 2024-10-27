//  Require prettier and prettier to be loaded in the template

function sourceCodeMain(editor) {
    editor.on('OpenWindow', function(e) {
        var dialogTitle = e.target.getEl().querySelector('.tox-dialog__title');
        if (dialogTitle && dialogTitle.innerText === 'Source Code') {
            tinymce.activeEditor.windowManager.alert('Hello world!');
            alert('Source code editing formatting test');
            var textarea = e.target.getEl().querySelector('textarea.tox-textarea');
            if (textarea) {
                textarea.value = prettier.format(textarea.value, {
                    parser: 'html',
                    plugins: prettierPlugins
                });
            }
        }
    });
}