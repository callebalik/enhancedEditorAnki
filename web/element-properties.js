function createDialogConfig() {
  const selectedNode = tinymce.activeEditor.selection.getNode();
  const tagName = selectedNode.tagName.toLowerCase();
  const parentTagName = selectedNode.parentNode ? selectedNode.parentNode.tagName.toLowerCase() : '';

  return {
    title: `Element Properties - <${tagName}>`,
    body: {
      type: 'panel',
      items: [
        {
          type: 'input',
          name: 'class',
          label: 'Class'
        },
        {
          type: 'input',
          name: 'style',
          label: 'Style'
        },
        {
          type: 'input',
          name: 'attributes',
          label: 'Custom Attributes (key=value)'
        },
        {
          type: 'button',
          name: 'parentElement',
          text: `Go to Parent Element <${parentTagName}>`,
          enabled: true,
          primary: false
        },
        {
          type: 'htmlpanel',
          html: `<div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px; max-height: 200px; overflow-y: auto;">
          <pre>${escapeHtml(prettier.format(getDomTree(selectedNode), {
            parser: 'html',
            plugins: prettierPlugins
          }))}</pre>
        </div>`
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'closeButton',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'submitButton',
        text: 'Apply',
        primary: true
      }
    ],
    initialData: getInitialData(),
    onAction: function (api, details) {
        if (details.name === 'parentElement') {
          const selectedNode = tinymce.activeEditor.selection.getNode();
          const parentElement = selectedNode.parentNode;
          alert(parentElement.outerHTML);
        }
    },
    onSubmit: function (api) {
      const data = api.getData();
      const selectedNode = tinymce.activeEditor.selection.getNode();

      // Update class
      if (data.class) {
        selectedNode.className = data.class;
      }

      // Update style
      if (data.style) {
        selectedNode.style.cssText = data.style;
      }

      // Update custom attributes
      if (data.attributes) {
        const attributes = data.attributes.split(',').map(attr => attr.split('='));a
        attributes.forEach(([key, value]) => {
          selectedNode.setAttribute(key.trim(), value.trim());
        });
      }

      tinymce.activeEditor.nodeChanged();
      api.close();
    }
  };
}

function getInitialData() {
  const selectedNode = tinymce.activeEditor.selection.getNode();
  const className = selectedNode.className || '';
  const style = selectedNode.style.cssText || '';
  const attributes = Array.from(selectedNode.attributes)
    .filter(attr => attr.name !== 'class' && attr.name !== 'style')
    .map(attr => `${attr.name}=${attr.value}`)
    .join(',');
  const parentElement = selectedNode.parentNode;

  return {
    class: className,
    style: style,
    attributes: attributes
  };
}

function getDomTree(node) {
  if (!node) return '';
  let tree = '';

  // Get direct parent siblings
  const parentNode = node.parentNode;
  if (parentNode) {
    Array.from(parentNode.children).forEach(sibling => {
      if (sibling !== node) {
        tree += `<div>\n  ${sibling.outerHTML}\n</div>\n`;
      }
    });
  }

  // Get direct descendants
  Array.from(node.children).forEach(child => {
    tree += `<div>\n  ${child.outerHTML}\n</div>\n`;
  });

  return tree;
}

// Function to escape HTML characters
function escapeHtml(html) {
    return html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
  }