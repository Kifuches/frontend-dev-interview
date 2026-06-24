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
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
});
