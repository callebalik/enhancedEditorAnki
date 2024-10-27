function clozesMain(editor) {
  // Cloze with increment
  editor.addCommand("nextCloze", function () {
    let selected_text = editor.selection.getContent({ format: "html" });
    let content = editor.getContent();
    let return_text = newClozeText(content, selected_text, false);
    editor.execCommand("mceInsertContent", 0, return_text);
    applyClozeHighlighting(editor);
  });
  editor.addShortcut("ctrl+shift+c", "nextCloze", "nextCloze");
  editor.ui.registry.addButton("nextCloze", {
    text: "Cln",
    tooltip: "nextCloze" + "(" + "ctrl+shift+c" + ")",
    onAction: () => {
      editor.execCommand("nextCloze");
    },
  });

  //   Cloze no increment
  editor.addCommand("sameCloze", function () {
    let selected_text = editor.selection.getContent({ format: "html" });
    let content = editor.getContent();
    let return_text = newClozeText(content, selected_text, true);
    editor.execCommand("mceInsertContent", 0, return_text);
    applyClozeHighlighting(editor);
  });
  editor.addShortcut("ctrl+alt+shift+c", "addCloze", "sameCloze");
  editor.ui.registry.addButton("sameCloze", {
    text: "Cls",
    tooltip: "sameCloze" + "(" + "ctrl+alt+shift+c" + ")",
    onAction: () => {
      editor.execCommand("sameCloze");
    },
  });

  editor.addCommand("clozeNumber", function () {
    let selected_text = editor.selection.getContent({ format: "html" });
    let return_text = newClozeTextNumber(selected_text);
    editor.execCommand("mceInsertContent", 0, return_text);
    applyClozeHighlighting(editor);
  });
  editor.addShortcut("ctrl+shift+n", "clozeNumber", "clozeNumber");
  editor.ui.registry.addButton("clozeNumber", {
    text: "Cln#",
    tooltip: "clozeNumber" + "(" + "ctrl+shift+n" + ")",
    onAction: () => {
      editor.execCommand("clozeNumber");
    },
  });
}

function newClozeText(content, selected_text, same) {
  // this function is adjusted from kian which is
  //    Copyright (C) 2018 Hyun Woo Park, License: AGPLv3, http://www.gnu.org/licenses/.
  // https://github.com/phu54321/kian/blob/develop/src/components/editor/utils/cloze.js
  var maxClozeId = 0;
  content.replace(/\{\{c(\d+)::/g, (match, g1) => {
    const clozeId = parseInt(g1);
    if (maxClozeId < clozeId) maxClozeId = clozeId;
  });
  if (same) {
    var newClozeIndex = Math.max(maxClozeId, 1);
  } else {
    var newClozeIndex = maxClozeId + 1;
  }
  var text = "{{c" + newClozeIndex + "::" + selected_text + "}}";
  return text;
}

// unused
// preparation for cloze overlapper: the actual clozes - ctrl+shift+c need to be made from
// the regular Add window
function newOCclozeText(content, selected_text, same) {
  //this function is adjusted from kian which is
  //    Copyright (C) 2018 Hyun Woo Park, License: AGPLv3, http://www.gnu.org/licenses/.
  //https://github.com/phu54321/kian/blob/develop/src/components/editor/utils/cloze.js
  var maxClozeId = 0;
  content.replace(/\[\[oc(\d+)::/g, (match, g1) => {
    const clozeId = parseInt(g1);
    if (maxClozeId < clozeId) maxClozeId = clozeId;
  });
  if (same) {
    var newClozeIndex = Math.max(maxClozeId, 1);
  } else {
    var newClozeIndex = maxClozeId + 1;
  }
  var text = "[[oc" + newClozeIndex + "::" + selected_text + "]]";
  return text;
}

function newClozeTextNumber(selected_text) {
  let newClozeIndex = prompt("Enter the cloze number:");
  if (isNaN(newClozeIndex) || newClozeIndex.trim() === "") {
    alert("Please enter a valid number.");
    return;
  }
  var text = "{{c" + newClozeIndex + "::" + selected_text + "}}";
  return text;
}

// Function to apply cloze highlighting
function closeEditor(editor) {
    let content = editor.getContent({ format: "html" });
    content = removeClozeHighlighting(content);
    editor.setContent(content, { format: "html" });
}

function applyClozeHighlighting(editor) {
    console.log("Applying cloze highlighting");
    let content = editor.getContent({ format: "html" });
    content = removeClozeHighlighting(content);
    content = addClozeHighlighting(content);
    editor.setContent(content, { format: "html" });
}

  function removeClozeHighlighting(content) {
    // Step 2: Parse the content into a DOM document
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Step 3: Remove existing cloze highlighting
    // Remove all <span class="cloze-brackets"> elements
    const bracketsSpans = doc.querySelectorAll('span.cloze-brackets');
    console.log(bracketsSpans);
    bracketsSpans.forEach((span) => {
      // Replace the span with its child nodes (unwrap)
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });

    // Remove all <span class="cloze-highlight"> elements
    const highlightSpans = doc.querySelectorAll('span.cloze-highlight');
    highlightSpans.forEach((span) => {
      // Replace the span with its child nodes (unwrap)
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });

    // Step 4: Serialize the modified DOM back to HTML
    const newContent = doc.body.innerHTML;

    return newContent;
}

function addClozeHighlighting(content) {
    content = content.replace(/\{\{c(\d+)::(.*?)\}\}/g, (match, p1, p2) => {
      return `<span class="cloze-brackets">{{c${p1}::</span><span class="cloze-highlight">${p2}</span><span class="cloze-brackets">}}</span>`;
    });
    return content;
}

function toggleClozeHighlighting(editor) {
    $
}