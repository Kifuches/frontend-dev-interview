---
title: RxJS
section: RxJS
subsection: Core concepts
order: 10
description: RxJS.
source: Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md
---

# **Часть 2. RxJS**

Это почти половина Angular интервью.

Вопросы:

Что такое Observable?

Чем отличается:

- Subject

- BehaviorSubject

- ReplaySubject

- AsyncSubject

Операторы:

- map

- switchMap

- mergeMap

- concatMap

- exhaustMap

Любимый вопрос:

Когда использовать switchMap, а когда mergeMap?

---

Очень часто спрашивают:

Как избежать memory leaks?

Ожидают:

```ts
takeUntilDestroyed();

DestroyRef;

AsyncPipe;
```

---

Практические задачи:

Есть поиск.

Пользователь вводит текст.

Как отменять предыдущие запросы?

Ответ:

switchMap

debounceTime

distinctUntilChanged

---
