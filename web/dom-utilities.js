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
