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

  editor.ui.registry.addButton("makeCurrentRowHeader", {
    text: "Row→Header",
    tooltip: "Make Row Header",
    icon: "table-top-header",
    onAction: () => editor.execCommand("makeCurrentRowHeader")
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

  editor.ui.registry.addButton("makeCurrentCellTh", {
    text: "Cell→Header",
    tooltip: "Make Cell Header",
    icon: "table-cell-properties",
    onAction: () => editor.execCommand("makeCurrentCellTh")
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

  editor.addShortcut("meta+alt+left", "Move column left", "moveColumnLeft");

  editor.ui.registry.addButton("moveColumnLeft", {
    tooltip: "Move Column Left (Meta+Alt+Left)",
    icon: "arrow-left",
    onAction: () => editor.execCommand("moveColumnLeft")
  });
}

function moveColumnRight(editor) {
  editor.addCommand("moveColumnRight", function () {
    moveColumn(editor, "right");
  });

  editor.addShortcut("meta+alt+right", "Move column right", "moveColumnRight");

  editor.ui.registry.addButton("moveColumnRight", {
    tooltip: "Move Column Right (Meta+Alt+Right)",
    icon: "arrow-right",
    onAction: () => editor.execCommand("moveColumnRight")
  });
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

  editor.addShortcut("meta+alt+up", "Move row up", "moveRowUp");

  editor.ui.registry.addButton("moveRowUp", {
    tooltip: "Move Row Up (Meta+Alt+Up)",
    icon: "action-prev",
    onAction: () => editor.execCommand("moveRowUp")
  });
}

function moveRowDown(editor) {
  editor.addCommand("moveRowDown", function () {
    moveRow(editor, "down");
  });

  editor.addShortcut("meta+alt+down", "Move row down", "moveRowDown");

  editor.ui.registry.addButton("moveRowDown", {
    tooltip: "Move Row Down (Meta+Alt+Down)",
    icon: "action-next",
    onAction: () => editor.execCommand("moveRowDown")
  });
}

function removeTableStyles(editor) {
  console.log("[DEBUG tables.js] Registering removeTableStyles command");
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
  console.log("[DEBUG tables.js] removeTableStyles command registered");

  editor.ui.registry.addButton("removeTableStyles", {
    text: "Remove Styles",
    tooltip: "Clean Table Styles",
    icon: "code-sample",
    onAction: () => editor.execCommand("removeTableStyles")
  });
}

function addTableMenu(editor) {
  // Register command for converting list to table
  console.log("[DEBUG tables.js] Registering convertUlToTable command");
  editor.addCommand("convertUlToTable", function () {
    const node = editor.selection.getNode();
    const closestUl = editor.dom.getParent(node, "ul");
    if (closestUl) {
      const ulElement = editor.selection.select(closestUl);
      const table = ulToTable(ulElement);
      editor.dom.insertAfter(table, ulElement);
      editor.selection.select(table);
    } else {
      alert("No parent list found from selection");
    }
  });
  console.log("[DEBUG tables.js] convertUlToTable command registered");
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

function transposeTable(editor) {
  editor.addCommand("transposeTable", function () {
    const node = editor.selection.getNode();
    const table = editor.dom.getParent(node, "table");
    if (!table) return;

    // Collect all rows (thead + tbody + tfoot) into a unified 2D matrix
    const allRows = Array.from(table.rows);
    if (allRows.length === 0) return;

    const numCols = Math.max(...allRows.map((r) => r.cells.length));
    const numRows = allRows.length;

    // Build source matrix: [{innerHTML, isHeader}]
    const matrix = allRows.map((tr) => {
      return Array.from({ length: numCols }, (_, colIdx) => {
        const cell = tr.cells[colIdx];
        return {
          html: cell ? cell.innerHTML : "",
          isHeader: cell ? cell.tagName === "TH" : false
        };
      });
    });

    // Transpose: new matrix is [numCols × numRows]
    const transposed = Array.from({ length: numCols }, (_, j) =>
      Array.from({ length: numRows }, (_, i) => matrix[i][j])
    );

    // Rebuild table DOM
    // Remove all existing section elements
    Array.from(table.querySelectorAll("thead, tbody, tfoot")).forEach((s) =>
      s.remove()
    );

    // First transposed row → thead with <th> cells
    const thead = document.createElement("thead");
    const headerTr = document.createElement("tr");
    transposed[0].forEach((cell) => {
      const th = document.createElement("th");
      th.innerHTML = cell.html;
      headerTr.appendChild(th);
    });
    thead.appendChild(headerTr);
    table.appendChild(thead);

    // Remaining transposed rows → tbody with <td> cells
    if (transposed.length > 1) {
      const tbody = document.createElement("tbody");
      transposed.slice(1).forEach((rowData) => {
        const tr = document.createElement("tr");
        rowData.forEach((cell) => {
          const td = document.createElement("td");
          td.innerHTML = cell.html;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
    }

    editor.nodeChanged();
  });

  editor.ui.registry.addButton("transposeTable", {
    text: "Transpose",
    tooltip: "Transpose table: flip columns\u2194rows (first column becomes header row)",
    icon: "table-row-properties",
    onAction: () => editor.execCommand("transposeTable")
  });
}

// Define the complete table_toolbar configuration with custom operations
const tableToolbarConfig =
  "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol" +
  " | tablemergecells tablesplitcells | tablecellprops" +
  " | moveColumnLeft moveColumnRight moveRowUp moveRowDown" +
  " | makeCurrentCellTh makeCurrentRowHeader removeTableStyles" +
  " | transposeTable";



tinymce.PluginManager.add("tablesEnhanced", function (editor) {
    moveColumnLeft(editor);
    moveColumnRight(editor);
    moveRowUp(editor);
    moveRowDown(editor);
    makeCurrentRowHeader(editor);
    makeCurrentCellHeader(editor);
    removeTableStyles(editor);
    addTableMenu(editor);
    transposeTable(editor);
  });