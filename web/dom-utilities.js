function addMenu(editor) {
  /* DOM manipulation menu has been moved to the main DOM menu in the menubar.
     This function is kept for backwards compatibility but the content wrangling
     dropdown is no longer needed since all items are now in the DOM menu. */

  // Menu items are now registered in template_tiny6_body.html under the DOM menu
}

// Function to unnest headings and move them to the top level
function unnestHeadings(editor) {
  const headings = editor.dom.select("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    let parent = heading.parentNode;
    while (parent && parent !== editor.getBody()) {
      const grandParent = parent.parentNode;
      grandParent.insertBefore(heading, parent);
      parent = grandParent;
    }
  });
}

function unwrapElement(editor, element) {
  const parent = element.parentNode;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function wrapElement(editor, element, tagName) {
  // IMPORTANT NOTE ON HTML TAG VALIDATION:
  // TinyMCE enforces a schema-based validation system that restricts which HTML tags can be used.
  // By default, only standard HTML5 tags are allowed in the editor.
  //
  // When you try to type or insert non-standard tags (like <custom-tag>):
  // 1. TinyMCE's schema validator will strip them out during content processing
  // 2. The editor will either remove the tag entirely or convert it to a valid tag
  // 3. This happens automatically through TinyMCE's internal sanitization
  //
  // To allow custom/non-standard tags, you must configure the schema in tinymce.init():
  // - Use 'extended_valid_elements' to add specific custom tags
  // - Use 'custom_elements' to define custom element patterns
  // - Use 'valid_elements' to completely override the whitelist (not recommended)
  //
  // Example configuration:
  // extended_valid_elements: 'custom-tag[*],my-element[class|id|data-*]'
  //
  // Without this configuration, functions like wrapElement() will only work with standard HTML tags.

  // Note: This function will only work if tagName is a valid HTML element
  // or has been added to TinyMCE's schema via extended_valid_elements
  if (element && tagName) {
    const wrapper = editor.dom.create(tagName);
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    editor.nodeChanged();
  }
}

function findRedundantDivs(editor) {
  const divs = editor.dom.select("div");
  divs.forEach((div) => {
    // If no attributes and only containing a div, ul or ol element, unwrap
    if (div.attributes.length === 0 && div.children.length === 1) {
      const child = div.children[0];
      if (
        child.tagName === "DIV" ||
        child.tagName === "UL" ||
        child.tagName === "OL"
      ) {
        unwrapElement(editor, div);
      }
    }

    // After unwrapping divs remove previously empty and newly empty divs
    if (div.innerHTML === "") {
      div.remove();
    }
  });
}

function sendCurrentNodeToConsole(editor) {
  // Get the current selected node
  const selectedNode = editor.selection.getNode();
  // Log node details to console
  console.log(
    `Node name: ${selectedNode.nodeName}\nClass: ${selectedNode.className}`
  );
  console.log("Full node:", selectedNode);
}

function fixDomHierarchy(editor) {
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
}
