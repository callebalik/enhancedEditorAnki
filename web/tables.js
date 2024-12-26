function makeCurrentRowHeader(editor) {
  editor.addCommand("makeCurrentRowHeader", function () {
    const selection = editor.selection;
    const selectedNode = selection.getNode();
    const row = editor.dom.getParent(selectedNode, "tr");

    if (row) {
      const table = editor.dom.getParent(row, "table");
      if (table) {
        let thead = table.querySelector("thead");
        if (!thead) {
          thead = editor.dom.create("thead");
          table.insertBefore(thead, table.firstChild);
        }

        // Move the row to the thead
        thead.appendChild(row);

        // Change all td elements in the row to th
        const cells = row.querySelectorAll("td");
        cells.forEach((cell) => {
          const th = editor.dom.create("th", {}, cell.innerHTML);
          row.replaceChild(th, cell);
        });

        editor.nodeChanged();
      }
    }
  });
}

function makeCurrentCellHeader(editor) {
  editor.addCommand("makeCurrentCellTh", function () {
    const selection = editor.selection;
    const selectedNode = selection.getNode();
    const cell = editor.dom.getParent(selectedNode, "td");

    const th = editor.dom.create("th", {}, cell.innerHTML);
    cell.replaceWith(th);
    editor.nodeChanged();
  });

  console.log("succesfully loaded makeCurrentCellHeader");
}

function moveTableRowUpDown(editor) {
  editor.addCommand("moveTableRowUp", function () {
    const row = editor.dom.getParent(getCurrentNode(editor), "tr");

    if (row) {
      const previousRow = row.previousElementSibling;
      if (previousRow) {
        row.parentNode.insertBefore(row, previousRow);
      }
    }
  });

  editor.ui.registry.addButton("moveTableRowUpButton", {
    text: "⬆️",
    tooltip: "Move the current row up",
    onAction: function () {
      editor.execCommand("moveTableRowUp");
    },
  });

  editor.ui.registry.addButton("moveTableRowDownButton", {
    text: "⬇️",
    tooltip: "Move the current row down",
    onAction: function () {
      editor.execCommand("moveTableRowDown");
    },
  });
}

function moveColumn(editor, direction) {
  const cell = editor.dom.getParent(editor.selection.getNode(), "td,th");
  if (!cell) return;

  const row = cell.parentNode;
  const table = editor.dom.getParent(row, "table");
  if (!table) return;

  const cellIndex = cell.cellIndex;
  if (direction === "left" && cellIndex === 0) return; // Already at the first column
  if (direction === "right" && cellIndex === row.cells.length - 1) return; // Already at the last column

  Array.from(table.rows).forEach((row) => {
    const cells = Array.from(row.cells);
    const currentCell = cells[cellIndex];
    const targetCell =
      direction === "left" ? cells[cellIndex - 1] : cells[cellIndex + 1];
    row.insertBefore(
      currentCell,
      direction === "left" ? targetCell : targetCell.nextSibling
    );
  });

  editor.nodeChanged();
}

function moveColumnLeft(editor) {
  editor.addCommand("moveColumnLeft", function () {
    moveColumn(editor, "left");
  });

  editor.addShortcut("ctrl+alt+left", "Move column left", "moveColumnLeft");
}

function moveColumnRight(editor) {
  editor.addCommand("moveColumnRight", function () {
    moveColumn(editor, "right");
  });

  editor.addShortcut("ctrl+alt+right", "Move column right", "moveColumnRight");
}


function moveRow(editor, direction) {
  const row = editor.dom.getParent(editor.selection.getNode(), "tr");
  if (!row) return;

  const table = editor.dom.getParent(row, "table");
  if (!table) return;

  const tbody = table.querySelector("tbody") || table;
  const thead = table.querySelector("thead");

  if (direction === "up") {
    const previousRow = row.previousElementSibling;
    if (previousRow) {
      row.parentNode.insertBefore(row, previousRow);
    } else if (row.parentNode === tbody && thead) {
      // Move to thead
      thead.appendChild(row);
      Array.from(row.cells).forEach((cell) => {
        const th = editor.dom.create("th", {}, cell.innerHTML);
        row.replaceChild(th, cell);
      });
    }
  } else if (direction === "down") {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
      row.parentNode.insertBefore(nextRow, row);
    } else if (row.parentNode === thead) {
      // Move to tbody
      tbody.appendChild(row);
      Array.from(row.cells).forEach((cell) => {
        const td = editor.dom.create("td", {}, cell.innerHTML);
        row.replaceChild(td, cell);
      });
    }
  }

  editor.nodeChanged();
}

function moveRowUp(editor) {
  editor.addCommand("moveRowUp", function () {
    moveRow(editor, "up");
  });

  editor.addShortcut("ctrl+alt+up", "Move row up", "moveRowUp");
}

function moveRowDown(editor) {
  editor.addCommand("moveRowDown", function () {
    moveRow(editor, "down");
  });

  editor.addShortcut("ctrl+alt+down", "Move row down", "moveRowDown");
}

function removeTableStyles(editor) {
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

    doc.querySelectorAll("td>div, th>div").forEach((el) => {
      unwrap(el);
    });

    // Check for empty elements and remove them
    doc.querySelectorAll("p, span, div").forEach((el) => {
      removeEmptyElement(el);
    });

    // Set the modified HTML content back into the editor
    editor.setContent(doc.body.innerHTML);
  });
}

function addTableMenu(editor) {
  /* Menu items are recreated when the menu is closed and opened, so we need
     a variable to store the toggle menu item state. */
  let toggleState = false;
  editor.ui.registry.addMenuButton("TablesMenu", {
    text: "Tables",
    icon: "table",
    fetch: (callback) => {
      const items = [
        {
          type: "menuitem",
          text: "Convert ul to table",
          icon: "table",
          onAction: () => {
            const node = editor.selection.getNode();
            const closestUl = editor.dom.getParent(node, "ul");
            if (closestUl) {
              ulElement = editor.selection.select(closestUl);
              // Getting the currently selected node for the active editor
              //   alert("UL element found.");
              const table = ulToTable(ulElement);
              //   alert("Table created.");
              editor.dom.insertAfter(table, ulElement);
              editor.selection.select(table); // Ensure the table is selected and visible
            } else {
              alert("No parent list found from selection");
            }
          },
        },
        {
          type: "menuitem",
          text: "Move column left",
          icon: "arrow-left",
          onAction: () => {
            editor.execCommand("moveColumnLeft");
          },
        },
        {
          type: "menuitem",
          text: "Move column right",
          icon: "arrow-right",
          onAction: () => {
            editor.execCommand("moveColumnRight");
          },
        },
        {
          type: "menuitem",
          text: "Move row up",
          icon: "arrow-up",
          onAction: () => {
            editor.execCommand("moveRowUp");
          },
        },
        {
          type: "menuitem",
          text: "Move row down",
          icon: "arrow-down",
          onAction: () => {
            editor.execCommand("moveRowDown");
          },
        },
        {
          type: "menuitem",
          text: "Row↪️header",
          icon: "table-top-header",
          onAction: () => {
            editor.execCommand("makeCurrentRowHeader");
          },
        },
        {
          type: "menuitem",
          text: "🧹Clean table styles",
          icon: "table-delete",
          tooltip:
            "Remove width, height, font-size, and text-align from table elements",
          onAction: () => {
            editor.execCommand("removeTableStyles");
          },
        },
      ];
      callback(items);
    },
  });
}

function ulToTable(ulElement) {
  if (ulElement.tagName !== "UL") {
    throw new Error("Element must be an unordered list");
  }

  const headers = [];
  const rows = [];

  // Extract headers and rows
  ulElement.querySelectorAll(":scope > li").forEach((li) => {
    headers.push(li.firstChild.textContent.trim());
    const nestedItems = [];
    li.querySelectorAll("ul > li").forEach((nestedLi) => {
      nestedItems.push(nestedLi.textContent.trim());
    });
    rows.push(nestedItems);
  });

  // Create table element
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create header row
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Determine the maximum number of rows needed
  const maxRows = Math.max(...rows.map(row => row.length));

  // Create body rows
  for (let i = 0; i < maxRows; i++) {
    const tr = document.createElement("tr");
    rows.forEach((row) => {
      const td = document.createElement("td");
      td.textContent = row[i] || ""; // Fill empty cells if row[i] is undefined
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  return table;
}

// Function to add custom commands and buttons
function addCustomTableCommands(editor) {
  // Define a helper function to register buttons
  const registerButton = (name, config) => {
    if (editor.queryCommandSupported(config.command)) {
      editor.ui.registry.addButton(name, {
        ...config,
        onAction: config.onAction
          ? config.onAction
          : () => editor.execCommand(config.command),
      });
    }
  };

  // Register custom commands
  editor.addCommand("moveColumnRight", function () {
    moveColumn(editor, "right");
  });

  editor.addCommand("moveColumnLeft", function () {
    moveColumn(editor, "left");
  });

  editor.addCommand("moveRowUp", function () {
    moveRow(editor, "up");
  });

  editor.addCommand("moveRowDown", function () {
    moveRow(editor, "down");
  });

  // Register buttons for the custom commands
  registerButton("moveColumnRight", {
    tooltip: "Move Column Right",
    command: "moveColumnRight",
    icon: "arrow-right",
  });

  registerButton("moveColumnLeft", {
    tooltip: "Move Column Left",
    command: "moveColumnLeft",
    icon: "arrow-left",
  });

  registerButton("moveRowUp", {
    tooltip: "Move Row Up",
    command: "moveRowUp",
    icon: "action-prev",
  });

  registerButton("moveRowDown", {
    tooltip: "Move Row Down",
    command: "moveRowDown",
    icon: "action-next",
  });

  registerButton("makeCurrentRowHeader", {
    tooltip: "Make Row Header",
    command: "makeCurrentRowHeader",
    icon: "table-top-header",
  });
  registerButton("makeCurrentCellTh", {
    tooltip: "Make Cell Header",
    command: "makeCurrentCellTh",
    icon: "table-top-header",
  });
}

// Function to move columns
function moveColumn(editor, direction) {
  const cell = editor.dom.getParent(editor.selection.getNode(), "td,th");
  if (!cell) return;

  const row = cell.parentNode;
  const table = editor.dom.getParent(row, "table");
  if (!table) return;

  const cellIndex = cell.cellIndex;
  if (direction === "left" && cellIndex === 0) return; // Already at the first column
  if (direction === "right" && cellIndex === row.cells.length - 1) return; // Already at the last column

  Array.from(table.rows).forEach((row) => {
    const cells = Array.from(row.cells);
    const currentCell = cells[cellIndex];
    const targetCell =
      direction === "left" ? cells[cellIndex - 1] : cells[cellIndex + 1];
    row.insertBefore(
      currentCell,
      direction === "left" ? targetCell : targetCell.nextSibling
    );
  });

  editor.nodeChanged();
}

// Function to move rows
function moveRow(editor, direction) {
  const row = editor.dom.getParent(editor.selection.getNode(), "tr");
  if (!row) return;

  const table = editor.dom.getParent(row, "table");
  if (!table) return;

  const tbody = table.querySelector("tbody") || table;
  const thead = table.querySelector("thead");

  if (direction === "up") {
    const previousRow = row.previousElementSibling;
    if (previousRow) {
      row.parentNode.insertBefore(row, previousRow);
    } else if (row.parentNode === tbody && thead) {
      // Move to thead
      thead.appendChild(row);
      Array.from(row.cells).forEach((cell) => {
        const th = editor.dom.create("th", {}, cell.innerHTML);
        row.replaceChild(th, cell);
      });
    }
  } else if (direction === "down") {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
      row.parentNode.insertBefore(nextRow, row);
    } else if (row.parentNode === thead) {
      // Move to tbody
      tbody.appendChild(row);
      Array.from(row.cells).forEach((cell) => {
        const td = editor.dom.create("td", {}, cell.innerHTML);
        row.replaceChild(td, cell);
      });
    }
  }

  editor.nodeChanged();
}

// Define additional toolbar items
const additionalTableToolbarItems =
  " | tablemergecells tablesplitcells | tablecellprops";
const directionalTableToolbarItems =
  " | moveColumnLeft moveRowUp moveRowDown moveColumnRight";
const conversionTableToolbarItems = " | makeCurrentCellTh makeCurrentRowHeader";
// Define the complete table_toolbar configuration
const tableToolbarConfig =
  "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol" +
  additionalTableToolbarItems +
  directionalTableToolbarItems + conversionTableToolbarItems;



tinymce.PluginManager.add("tablesEnhanced", function (editor) {
    moveColumnLeft(editor);
    moveColumnRight(editor);
    moveRowUp(editor);
    moveRowDown(editor);
    makeCurrentRowHeader(editor);
    removeTableStyles(editor);
    addTableMenu(editor);
    addCustomTableCommands(editor);
  });