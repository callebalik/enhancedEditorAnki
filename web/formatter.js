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
  editor.addShortcut("meta+shift+alt+u", "unwrapParent", "unwrapParent");
  // Optional: Add a toolbar button to unwrap
  editor.ui.registry.addButton("unwrapParentButton", {
    text: "Unwrap Element",
    tooltip: "Unwrap parent element of the current selection (Meta+Shift+Alt+U)",
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

/**
 * Converts divs with text-based list numbering (e.g., "1. content", "2. content")
 * into proper HTML lists (ol/ul with li elements).
 * Preserves all existing HTML markup like spans, cloze deletions, etc.
 * Works on selection or consecutive divs around cursor.
 * Auto-detects list type and converts if majority of divs match a pattern.
 */
function convertDivsToList(editor) {
  const selectedNode = editor.selection.getNode();
  const body = editor.getBody();

  // Pattern definitions
  const orderedPattern = /^\s*\d+[.)]\s+/; // Matches "1. ", "2) ", etc.
  const unorderedPattern = /^\s*[-•*]\s+/;  // Matches "- ", "• ", "* "

  /**
   * Analyzes a div's text content to determine if it matches a list pattern
   * Returns { type: 'ordered'|'unordered'|null, prefix: matched prefix string }
   */
  function analyzeDiv(div) {
    if (div.nodeName !== 'DIV') return { type: null, prefix: '' };

    // Get the text content of the first text node to check prefix
    const firstChild = div.firstChild;
    let textToCheck = '';

    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      textToCheck = firstChild.textContent;
    } else if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
      // If first child is an element, check if there's a text node before it
      textToCheck = div.textContent;
    } else {
      textToCheck = div.textContent;
    }

    const orderedMatch = textToCheck.match(orderedPattern);
    if (orderedMatch) {
      return { type: 'ordered', prefix: orderedMatch[0] };
    }

    const unorderedMatch = textToCheck.match(unorderedPattern);
    if (unorderedMatch) {
      return { type: 'unordered', prefix: unorderedMatch[0] };
    }

    return { type: null, prefix: '' };
  }

  /**
   * Collects consecutive div siblings starting from a given div
   */
  function collectConsecutiveDivs(startDiv) {
    const divs = [startDiv];

    // Collect previous siblings
    let prev = startDiv.previousElementSibling;
    while (prev && prev.nodeName === 'DIV') {
      divs.unshift(prev);
      prev = prev.previousElementSibling;
    }

    // Collect next siblings
    let next = startDiv.nextElementSibling;
    while (next && next.nodeName === 'DIV') {
      divs.push(next);
      next = next.nextElementSibling;
    }

    return divs;
  }

  /**
   * Strips the list prefix from the beginning of a div's content
   * while preserving all HTML markup
   */
  function stripPrefix(div, prefix) {
    const firstChild = div.firstChild;

    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      // Direct text node - just remove prefix from it
      const text = firstChild.textContent;
      if (text.startsWith(prefix.trim())) {
        firstChild.textContent = text.substring(prefix.length);
      } else if (text.trim().startsWith(prefix.trim())) {
        // Handle cases with extra whitespace
        const trimmedStart = text.match(/^\s*/)[0];
        firstChild.textContent = trimmedStart + text.trim().substring(prefix.trim().length).trimStart();
      }
    } else {
      // Element node or no text node - work with innerHTML
      const html = div.innerHTML;
      const textMatch = div.textContent.match(orderedPattern) || div.textContent.match(unorderedPattern);
      if (textMatch) {
        const prefixToRemove = textMatch[0];
        // Find and replace in innerHTML by recreating without prefix
        const tempDiv = editor.dom.create('div');
        tempDiv.innerHTML = html;
        if (tempDiv.firstChild && tempDiv.firstChild.nodeType === Node.TEXT_NODE) {
          const text = tempDiv.firstChild.textContent;
          tempDiv.firstChild.textContent = text.replace(orderedPattern, '').replace(unorderedPattern, '');
        }
        div.innerHTML = tempDiv.innerHTML;
      }
    }
  }

  // Get divs to analyze - always work with real DOM elements
  let divsToAnalyze = [];

  // Strategy: Walk up the DOM tree finding divs, check each level for list patterns
  let currentNode = selectedNode;
  let foundDivs = false;

  console.log('Starting search from:', selectedNode.nodeName, selectedNode);

  // Walk up the tree looking for a div level that has siblings with list patterns
  while (currentNode && currentNode !== body && !foundDivs) {
    if (currentNode.nodeName === 'DIV') {
      console.log('Found div, checking for siblings with patterns:', currentNode);
      const siblingDivs = collectConsecutiveDivs(currentNode);
      console.log('Collected', siblingDivs.length, 'consecutive divs at this level');

      // Check if any of these divs have list patterns
      const hasPatterns = siblingDivs.some(div => {
        const analysis = analyzeDiv(div);
        return analysis.type !== null;
      });

      if (hasPatterns) {
        console.log('Found list patterns at this level!');
        divsToAnalyze = siblingDivs;
        foundDivs = true;
        break;
      } else {
        console.log('No patterns at this level, trying parent...');
      }
    }
    currentNode = currentNode.parentNode;
  }

  if (!foundDivs) {
    editor.notificationManager.open({
      text: 'No divs with list patterns found (like "1. " or "- "). Place cursor in or near list divs.',
      type: 'warning',
      timeout: 3000
    });
    return;
  }

  console.log('Final collected divs:', divsToAnalyze.length, divsToAnalyze);

  console.log('Starting analysis of', divsToAnalyze.length, 'divs');

  // Analyze all divs and count pattern types
  const analyzed = divsToAnalyze.map(div => {
    const analysis = analyzeDiv(div);
    console.log('Div analysis:', div.textContent.substring(0, 50), '→', analysis);
    return {
      element: div,
      analysis: analysis
    };
  });

  const orderedCount = analyzed.filter(a => a.analysis.type === 'ordered').length;
  const unorderedCount = analyzed.filter(a => a.analysis.type === 'unordered').length;
  const totalMatches = orderedCount + unorderedCount;

  // Determine majority and check if >50% match
  if (totalMatches === 0) {
    editor.notificationManager.open({
      text: 'No list patterns found (e.g., "1. ", "- ", etc.).',
      type: 'info',
      timeout: 3000
    });
    return;
  }

  const majorityThreshold = divsToAnalyze.length * 0.5;
  if (totalMatches <= majorityThreshold) {
    editor.notificationManager.open({
      text: `Only ${totalMatches} of ${divsToAnalyze.length} divs match list patterns. Need majority (>${Math.ceil(majorityThreshold)}) to convert.`,
      type: 'warning',
      timeout: 3000
    });
    return;
  }

  const listType = orderedCount >= unorderedCount ? 'ordered' : 'unordered';
  const listTag = listType === 'ordered' ? 'ol' : 'ul';

  // Filter to only matching divs
  const matchingDivs = analyzed.filter(a => a.analysis.type === listType);

  if (matchingDivs.length === 0) {
    return;
  }

  // Create the list element
  const list = editor.dom.create(listTag);

  // Convert each matching div to li
  matchingDivs.forEach(({ element, analysis }) => {
    const li = editor.dom.create('li');

    // Clone the div's children to preserve all HTML
    const clone = element.cloneNode(true);
    stripPrefix(clone, analysis.prefix);

    // Move all content from clone to li
    while (clone.firstChild) {
      li.appendChild(clone.firstChild);
    }

    list.appendChild(li);
  });

  // Find the first div to replace
  const firstDiv = matchingDivs[0].element;

  // Insert the list before the first div
  firstDiv.parentNode.insertBefore(list, firstDiv);

  // Remove all matching divs
  matchingDivs.forEach(({ element }) => {
    editor.dom.remove(element);
  });

  // Update editor and set cursor in list
  editor.nodeChanged();
  editor.selection.select(list.firstChild || list);
  editor.selection.collapse(true);

  editor.notificationManager.open({
    text: `Converted ${matchingDivs.length} divs to ${listType} list.`,
    type: 'success',
    timeout: 2000
  });
}

// Register the command
function registerFormatters(editor) {

  // Table operations are registered in tables.js tablesEnhanced plugin
  // Other formatter functions
  unwrapParentElement(editor);
  getClassOfCurrentElement(editor);

  editor.addCommand("deleteCurrentElement", function () {
    deleteCurrentElement(editor);
  });

  // Add a toolbar button to delete the current element
  editor.ui.registry.addButton("deleteCurrentElementButton", {
    text: "Delete Element",
    tooltip:
      "Delete the closest div, p, or tr element where the cursor is currently placed (Meta+Shift+K)",
    onAction: function () {
      editor.execCommand("deleteCurrentElement");
    },
  });

  editor.addShortcut(
    "meta+shift+k",
    "deleteCurrentElement",
    "deleteCurrentElement"
  );

  editor.addCommand("getCurrentNode", function () {
    sendCurrentNodeToConsole(editor);
  });

  editor.addCommand("sendCurrentNodeToConsole", function () {
    sendCurrentNodeToConsole(editor);
  });

  editor.addCommand("fixDomHierarchy", function () {
    fixDomHierarchy(editor);
  });

  // Add a toolbar button to get the current node
  editor.ui.registry.addButton("getCurrentNodeButton", {
    text: "Get Node",
    tooltip: "Get the current node",
    onAction: function () {
      editor.execCommand("getCurrentNode");
    },
  });

  // Convert divs to list command
  editor.addCommand("convertToList", function () {
    convertDivsToList(editor);
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

