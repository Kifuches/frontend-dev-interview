---
title: Standalone components
section: Angular
subsection: Components
order: 10
description: Как объяснять standalone components на Angular-собеседовании.
---

# Standalone components

Standalone components позволяют объявлять компонент без NgModule. Зависимости компонента описываются прямо в imports, поэтому связь между шаблоном, директивами, пайпами и дочерними компонентами видна локально.

Standalone Components (Angular 14+) - компоненты без NgModule. Используют `standalone: true` в декораторе.

Импортируют зависимости напрямую через imports. Упрощают архитектуру, уменьшают `boilerplate`, улучшают `tree-shaking`.

Могут использоваться с или без модулей. Будущее Angular - standalone по умолчанию. Поддерживают все features (routing, lazy loading, DI).

Standalone components могут импортировать как standalone так и module-based зависимости.

---

Теперь можно указать `@Component({ standalone: true })`. Такой компонент самостоятельно импортирует всё необходимое.

Например:

```ts
imports: [CommonModule, RouterModule];
```

Преимущества:

✔ меньше кода
✔ проще lazy loading
✔ проще tree shaking
✔ проще тестирование
✔ лучше архитектура

### Что важно сказать на собеседовании

- Standalone-подход упрощает lazy loading и feature-based структуру.
- Компонент можно импортировать напрямую в роут, другой standalone-компонент или тест.
- `NgModule` не исчезает мгновенно: в реальных проектах часто есть гибридная миграция.
- Риск миграции не в синтаксисе, а в пересборке shared-модулей, providers и архитектурных границ.

### Пример

```ts
@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './profile-card.html',
})
export class ProfileCardComponent {}
```

## Частый follow-up

Если спрашивают, зачем это Senior-разработчику, хороший ответ: standalone components делают зависимости явнее и уменьшают случайную связанность, но сами по себе не чинят плохую архитектуру.
