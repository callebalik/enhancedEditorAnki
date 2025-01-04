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
              onAction: () =>
                editor.insertContent(
                  editor.selection.getContent().replace(/<br\s*\/?>/gi, " ")
                ),
            },
            {
              type: "menuitem",
              text: "Sub menu item 1",
              icon: "unlock",
              onAction: () =>
                editor.insertContent(
                  "&nbsp;<em>You clicked Sub menu item 1!</em>"
                ),
            },
            {
              type: "menuitem",
              text: "Sub menu item 2",
              icon: "lock",
              onAction: () =>
                editor.insertContent(
                  "&nbsp;<em>You clicked Sub menu item 2!</em>"
                ),
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
