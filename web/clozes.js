function clozesMain(editor) {
  // Cloze with increment
  editor.addCommand("nextCloze", function () {
    let selected_text = editor.selection.getContent({ format: "html" });
    let content = editor.getContent();
    let return_text = newClozeText(content, selected_text, false);
    editor.execCommand("mceInsertContent", 0, return_text);
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
