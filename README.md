# Interview Prep

Astro-сайт для материалов подготовки к frontend-собеседованиям.

## Структура

- `docs/` — исходные материалы, разложенные по темам.
- `docs/angular/`, `docs/javascript/`, `docs/react/` и другие папки — Markdown-ресурсы конкретных разделов.
- `docs/archive/` — крупные исходники, которые не публикуются как отдельные страницы.
- `docs/assets/` — вложения и не-Markdown файлы.
- `docs/_resource-template.md` — шаблон нового материала, не попадает в каталог.
- `src/lib/materials.ts` — индексирует Markdown-файлы и вычисляет метаданные.
- `src/pages/` — главная, каталог и страницы материалов.
- `src/layouts/BaseLayout.astro` — общий layout и глобальные стили.

## Как добавить материал

Создай `.md` файл в папке нужной темы, например `docs/angular/my-topic.md`.

```md
---
title: Change Detection
section: Angular
subsection: Performance
order: 20
description: Короткое описание материала.
---

# Change Detection

Текст материала.
```

Навигация строится по `section -> subsection -> title`.

## Команды

```bash
npm install
npm run dev
npm run build
```

После запуска dev-сервера сайт будет доступен на адресе, который покажет Astro.
