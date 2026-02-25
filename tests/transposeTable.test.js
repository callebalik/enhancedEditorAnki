/**
 * Jest tests for transposeTable in web/tables.js
 *
 * Strategy: load tables.js via vm.runInContext with a stubbed `tinymce` global
 * so PluginManager.add captures the setup function. Each test then creates a
 * real jsdom DOM table, builds a mock editor, calls setupFn(editor) to register
 * all commands, and invokes editor.execCommand("transposeTable").
 */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a mock TinyMCE editor.
 * getNodeFn is a zero-arg function returning the "selected" DOM node so tests
 * can provide a live lookup (important for double-transpose tests where the
 * originally selected cell gets detached from the DOM after the first pass).
 */
function createMockEditor(getNodeFn) {
  const commands = {};
  return {
    _commands: commands,
    addCommand(name, fn) { commands[name] = fn; },
    execCommand(name) { commands[name]?.(); },
    addShortcut() {},
    selection: {
      getNode: getNodeFn,
      select(el) { return el; },
    },
    dom: {
      // Use native closest() so real jsdom traversal works
      getParent(node, selector) {
        return node.closest ? node.closest(selector) : null;
      },
      create(tag, _attrs, html) {
        const el = document.createElement(tag);
        if (html) el.innerHTML = html;
        return el;
      },
      insertAfter(newEl, refEl) {
        refEl.parentNode?.insertBefore(newEl, refEl.nextSibling);
      },
    },
    ui: {
      registry: {
        addButton() {},
        addMenuItem() {},
      },
    },
    nodeChanged() {},
  };
}

/** Parse an HTML string and return the first <table> element. */
function buildTable(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.querySelector("table");
}

/**
 * Snapshot the cell innerHTML values of a table as a 2-D array.
 * Reads from table.rows so it covers both thead and tbody.
 */
function snapshot(table) {
  return Array.from(table.rows).map((tr) =>
    Array.from(tr.cells).map((c) => c.innerHTML)
  );
}

// ─── Load tables.js once for all tests ──────────────────────────────────────

let setupFn; // function(editor) registered by PluginManager.add

beforeAll(() => {
  const scriptContent = fs.readFileSync(
    path.join(__dirname, "../web/tables.js"),
    "utf8"
  );

  // Provide the globals the script expects
  const context = vm.createContext({
    tinymce: {
      PluginManager: {
        add(_name, fn) { setupFn = fn; },
      },
    },
    document,   // jsdom's document
    console,
    alert() {},
    Math,
    Array,
  });

  vm.runInContext(scriptContent, context);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("transposeTable", () => {
  test("transposes a 2-row × 3-column table into 3-row × 2-column", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>H1</th><th>H2</th><th>H3</th></tr></thead>
        <tbody><tr><td>A</td><td>B</td><td>C</td></tr></tbody>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    // Shape: was 2 rows × 3 cols → now 3 rows × 2 cols
    expect(table.rows.length).toBe(3);
    expect(table.querySelectorAll("thead tr").length).toBe(1);
    expect(table.querySelectorAll("tbody tr").length).toBe(2);

    // Content layout after transposing:
    //   row 0 (thead): H1 | A
    //   row 1 (tbody): H2 | B
    //   row 2 (tbody): H3 | C
    expect(snapshot(table)).toEqual([
      ["H1", "A"],
      ["H2", "B"],
      ["H3", "C"],
    ]);
  });

  test("transposes a 3-row × 2-column table into 2-row × 3-column", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>Col1</th><th>Col2</th></tr></thead>
        <tbody>
          <tr><td>R1C1</td><td>R1C2</td></tr>
          <tr><td>R2C1</td><td>R2C2</td></tr>
        </tbody>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    expect(table.rows.length).toBe(2);
    expect(snapshot(table)).toEqual([
      ["Col1", "R1C1", "R2C1"],
      ["Col2", "R1C2", "R2C2"],
    ]);
  });

  test("transposes a 2×2 table correctly (all four cells swap)", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>A</th><th>B</th></tr></thead>
        <tbody><tr><td>C</td><td>D</td></tr></tbody>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    expect(snapshot(table)).toEqual([
      ["A", "C"],
      ["B", "D"],
    ]);
  });

  test("applying transpose twice returns to original cell content", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>Name</th><th>Age</th><th>City</th></tr></thead>
        <tbody>
          <tr><td>Alice</td><td>30</td><td>Oslo</td></tr>
          <tr><td>Bob</td><td>25</td><td>Bergen</td></tr>
        </tbody>
      </table>
    `);

    const original = snapshot(table);

    // Use a live lookup so the selected node is never detached
    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);

    editor.execCommand("transposeTable");
    editor.execCommand("transposeTable");

    expect(snapshot(table)).toEqual(original);
  });

  test("single-row table transposes to single-column table", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>X</th><th>Y</th><th>Z</th></tr></thead>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    // 1 row × 3 cols → 3 rows × 1 col
    expect(table.rows.length).toBe(3);
    expect(snapshot(table)).toEqual([["X"], ["Y"], ["Z"]]);
  });

  test("single-column table transposes to single-row table", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>Top</th></tr></thead>
        <tbody>
          <tr><td>Mid</td></tr>
          <tr><td>Bot</td></tr>
        </tbody>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    // 3 rows × 1 col → 1 row × 3 cols
    expect(table.rows.length).toBe(1);
    expect(snapshot(table)).toEqual([["Top", "Mid", "Bot"]]);
  });

  test("preserves HTML markup inside cells", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th><strong>Bold</strong></th><th><em>Italic</em></th></tr></thead>
        <tbody><tr><td>Plain</td><td><a href="#">Link</a></td></tr></tbody>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    expect(snapshot(table)).toEqual([
      ["<strong>Bold</strong>", "Plain"],
      ["<em>Italic</em>", '<a href="#">Link</a>'],
    ]);
  });

  test("does not throw when selection is outside a table", () => {
    const div = document.createElement("div");
    div.textContent = "no table here";
    document.body.appendChild(div);

    const editor = createMockEditor(() => div);
    setupFn(editor);

    expect(() => editor.execCommand("transposeTable")).not.toThrow();

    document.body.removeChild(div);
  });

  test("first transposed row uses <th> cells, body rows use <td> cells", () => {
    const table = buildTable(`
      <table>
        <thead><tr><th>H1</th><th>H2</th></tr></thead>
        <tbody><tr><td>D1</td><td>D2</td></tr></tbody>
      </table>
    `);

    const editor = createMockEditor(() => table.querySelector("td, th"));
    setupFn(editor);
    editor.execCommand("transposeTable");

    const theadCells = Array.from(table.querySelectorAll("thead tr")[0].cells);
    const tbodyCells = Array.from(table.querySelectorAll("tbody tr")[0].cells);

    theadCells.forEach((c) => expect(c.tagName).toBe("TH"));
    tbodyCells.forEach((c) => expect(c.tagName).toBe("TD"));
  });
});
