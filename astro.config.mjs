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
    remarkPlugins: [rewriteMarkdownResourceLinks],
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
