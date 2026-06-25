export type MaterialModule = {
  Content: any;
  frontmatter?: Record<string, unknown>;
  rawContent?: () => string;
  compiledContent?: () => string;
};

export type MaterialHeading = {
  depth: number;
  slug: string;
  text: string;
};

export type Material = {
  slug: string;
  path: string;
  fileName: string;
  title: string;
  category: string;
  section: string;
  subsection: string;
  order: number;
  format: 'questions' | 'answers' | 'tasks' | 'topics' | 'analysis' | 'resume' | 'material';
  stack: 'Angular' | 'JavaScript' | 'React' | 'Career' | 'General';
  minutes: number;
  words: number;
  excerpt: string;
  searchText: string;
  headings: MaterialHeading[];
  module: MaterialModule;
};

const modules = import.meta.glob<MaterialModule>('../../docs/**/*.md', { eager: true });
const archivedSourceFiles = new Set([
  'Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md',
  'Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e copy.md',
]);

const formatLabels: Record<Material['format'], string> = {
  questions: 'Вопросы',
  answers: 'Ответы',
  tasks: 'Задачи',
  topics: 'Темы',
  analysis: 'Анализ',
  resume: 'Резюме',
  material: 'Материал',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.md$/, '')
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function cleanHeading(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function extractHeadings(module: MaterialModule) {
  const raw = module.rawContent?.() ?? '';
  const withoutCodeBlocks = raw.replace(/```[\s\S]*?```/g, '');
  const usedSlugs = new Map<string, number>();
  const headings: MaterialHeading[] = [];
  const headingPattern = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(withoutCodeBlocks))) {
    const text = cleanHeading(match[2]);
    const baseSlug = slugify(text);
    const count = usedSlugs.get(baseSlug) ?? 0;

    usedSlugs.set(baseSlug, count + 1);
    headings.push({
      depth: match[1].length,
      slug: count ? `${baseSlug}-${count}` : baseSlug,
      text,
    });
  }

  return headings;
}

function cleanTitle(value: string) {
  return value
    .replace(/\.md$/, '')
    .replace(/\+[a-f0-9-]{20,}/gi, '')
    .replace(/\+/g, ' ')
    .replace(/\s+copy$/i, ' копия')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferFormat(fileName: string, title: string): Material['format'] {
  const source = `${fileName} ${title}`.toLowerCase();

  if (source.includes('code-task') || source.includes('debugging') || source.includes('задач')) {
    return 'tasks';
  }
  if (source.includes('answers') || source.includes('ответ')) return 'answers';
  if (source.includes('questions') || source.includes('вопрос')) return 'questions';
  if (source.includes('topics') || source.includes('тем')) return 'topics';
  if (source.includes('analysis') || source.includes('vacancies')) return 'analysis';
  if (source.includes('резюме') || source.includes('resume')) return 'resume';

  return 'material';
}

function inferStack(fileName: string, title: string): Material['stack'] {
  const source = `${fileName} ${title}`.toLowerCase();

  if (source.includes('angular')) return 'Angular';
  if (source.includes('javascript') || source.includes('js-')) return 'JavaScript';
  if (source.includes('react')) return 'React';
  if (source.includes('vacancies') || source.includes('резюме')) return 'Career';

  return 'General';
}

function plainText(module: MaterialModule) {
  const raw = module.rawContent?.() ?? module.compiledContent?.() ?? '';

  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*_>\-[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFrom(module: MaterialModule, fileName: string) {
  const raw = module.rawContent?.() ?? '';
  const heading = raw.match(/^#\s+(.+)$/m)?.[1];
  const frontmatterTitle = module.frontmatter?.title;

  if (typeof frontmatterTitle === 'string') return frontmatterTitle;
  if (heading) return heading.replace(/\*/g, '').trim();

  return cleanTitle(fileName);
}

function stringFromFrontmatter(module: MaterialModule, key: string) {
  const value = module.frontmatter?.[key];

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberFromFrontmatter(module: MaterialModule, key: string) {
  const value = module.frontmatter?.[key];

  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return Number(value);

  return undefined;
}

export const materials = Object.entries(modules)
  .filter(([path]) => {
    const fileName = path.split('/').at(-1) ?? path;

    return !fileName.startsWith('_') && !archivedSourceFiles.has(fileName);
  })
  .map(([path, module]) => {
    const fileName = path.split('/').at(-1) ?? path;
    const title = titleFrom(module, fileName);
    const text = plainText(module);
    const words = text ? text.split(/\s+/).length : 0;
    const format = inferFormat(fileName, title);
    const stack = inferStack(fileName, title);

    return {
      slug: slugify(fileName) || slugify(title),
      path,
      fileName,
      title,
      category: formatLabels[format],
      section: stringFromFrontmatter(module, 'section') ?? stack,
      subsection: stringFromFrontmatter(module, 'subsection') ?? formatLabels[format],
      order: numberFromFrontmatter(module, 'order') ?? 999,
      format,
      stack,
      minutes: Math.max(1, Math.ceil(words / 180)),
      words,
      excerpt: text.split(' ').slice(0, 30).join(' '),
      searchText: text,
      headings: extractHeadings(module),
      module,
    };
  })
  .sort(
    (a, b) =>
      a.section.localeCompare(b.section, 'ru') ||
      a.subsection.localeCompare(b.subsection, 'ru') ||
      a.order - b.order ||
      a.title.localeCompare(b.title, 'ru'),
  );

export const stacks = Array.from(new Set(materials.map((material) => material.section)));

export const navigationTree = stacks.map((section) => {
  const sectionMaterials = materials.filter((material) => material.section === section);
  const subsections = Array.from(new Set(sectionMaterials.map((material) => material.subsection))).map(
    (subsection) => ({
      title: subsection,
      materials: sectionMaterials.filter((material) => material.subsection === subsection),
    }),
  );

  return {
    section,
    count: sectionMaterials.length,
    subsections,
  };
});

export function getMaterial(slug: string) {
  return materials.find((material) => material.slug === slug);
}

export function getStackSummary() {
  return stacks.map((stack) => ({
    stack,
    count: materials.filter((material) => material.section === stack).length,
    minutes: materials
      .filter((material) => material.section === stack)
      .reduce((sum, material) => sum + material.minutes, 0),
  }));
}
