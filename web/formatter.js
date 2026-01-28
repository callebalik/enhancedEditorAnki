function fixDomHierarchy(editor) {
  editor.addCommand("fixDomHierarchy", function () {
    // Get the current HTML content
    const content = editor.getContent();

    // Use DOMParser to parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    $(doc).find("div:empty").remove();
    console.log(doc.querySelectorAll("div:has(>h2)"));
    while (doc.querySelectorAll("div:has(>h2)").length > 0) {
      doc.querySelectorAll("div:has(>h2)").forEach((el) => {
        el.replaceWith(function () {
          return $(this).children();
        });
      });
    }

    editor.setContent(doc.body.innerHTML);
  });

  editor.ui.registry.addButton("fixDomHierarchyButton", {
    text: "🧹DOM",
    tooltip: "Fix the DOM heierarchy",
    onAction: () => editor.execCommand("fixDomHierarchy"),
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

// function unwrap(elm) {
//   var parent = elm.parentNode;
//   while (elm.firstChild) parent.insertBefore(elm.firstChild, elm);
//   parent.removeChild(elm);}
// 	// get the element's parent node
// 	var parent = elm.parentNode;
// 		// move all children out of the element
// 	while (elm.firstChild) parent.insertBefore(elm.firstChild, elm);
// 		// remove the empty element
// 	parent.removeChild(elm);

// unwrap away from an element; super basic but makes it consistent across our apps
function unwrap(el) {
  if (el && el.parentNode) {
    // move all children out of the element
    while (el.firstChild) {
      el.parentNode.insertBefore(el.firstChild, el);
    }
    // remove the empty element
    el.remove();
  }
}

function removeEmptyElement(el) {
  if (el.innerHTML.trim === "") {
    el.remove();
  }
}

function makeColumnCellsHeader(column) {
  column.cells().every(function () {
    this.header().innerHTML = this.data();
  });
}

/**
 * Unwraps all headers (h1 to h6) by continuously moving them up
 * through the hierarchy until they no longer have a parent element.
 */
function fullyUnwrapHeaders(doc) {
  // Select all headers in the document
  const headers = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

  headers.forEach((header) => {
    // Keep moving the header up in the hierarchy until it has no parent
    while (header.parentElement) {
      const parent = header.parentElement;
      // Move the header to the position just before its current parent
      parent.parentNode.insertBefore(header, parent);
    }
  });
}

function getClassOfCurrentElement(editor) {
  editor.addCommand("getClassOfCurrentElement", function () {
    // Get the current selected node
    const selectedNode = editor.selection.getNode();

    // Get the class of the selected node
    const className = selectedNode.className;

    // Display the class name (you can change this to any other action you need)
    alert(`Class of the current element: ${className}`);
  });

  // Optional: Add a toolbar button to get the class of the current element
  editor.ui.registry.addButton("getClassOfCurrentElementButton", {
    text: "Get Class",
    tooltip: "Get the class of the current element",
    onAction: function () {
      editor.execCommand("getClassOfCurrentElement");
    },
  });
}

// Register the command
function registerFormatters(editor) {

  // Table operations are registered in tables.js tablesEnhanced plugin
  // Other formatter functions
  fixDomHierarchy(editor);
  unwrapParentElement(editor);
  getClassOfCurrentElement(editor);

  editor.addCommand("deleteCurrentElement", function () {
    deleteCurrentElement(editor);
  });

  // Add a toolbar button to delete the current element
  editor.ui.registry.addButton("deleteCurrentElementButton", {
    text: "Delete Element",
    tooltip:
      "Delete the closest div, p, or tr element where the cursor is currently placed",
    onAction: function () {
      editor.execCommand("deleteCurrentElement");
    },
  });

  editor.addShortcut(
    "ctrl+shift+k",
    "deleteCurrentElement",
    "deleteCurrentElement"
  );

  editor.addCommand("getCurrentNode", function () {
    getCurrentNode(editor);
  });

  // Add a toolbar button to get the current node
  editor.ui.registry.addButton("getCurrentNodeButton", {
    text: "Get Node",
    tooltip: "Get the current node",
    onAction: function () {
      editor.execCommand("getCurrentNode");
    },
  });
}
// Function to delete the closest div, p, or tr element where the cursor is currently placed
function deleteCurrentElement(editor) {
  const selection = editor.selection;
  const selectedNode = selection.getNode();
  console.log(selectedNode);
  // Check if the selected node itself matches div, p, li, or tr
  if (
    selectedNode &&
    /^(div|p|li|tr|th|h4|h3|h2|h1)$/i.test(selectedNode.nodeName)
  ) {
    console.log("deleting", selectedNode);
    editor.dom.remove(selectedNode);
    editor.nodeChanged();
  } else if (selectedNode) {
    // Get the closest div, p, li, or tr element
    const closestElement = editor.dom.getParent(
      selectedNode,
      "div,p,li,tr,th,h4,h3,h2,h1"
    );
    if (closestElement) {
      console.log("deleting", closestElement);
      editor.dom.remove(closestElement);
      editor.nodeChanged();
    }
  }
}

function getCurrentNode(editor) {
  // Get the current selected node
  const selectedNode = editor.selection.getNode();
  // Display the node name and class (you can change this to any other action you need)
  console.log(
    `Node name: ${selectedNode.nodeName}\nClass: ${selectedNode.className}`
  );

  return selectedNode;
}

