---
title: RxJs
section: Angular
subsection: State Management
order: 90
description: RxJs
source:
---

## RxJS

RxJS нужен, когда связь компонентов основана не просто на текущем значении, а на потоке событий во времени.

Хорошие случаи:

- поиск с `debounceTime`;
- отмена предыдущего HTTP-запроса через `switchMap`;
- поток событий от формы;
- WebSocket;
- polling;
- объединение нескольких async-источников.

```ts
readonly results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((query) => this.api.search(query)),
);
```

Если результат нужен в signal-based компоненте, можно сделать мост:

```ts
readonly results = toSignal(this.results$, { initialValue: [] });
```

Когда не стоит использовать RxJS:

- для простого selected tab;
- для обычного boolean-флага;
- для derived UI state, который проще выразить через `computed()`.
