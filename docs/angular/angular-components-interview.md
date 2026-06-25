---
title: Components
section: Angular
subsection: Components
order: 80
description: Components
source:
---

## Components

На собеседовании вопрос про передачу данных между компонентами проверяет не только знание API. Важно показать, что ты понимаешь направление data flow, границы ответственности и цену каждого способа связи.

Короткий ответ: данные от родителя к ребенку обычно передают через `input`, события от ребенка к родителю - через `output`, общее состояние между несвязанными компонентами - через сервис, `signals`, RxJS или store. Чем дальше компоненты друг от друга и чем сложнее состояние, тем осторожнее нужно выбирать инструмент.

## Как передать данные между компонентами

Основные способы:

| Способ                   | Направление                               | Когда подходит                                     |
| ------------------------ | ----------------------------------------- | -------------------------------------------------- |
| `input()` / `@Input()`   | Родитель -> ребенок                       | Простые данные и конфигурация дочернего компонента |
| `output()` / `@Output()` | Ребенок -> родитель                       | События пользователя и уведомления наверх          |
| `model()`                | Двусторонняя связь                        | Компоненты ввода: slider, checkbox, date picker    |
| Shared service           | Между соседними или дальними компонентами | Feature state, общий контекст, координация         |
| `inject()`               | Получение зависимости                     | Доступ к сервису без constructor injection         |
| RxJS                     | Потоки событий и async                    | Search, WebSocket, polling, отмена запросов        |
| NgRx                     | Глобальное состояние                      | Большой app state, actions/effects/devtools        |

Важно: Не стоит выбирать самый мощный инструмент для простой задачи. Если родитель просто передает ребенку `user`, нужен `input`, а не store.

### `Input`: данные от родителя к ребенку

`Input` используют, когда родитель владеет данными, а дочерний компонент только отображает их или использует как конфигурацию.

Современный вариант в Angular:

```ts
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: `
    <h3>{{ displayName() }}</h3>
    <p>{{ role() }}</p>
  `,
})
export class UserCardComponent {
  name = input.required<string>();
  role = input('frontend developer');

  displayName = computed(() => this.name().trim());
}
```

Использование:

```html
<app-user-card [name]="user.name" [role]="user.role" />
```

`input()` возвращает readonly signal. Его читают как функцию: `this.name()`. Если значение обязательное, используют `input.required<T>()`.

Старый, но полностью поддерживаемый вариант:

```ts
@Input({ required: true }) name!: string;
@Input() role = 'frontend developer';
```

Что важно сказать:

- `Input` должен быть понятным публичным API компонента.
- Дочерний компонент не должен мутировать объект, который пришел от родителя.
- Для `OnPush` лучше передавать новые ссылки, а не мутировать поля объекта.
- Для преобразования входных значений можно использовать `transform`.

Пример с transform:

```ts
import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button [disabled]="disabled()">Save</button>`,
})
export class ButtonComponent {
  disabled = input(false, { transform: booleanAttribute });
}
```

### `Output`: события от ребенка к родителю

`Output` используют, когда дочерний компонент сообщает наружу о событии, но не решает сам, что делать дальше.

```ts
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: ` <button type="button" (click)="remove.emit(userId())">Delete</button> `,
})
export class UserCardComponent {
  userId = input.required<string>();
  remove = output<string>();
}
```

Использование:

```html
<app-user-card [userId]="user.id" (remove)="deleteUser($event)" />
```

Старый вариант:

```ts
@Output() remove = new EventEmitter<string>();
```

Что важно сказать:

- `Output` должен описывать событие, а не команду родителю. Лучше `removed`, `selected`, `submitted`, чем `deleteUserInParent`.
- Ребенок не должен знать, как именно родитель обработает событие.
- `Output` не подходит для глобального состояния или общения дальних частей приложения.

### `model()`: двусторонняя связь

`model()` используют, когда компонент должен и принимать значение, и менять его наружу. Обычно это кастомные form-like компоненты: переключатель, slider, autocomplete, date picker.

```ts
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: `
    <button type="button" (click)="value.update((v) => v - 1)">-</button>
    <span>{{ value() }}</span>
    <button type="button" (click)="value.update((v) => v + 1)">+</button>
  `,
})
export class RatingComponent {
  value = model(0);
}
```

Использование с signal:

```ts
rating = signal(3);
```

```html
<app-rating [(value)]="rating" />
```

Angular автоматически создает output с именем `valueChange`, поэтому `[(value)]` работает как синхронизация значения.

Важно: `model()` не стоит использовать просто потому, что хочется "удобно менять input". Если компонент не является контролом, чаще чище оставить `input` + `output`.

### Signal input

`signal input` - это современная форма input через функцию `input()`. Она хорошо ложится на `computed()` и `effect()`.

```ts
export class ProductCardComponent {
  price = input.required<number>();
  discount = input(0);

  finalPrice = computed(() => {
    return this.price() * (1 - this.discount());
  });
}
```

Плюсы:

- входное значение можно читать реактивно;
- легко строить derived state через `computed()`;
- меньше нужен `ngOnChanges`;
- типы лучше выражают обязательность значения.

Когда использовать:

- в новых компонентах;
- когда значение участвует в derived state;
- когда проект уже использует signals.

Когда можно оставить `@Input`:

- в старом коде, где миграция не окупается;
- если команда еще не перешла на signals;
- если компонент очень простой и стиль проекта построен вокруг decorators.

### Shared service

Shared service подходит, когда несколько компонентов внутри одной feature должны работать с одним состоянием или одним API.

Компоненты получают сервис через DI.

Когда подходит:

- sibling-компоненты не имеют удобной прямой связи;
- состояние относится к одной странице или feature;
- нужно избежать длинной цепочки input/output через 4-5 уровней.

Важно: Лучше ограничивать область жизни такого сервиса. Если state нужен только странице, можно предоставить сервис на уровне route/component providers, а не делать его глобальным singleton через `providedIn: 'root'`.

### `inject()`

`inject()` - это способ получить зависимость из DI без constructor injection.

```ts
export class ProfileComponent {
  private readonly userApi = inject(UserApiService);
  private readonly state = inject(ProfileState);
}
```

Это не способ передачи данных между конкретными parent/child-компонентами напрямую. Это способ получить сервис, через который компоненты могут работать с общим состоянием или логикой.

Когда удобно:

- в standalone components;
- в functional guards/interceptors;
- в сервисах и factory functions;
- когда dependencies используются рядом с полями, `signals` или `computed`.

Когда быть осторожнее:

- не прятать слишком много зависимостей в случайных местах класса;
- не использовать DI как скрытый глобальный канал для всего подряд;
- помнить, что `inject()` работает только в injection context.

## Когда каждый способ подходит

Если компоненты находятся рядом:

- parent -> child: `input`;
- child -> parent: `output`;
- form-like child с двусторонним binding: `model`;
- несколько siblings в одной feature: shared service.

Если компоненты далеко:

- состояние одной feature: feature service;
- async-потоки и отмена запросов: RxJS;
- глобальный state приложения: NgRx.

Если данные просто нужны из общего слоя:

- API, state-service, router, config: `inject()`.

Главная мысль: чем локальнее state, тем локальнее должен быть инструмент. Не надо поднимать состояние в global store, пока оно реально не стало общим для приложения.

## Частые ошибки

- Передавать данные через цепочку из множества `input`/`output`, когда уже нужен feature service.
- Использовать shared service как глобальную переменную без понятного lifecycle.
- Мутировать `@Input` объект внутри ребенка.
- Называть `Output` как команду, а не событие.
- Использовать NgRx для состояния одного модального окна.
- Использовать RxJS там, где достаточно `signal`.
- Использовать `effect()` вместо `output` для уведомления родителя.

## Короткий ответ на собеседовании

Для связи компонентов я сначала смотрю на направление и область состояния. Если родитель передает данные ребенку, использую `input`. Если ребенок сообщает о действии наверх, использую `output`. Если это кастомный контрол, может подойти `model`. Если состояние нужно нескольким компонентам одной feature, выношу его в shared service, часто на signals. Если задача про async-потоки, отмену запросов и композицию событий, использую RxJS. Если состояние глобальное и сложное, тогда рассматриваю NgRx.

## Полезные ссылки

- [Angular Inputs](https://angular.dev/guide/components/inputs)
- [Angular Outputs](https://angular.dev/guide/components/outputs)
- [Angular Signals](https://angular.dev/guide/signals)
