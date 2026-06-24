---
title: 'Functional Guards'
section: 'Angular'
subsection: 'Guards'
order: 80
description: ''
source: ''
---

`Functional Guards` (Angular 15+) - guards как функции вместо классов. Синтаксис: `canActivateFn`, `canDeactivateFn` и др. Используют [`inject()`](<./angular-dependency-injection-interview-service.md#When to use @Service vs @Injectable>) для dependencies. Преимущества: меньше boilerplate, композабельность, легче тестирование, type-safe. Заменяют class-based guards. Можно комбинировать через логические операторы. Будущее Angular routing guards.

`Functional guards` можно легко композировать: `const guard = () => authGuard() && roleGuard()`.
