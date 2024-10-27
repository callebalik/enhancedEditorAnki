function setupListReordering(editor) {
    // Command to move list item up
    editor.addCommand('moveItemUp', function () {
        const selectedNode = editor.selection.getNode();
        const listItem = selectedNode.closest('li');
        if (listItem && listItem.previousElementSibling) {
            listItem.parentNode.insertBefore(listItem, listItem.previousElementSibling);
            editor.selection.select(listItem); // Keep selection on moved item
        }
    });

    // Command to move list item down
    editor.addCommand('moveItemDown', function () {
        const selectedNode = editor.selection.getNode();
        const listItem = selectedNode.closest('li');
        if (listItem && listItem.nextElementSibling) {
            listItem.parentNode.insertBefore(listItem.nextElementSibling, listItem);
            editor.selection.select(listItem); // Keep selection on moved item
        }
    });

    // Event listener to prevent default scrolling and trigger reordering
    editor.on('keydown', function (e) {
        // Alt+UpArrow
        if (e.altKey && e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent default scrolling
            editor.execCommand('moveItemUp');
        }
        // Alt+DownArrow
        else if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent default scrolling
            editor.execCommand('moveItemDown');
        }
    });

    // Optional toolbar buttons
    editor.ui.registry.addButton('moveItemUp', {
        icon: 'arrow-up',
        tooltip: 'Move list item up',
        onAction: () => editor.execCommand('moveItemUp')
    });

    editor.ui.registry.addButton('moveItemDown', {
        icon: 'arrow-down',
        tooltip: 'Move list item down',
        onAction: () => editor.execCommand('moveItemDown')
    });
}

// Export function to be used in TinyMCE setup
if (typeof tinymce !== 'undefined') {
    tinymce.PluginManager.add('listReordering', function(editor) {
        setupListReordering(editor);
    });
}
