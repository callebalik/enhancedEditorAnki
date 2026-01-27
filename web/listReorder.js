function setupListReordering(editor) {
    // Helper function to find the nearest block-level element to move
    function getBlockElement(node) {
        const blockSelectors = ['li', 'p', 'div', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'table', 'ul', 'ol'];

        // Try to find a block-level ancestor
        let current = node;
        while (current && current.nodeType === 1) { // nodeType 1 = Element
            if (blockSelectors.includes(current.tagName.toLowerCase())) {
                return current;
            }
            current = current.parentElement;
        }

        // If no block element found in parents, return the node itself if it's an element
        return (node.nodeType === 1) ? node : null;
    }

    // Command to move element up (within same level)
    editor.addCommand('moveElementUp', function () {
        const selectedNode = editor.selection.getNode();
        const blockElement = getBlockElement(selectedNode);

        if (blockElement && blockElement.previousElementSibling) {
            blockElement.parentNode.insertBefore(blockElement, blockElement.previousElementSibling);
            editor.selection.select(blockElement); // Keep selection on moved element
        }
    });

    // Command to move element down (within same level)
    editor.addCommand('moveElementDown', function () {
        const selectedNode = editor.selection.getNode();
        const blockElement = getBlockElement(selectedNode);

        if (blockElement && blockElement.nextElementSibling) {
            blockElement.parentNode.insertBefore(blockElement.nextElementSibling, blockElement);
            editor.selection.select(blockElement); // Keep selection on moved element
        }
    });

    // Event listener to prevent default scrolling and trigger reordering
    editor.on('keydown', function (e) {
        // Ctrl+UpArrow
        if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent default scrolling
            editor.execCommand('moveElementUp');
        }
        // Ctrl+DownArrow
        else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent default scrolling
            editor.execCommand('moveElementDown');
        }
    });

    // Optional toolbar buttons
    editor.ui.registry.addButton('moveElementUp', {
        icon: 'arrow-up',
        tooltip: 'Move element up',
        onAction: () => editor.execCommand('moveElementUp')
    });

    editor.ui.registry.addButton('moveElementDown', {
        icon: 'arrow-down',
        tooltip: 'Move element down',
        onAction: () => editor.execCommand('moveElementDown')
    });
}

// Export function to be used in TinyMCE setup
if (typeof tinymce !== 'undefined') {
    tinymce.PluginManager.add('listReordering', function(editor) {
        setupListReordering(editor);
    });
}
