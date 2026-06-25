---
title: Standalone components
section: Angular
subsection: Components
order: 10
description: Как объяснять standalone components на Angular-собеседовании.
---

# Standalone components

`Standalone` components позволяют объявлять компонент без `NgModule`. Зависимости компонента описываются прямо в `imports`, поэтому связь между шаблоном, директивами, пайпами и дочерними компонентами видна локально.

### Что важно сказать на собеседовании

- Standalone-подход упрощает lazy loading и feature-based структуру.
- Компонент можно импортировать напрямую в роут, другой standalone-компонент или тест.
- `NgModule` не исчезает мгновенно: в реальных проектах часто есть гибридная миграция.
- Риск миграции не в синтаксисе, а в пересборке shared-модулей, providers и архитектурных границ.

## Пример

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
