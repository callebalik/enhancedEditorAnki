function cleanInlineStyles(editor) {
  // Custom command to remove specific inline styles from table elements
  editor.addCommand("removeTableStyles", function () {
    // Get the current HTML content
    const content = editor.getContent();

    // Use DOMParser to parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Select table-related elements and remove specified inline styles
    const tableElm = doc.querySelectorAll("table, th, td, tr, col, colgroup");
    const paragraphElm = doc.querySelectorAll("span, div, p");

    tableElm.forEach((el) => {
      el.style.removeProperty("width");
      el.style.removeProperty("height");
      el.style.removeProperty("font-size");
      el.style.removeProperty("text-align");
      el.style.removeProperty("border-collapse");
      el.style.removeProperty("border");
    });

    paragraphElm.forEach((el) => {
      el.style.removeProperty("text-align");
      el.style.removeProperty("font-size");
      el.style.removeProperty("color");
    });

    // Set the modified HTML content back into the editor
    editor.setContent(doc.body.innerHTML);
  });

  // Register the button for the custom command
  editor.ui.registry.addButton("removeTableStylesButton", {
    text: "Clear",
    tooltip:
      "Remove width, height, font-size, and text-align from table elements",
    onAction: () => editor.execCommand("removeTableStyles"),
  });
}

function unwrapParentElement(editor) {
  editor.addCommand("unwrapParent", function () {
    // Get the current selected node
    const selectedNode = editor.selection.getNode();

    // Get the parent element to unwrap (if applicable)
    const parent = selectedNode.parentNode;

    // Ensure the parent exists and is not the body (to avoid unwrapping too high up)
    if (parent && parent.nodeName !== "BODY") {
      // Move each child node of the parent before the parent itself
      while (parent.firstChild) {
        parent.parentNode.insertBefore(parent.firstChild, parent);
      }

      // Remove the now-empty parent element
      parent.remove();
    }
  });
  editor.addShortcut("ctrl+shift+alt+u", "unwrapParent", "unwrapParent");
  // Optional: Add a toolbar button to unwrap
  editor.ui.registry.addButton("unwrapParentButton", {
    text: "Unwrap Element",
    tooltip: "Unwrap parent element of the current selection",
    onAction: function () {
      editor.execCommand("unwrapParent");
    },
  });
}
