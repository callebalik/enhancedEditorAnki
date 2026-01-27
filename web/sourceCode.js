//  Require prettier and prettier to be loaded in the template

function sourceCodeMain(editor) {
    editor.on('OpenWindow', function(e) {
        // Use a small delay to ensure DOM is ready
        setTimeout(function() {
            const dialogTitle = document.querySelector('.tox-dialog__title');
            const textarea = document.querySelector('textarea.tox-textarea');

            if (dialogTitle && dialogTitle.textContent.includes('Source Code') && textarea) {
                if (window.prettier && window.prettierPlugins) {
                    try {
                        textarea.value = prettier.format(textarea.value, {
                            parser: 'html',
                            plugins: [window.prettierPlugins.html]
                        });
                        textarea.focus();
                    } catch (err) {
                        console.error('Prettier formatting failed:', err);
                    }
                }
            }
        }, 100);
    });
}

tinymce.PluginManager.add('sourceCode', function(api) {
    const editor = api.editor;

    // Listen for the Code View dialog opening
    editor.on('OpenWindow', function(e) {
        // Use a small delay to ensure DOM is ready
        setTimeout(function() {
            const dialogTitle = document.querySelector('.tox-dialog__title');
            const textarea = document.querySelector('textarea.tox-textarea');

            if (dialogTitle && dialogTitle.textContent.includes('Source Code') && textarea) {
                if (window.prettier && window.prettierPlugins) {
                    try {
                        textarea.value = prettier.format(textarea.value, {
                            parser: 'html',
                            plugins: [window.prettierPlugins.html]
                        });
                        textarea.focus();
                    } catch (err) {
                        console.error('Prettier formatting failed:', err);
                    }
                }
            }
        }, 100);
    });
});