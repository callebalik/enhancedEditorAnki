function addMenu(editor) {
  /* Menu items are recreated when the menu is closed and opened, so we need
         a variable to store the toggle menu item state. */
  let toggleState = false;
  editor.ui.registry.addMenuButton("mybutton", {
    text: "Content Wrangling",
    fetch: (callback) => {
      const items = [
        {
          type: "menuitem",
          text: "Element Properties",
          getSubmenuItems: () => [
            {
              type: "menuitem",
              text: "Element prop",
              icon: "code-sample",
              onAction: function () {
                const selectedNode = editor.selection.getNode();

                editor.windowManager.open(createDialogConfig(selectedNode));
              },
            },
            {
              type: "menuitem",
              text: "Add class to current element",
              icon: "code-sample",
              onAction: () => {
                const node = editor.selection.getNode();
                const currentClasses = node.className
                  ? `Current classes: ${node.className}`
                  : "No current classes";
                const tagName = node.tagName.toLowerCase();
                const className = prompt(
                  `Element: <${tagName}> \n${currentClasses}\n\nEnter the class name`
                );
                if (className) {
                  editor.dom.addClass(node, className);
                }
              },
            },
          ],
        },
        {
          type: "nestedmenuitem",
          text: "Formatters",
          icon: "user",
          getSubmenuItems: () => [
            {
              type: "menuitem",
              text: "remove empty elements",
              icon: "remove",
              onAction: () =>
                editor.setContent(
                  editor
                    .getContent()
                    .replace(/<(\w+)(\s*[^>]*)>(\s|&nbsp;)*<\/\1>/g, "")
                ),
            },
            {
              type: "menuitem",
              text: "remove line breaks from selection",
              onAction: () => {
                const selectedContent = editor.selection.getContent({
                  format: "html",
                });
                const strippedContent = selectedContent.replace(
                  /font-size:\s*[^;]+;?/gi,
                  ""
                );
                const container = editor.selection.getNode();
                container.innerHTML = container.innerHTML.replace(
                  selectedContent,
                  strippedContent
                );
              },
            },
            {
              type: "menuitem",
              text: "Strip font-size from selection",
              icon: "remove",
              onAction: () => {
                const selectedContent = editor.selection.getContent({
                  format: "html",
                });
                const strippedContent = selectedContent.replace(
                  /font-size:\s*[^;]+;?/gi,
                  ""
                );
                const container = editor.selection.getNode();
                container.innerHTML = container.innerHTML.replace(
                  selectedContent,
                  strippedContent
                );
              },
            },
            {
              type: "menuitem",
              text: "Unnest headings",
              icon: "lock",
              onAction: () => {
                unnestHeadings(editor);
              },
            },
            {
              type: "menuitem",
              text: "Unwrap element",
              icon: "lock",
              onAction: () => {
                const node = editor.selection.getNode();
                unwrapElement(editor, node);
              },
            },
            {
              type: "menuitem",
              text: "Find redundant divs",
              icon: "lock",
              onAction: () => {
                findRedundantDivs(editor);
              },
            },
          ],
        },
        {
          type: "togglemenuitem",
          text: "Toggle menu item",
          onAction: () => {
            toggleState = !toggleState;
            editor.insertContent(
              "&nbsp;<em>You toggled a menuitem " +
                (toggleState ? "on" : "off") +
                "</em>"
            );
          },
          onSetup: (api) => {
            api.setActive(toggleState);
            return () => {};
          },
        },
      ];
      callback(items);
    },
  });
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
