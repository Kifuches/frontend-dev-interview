import { defineConfig } from 'astro/config';

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.md$/, '')
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function slugifyHeading(value) {
  return slugify(decodeURIComponent(value).replace(/^#/, ''));
}

const inlineHighlightColors = new Set(['orange', 'green', 'rose', 'blue', 'yellow']);
const inlineHighlightPattern = /\[\[([a-z]+)\]([^\]]+)\]/g;

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightInlineMarkers() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;

      if (Array.isArray(node.children)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          const child = node.children[index];

          if (child?.type !== 'text' || typeof child.value !== 'string') {
            visit(child);
            continue;
          }

          const parts = [];
          let lastIndex = 0;
          let match;

          inlineHighlightPattern.lastIndex = 0;

          while ((match = inlineHighlightPattern.exec(child.value))) {
            const [, color, text] = match;

            if (!inlineHighlightColors.has(color)) continue;
            if (match.index > lastIndex) {
              parts.push({
                type: 'text',
                value: child.value.slice(lastIndex, match.index),
              });
            }

            parts.push({
              type: 'html',
              value: `<mark data-highlight-color="${color}">${escapeHtml(text)}</mark>`,
            });
            lastIndex = match.index + match[0].length;
          }

          if (!parts.length) continue;

          if (lastIndex < child.value.length) {
            parts.push({
              type: 'text',
              value: child.value.slice(lastIndex),
            });
          }

          node.children.splice(index, 1, ...parts);
        }
      }
    };

    visit(tree);
  };
}

function markImportantBlocks() {
  return (tree) => {
    if (!Array.isArray(tree.children)) return;

    const isParagraph = (node) => node?.type === 'paragraph' && Array.isArray(node.children);
    const firstTextChildIndex = (node) =>
      isParagraph(node) ? node.children.findIndex((child) => child.type === 'text') : -1;
    const findEndMarkerIndex = (node) =>
      isParagraph(node)
        ? node.children.findIndex(
            (child) => child.type === 'text' && typeof child.value === 'string' && child.value.includes(']]'),
          )
        : -1;

    const startsImportantBlock = (node) => {
      const firstChild = isParagraph(node) ? node.children[firstTextChildIndex(node)] : null;

      return firstChild?.type === 'text' && /^Важно:\s*\[\[/.test(firstChild.value);
    };

    const stripStartMarker = (node) => {
      const nextNode = structuredClone(node);
      const nextFirstChild = nextNode.children[firstTextChildIndex(nextNode)];

      nextFirstChild.value = nextFirstChild.value.replace(/^Важно:\s*\[\[\s*/, '');

      return nextNode;
    };

    const splitEndMarker = (node) => {
      const endMarkerIndex = findEndMarkerIndex(node);

      if (endMarkerIndex === -1) {
        return { importantNode: node, remainderNode: null };
      }

      const importantNode = structuredClone(node);
      const remainderNode = structuredClone(node);
      const importantChild = importantNode.children[endMarkerIndex];
      const remainderChild = remainderNode.children[endMarkerIndex];
      const markerOffset = importantChild.value.indexOf(']]');

      importantChild.value = importantChild.value.slice(0, markerOffset).replace(/\s*$/, '');
      importantNode.children = importantNode.children.slice(0, endMarkerIndex + 1);

      remainderChild.value = remainderChild.value.slice(markerOffset + 2).replace(/^\s*/, '');
      remainderNode.children = remainderNode.children.slice(endMarkerIndex);

      return { importantNode, remainderNode };
    };

    const isEmptyParagraph = (node) =>
      isParagraph(node) &&
      node.children.every((child) => typeof child.value !== 'string' || !child.value.trim());

    const endsImportantBlock = (node) => findEndMarkerIndex(node) !== -1;

    const nextChildren = [];

    for (let index = 0; index < tree.children.length; index += 1) {
      const node = tree.children[index];

      if (!startsImportantBlock(node)) {
        nextChildren.push(node);
        continue;
      }

      const importantChildren = [];
      let remainderNode = null;
      let isClosed = false;
      const firstNode = stripStartMarker(node);

      if (endsImportantBlock(firstNode)) {
        const { importantNode: onlyNode, remainderNode: onlyRemainderNode } = splitEndMarker(firstNode);
        if (!isEmptyParagraph(onlyNode)) importantChildren.push(onlyNode);
        remainderNode = onlyRemainderNode;
        isClosed = true;
      } else if (!isEmptyParagraph(firstNode)) {
        importantChildren.push(firstNode);
      }

      while (!isClosed && index + 1 < tree.children.length && !endsImportantBlock(tree.children[index + 1])) {
        index += 1;
        importantChildren.push(tree.children[index]);
      }

      if (!isClosed && index + 1 < tree.children.length) {
        index += 1;
        const { importantNode: lastNode, remainderNode: lastRemainderNode } = splitEndMarker(tree.children[index]);
        if (!isEmptyParagraph(lastNode)) importantChildren.push(lastNode);
        remainderNode = lastRemainderNode;
      }

      nextChildren.push({
        type: 'blockquote',
        data: {
          hProperties: {
            className: ['important-block'],
          },
        },
        children: importantChildren,
      });

      if (remainderNode && !isEmptyParagraph(remainderNode)) nextChildren.push(remainderNode);
    }

    tree.children = nextChildren;
  };
}

function rewriteMarkdownResourceLinks() {
  return (tree) => {
    const visit = (node) => {
      if (node && typeof node === 'object') {
        const [resourcePath, heading] =
          typeof node.url === 'string' ? node.url.split('#') : [];

        if (
          node.type === 'link' &&
          typeof node.url === 'string' &&
          !node.url.startsWith('http') &&
          !node.url.startsWith('#') &&
          resourcePath.endsWith('.md')
        ) {
          const fileName = resourcePath.split('/').at(-1);
          const anchor = heading ? `#${slugifyHeading(heading)}` : '';

          node.url = `../${slugify(fileName)}/${anchor}`;
          node.data = {
            ...node.data,
            hProperties: {
              ...node.data?.hProperties,
              'data-internal-resource': 'true',
            },
          };
        }

        if (Array.isArray(node.children)) {
          node.children.forEach(visit);
        }
      }
    };

    visit(tree);
  };
}

function openExternalLinksInNewTab() {
  return (tree) => {
    const visit = (node) => {
      if (node && typeof node === 'object') {
        if (
          node.type === 'element' &&
          node.tagName === 'a' &&
          typeof node.properties?.href === 'string' &&
          /^https?:\/\//.test(node.properties.href)
        ) {
          node.properties.target = '_blank';
          node.properties.rel = 'noreferrer noopener';
        }

        if (Array.isArray(node.children)) {
          node.children.forEach(visit);
        }
      }
    };

    visit(tree);
  };
}

function highlightImportantBlocks() {
  return (tree) => {
    const visit = (node) => {
      if (node && typeof node === 'object') {
        const firstChild = Array.isArray(node.children) ? node.children[0] : null;

        if (
          node.type === 'element' &&
          node.tagName === 'p' &&
          firstChild?.type === 'text' &&
          firstChild.value.startsWith('Важно: ')
        ) {
          firstChild.value = firstChild.value.replace(/^Важно:\s*/, '');
          node.properties = {
            ...node.properties,
            className: [
              ...(Array.isArray(node.properties?.className)
                ? node.properties.className
                : node.properties?.className
                  ? [node.properties.className]
                  : []),
              'important-block',
            ],
          };
        }

        if (Array.isArray(node.children)) {
          node.children.forEach(visit);
        }
      }
    };

    visit(tree);
  };
}

export default defineConfig({
  site: 'https://kifuches.github.io',
  base: '/frontend-dev-interview',
  markdown: {
    remarkPlugins: [markImportantBlocks, rewriteMarkdownResourceLinks, highlightInlineMarkers],
    rehypePlugins: [openExternalLinksInNewTab, highlightImportantBlocks],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
});
