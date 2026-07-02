---
title: Lifecycle
section: Angular
subsection: Base
order: 70
description: Lifecycle hooks, ngOnInit, ngAfterViewInit, ViewChild
source:
---

## Lifecycle

На собеседовании по Angular lifecycle важно не просто перечислить хуки. Хороший ответ объясняет, что lifecycle связан с тем, как Angular создает компонент, инициализирует inputs, проверяет template bindings, создает content/view children и уничтожает компонент.

Коротко: `constructor` создает экземпляр класса, `ngOnChanges` реагирует на изменения input, `ngOnInit` вызывается после первичной инициализации inputs, content hooks относятся к projected content через `ng-content`, view hooks относятся к собственному шаблону компонента, а `ngOnDestroy` нужен для cleanup.

## Порядок вызова хуков

Упрощенный порядок при первой инициализации:

| Этап                      | Hook                                   | Что происходит                                        |
| ------------------------- | -------------------------------------- | ----------------------------------------------------- |
| Создание класса           | `constructor`                          | Angular создает instance и может внедрить зависимости |
| Inputs                    | `ngOnChanges`                          | Первый раз приходит до `ngOnInit`, если есть inputs   |
| Init                      | `ngOnInit`                             | Inputs уже инициализированы                           |
| Custom check              | `ngDoCheck`                            | Ручная проверка изменений, используется редко         |
| Projected content         | `ngAfterContentInit`                   | Инициализирован контент из `ng-content`               |
| Projected content checked | `ngAfterContentChecked`                | Projected content проверен                            |
| Component view            | `ngAfterViewInit`                      | Инициализирован собственный view компонента           |
| Component view checked    | `ngAfterViewChecked`                   | View проверен                                         |
| Render callbacks          | `afterNextRender` / `afterEveryRender` | DOM уже отрендерен приложением                        |
| Destroy                   | `ngOnDestroy`                          | Компонент скоро будет уничтожен                       |

При последующих обновлениях обычно участвуют `ngOnChanges`, `ngDoCheck`, `ngAfterContentChecked`, `ngAfterViewChecked` и render callbacks.

Важно: Не стоит менять состояние в середине lifecycle-прохода без необходимости. Angular в этот момент идет по дереву компонентов сверху вниз, и неожиданные изменения могут привести к `ExpressionChangedAfterItHasBeenCheckedError`.

## `constructor`

`constructor` - это обычный TypeScript/JavaScript constructor. Он нужен для создания экземпляра класса и получения зависимостей.

```ts
export class UserProfileComponent {
  private readonly api = inject(UserApiService);
}
```

Что можно делать:

- внедрять зависимости;
- инициализировать простые поля;
- регистрировать render callbacks вроде `afterNextRender`;
- создавать readonly configuration.

Что лучше не делать:

- обращаться к template DOM;
- читать `ViewChild`;
- запускать HTTP-загрузку, зависящую от `input`;
- писать сложную бизнес-логику.

Причина простая: компонент как класс уже создан, но Angular еще не закончил инициализацию inputs и view.

## `ngOnChanges`

`ngOnChanges` вызывается, когда меняются input properties. Во время инициализации первый `ngOnChanges` приходит до `ngOnInit`.

```ts
export class UserCardComponent implements OnChanges {
  @Input({ required: true }) userId!: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      console.log('previous', changes['userId'].previousValue);
      console.log('current', changes['userId'].currentValue);
      console.log('first', changes['userId'].firstChange);
    }
  }
}
```

Когда подходит:

- нужно реагировать именно на изменение `input`;
- нужно сравнить старое и новое значение;
- нужно пересчитать локальное состояние на основе inputs.

В современном signal-based коде часть таких сценариев можно заменить на `computed()`:

```ts
export class UserCardComponent {
  firstName = input.required<string>();
  lastName = input.required<string>();

  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

## `ngOnInit`

`ngOnInit` вызывается один раз после того, как Angular инициализировал inputs компонента.

Что можно делать в `ngOnInit`:

- запускать загрузку данных, если она зависит от initial inputs;
- инициализировать форму;
- подписываться на streams, если подписка относится к жизненному циклу компонента;
- собрать начальное состояние компонента из inputs и сервисов.

```ts
export class ProfilePageComponent implements OnInit {
  userId = input.required<string>();
  user = signal<User | null>(null);

  private readonly api = inject(UserApiService);

  ngOnInit(): void {
    this.api.getUser(this.userId()).subscribe((user) => {
      this.user.set(user);
    });
  }
}
```

Что не стоит делать в `ngOnInit`:

- читать `ViewChild`, который относится к view;
- измерять DOM;
- обращаться к child-компонентам из собственного шаблона;
- делать логику, которую проще выразить через `computed()`.

Важно: `ngOnInit` происходит до полной инициализации собственного template view компонента. Поэтому для view queries и DOM-зависимой логики обычно нужен `ngAfterViewInit` или render callback.

## Почему `ngAfterViewInit` вызывается позже

`ngAfterViewInit` вызывается после того, как Angular инициализировал view компонента: его template, DOM-элементы, дочерние компоненты и view queries.

Это происходит позже `ngOnInit`, потому что Angular сначала должен:

1. Создать instance компонента.
2. Передать initial inputs.
3. Выполнить начальные lifecycle hooks.
4. Построить и проверить template view.
5. Инициализировать view children и view queries.

Только после этого Angular может гарантировать, что элементы из шаблона реально существуют.

```ts
export class SearchBoxComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.searchInput?.nativeElement.focus();
  }
}
```

```html
<input #searchInput type="search" />
```

Senior-ответ: `ngAfterViewInit` позднее не случайно. Он относится не к созданию класса и не к inputs, а к готовности view. Пока Angular не построил view, ссылаться на элементы шаблона небезопасно.

## Почему нельзя обращаться к `ViewChild` раньше

`ViewChild` ищет элемент, директиву или компонент внутри view текущего компонента. До инициализации view Angular еще не создал все элементы шаблона, поэтому ссылка может быть `undefined`.

```ts
export class PanelComponent implements OnInit, AfterViewInit {
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    console.log(this.panel); // часто undefined
  }

  ngAfterViewInit(): void {
    console.log(this.panel); // view уже создан
  }
}
```

В современных Angular queries есть signal-based API:

```ts
import { Component, ElementRef, effect, viewChild } from '@angular/core';

@Component({
  selector: 'app-panel',
  template: `<section #panel>Content</section>`,
})
export class PanelComponent {
  panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect(() => {
      const panel = this.panel();

      if (panel) {
        console.log(panel.nativeElement.offsetHeight);
      }
    });
  }
}
```

Signal query может сначала вернуть `undefined`, а затем обновиться, когда view станет доступен.

Важно: Даже если query доступна в `ngAfterViewInit`, менять bound state прямо в этом hook нужно осторожно. Часто лучше отложить DOM-read/write в `afterNextRender` или использовать signal/computed-подход без ручной мутации.

## `ngAfterContentInit` vs `ngAfterViewInit`

Разница:

- `content` - это то, что родитель передал внутрь компонента через `ng-content`;
- `view` - это собственный template компонента.

Пример projected content:

```html
<app-card>
  <app-card-title>Profile</app-card-title>
</app-card>
```

Внутри `app-card`:

```html
<section>
  <ng-content />
</section>
```

Если нужно работать с projected content, используется `ContentChild`/`contentChild` и content hooks.

Если нужно работать с элементами собственного template, используется `ViewChild`/`viewChild` и view hooks.

```ts
export class CardComponent implements AfterContentInit, AfterViewInit {
  @ContentChild(CardTitleComponent) title?: CardTitleComponent;
  @ViewChild('container') container?: ElementRef<HTMLElement>;

  ngAfterContentInit(): void {
    console.log(this.title);
  }

  ngAfterViewInit(): void {
    console.log(this.container);
  }
}
```

## `ngDoCheck`

`ngDoCheck` вызывается очень часто: каждый раз, когда Angular проверяет компонент.

Используют редко, когда нужно вручную отследить изменение, которое Angular стандартным способом не видит или которое требует кастомного diff.

```ts
export class ExpensiveComponent implements DoCheck {
  ngDoCheck(): void {
    // Только если без этого действительно нельзя.
  }
}
```

Почему осторожно:

- hook вызывается часто;
- легко добавить дорогую работу на каждый change detection cycle;
- большинство задач лучше решается через immutable data, `OnPush`, `signals`, `computed()` или RxJS.

На собеседовании хороший ответ: "`ngDoCheck` я бы рассматривала как escape hatch, а не как обычный инструмент".

## `ngAfterViewChecked` и `ngAfterContentChecked`

Эти hooks вызываются после каждой проверки content/view.

Они полезны редко. В них можно прочитать актуальное состояние query, но нельзя бездумно менять state, который участвует в template bindings.

Плохой пример:

```ts
ngAfterViewChecked(): void {
  this.title = this.child?.title ?? '';
}
```

Такой код может вызывать лишние циклы, ошибки и проблемы производительности.

Лучше:

- построить state заранее;
- использовать `input`/`output`;
- использовать `computed()`;
- использовать render callback для DOM-задач;
- подписаться на конкретное событие, а не реагировать на каждую проверку view.

## `afterNextRender` и `afterEveryRender`

`afterNextRender` и `afterEveryRender` - это render callbacks. Они вызываются не как методы класса, а как функции, которые принимают callback.

Они нужны, когда важно дождаться, что Angular закончил рендер всех компонентов в DOM.

```ts
import { afterNextRender, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-chart',
  template: `<div class="chart"></div>`,
})
export class ChartComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      const chartElement = this.elementRef.nativeElement.querySelector('.chart');
      console.log(chartElement?.getBoundingClientRect());
    });
  }
}
```

Когда использовать:

- измерить DOM после рендера;
- интегрировать стороннюю DOM-библиотеку;
- сделать DOM read/write после того, как Angular закончил отрисовку;
- избежать части проблем с изменением state внутри классических lifecycle hooks.

Важно: Render callbacks не выполняются во время server-side rendering и build-time prerendering. Если код должен работать на SSR, нужно учитывать это отдельно.

## `ngOnDestroy` и cleanup

`ngOnDestroy` вызывается один раз перед уничтожением компонента: например, при уходе со страницы или когда блок исчезает из-за `@if`.

Что обычно чистят:

- ручные subscriptions;
- timers;
- DOM event listeners;
- instances сторонних библиотек;
- ресурсы, привязанные к компоненту.

```ts
export class TimerComponent implements OnDestroy {
  private readonly intervalId = window.setInterval(() => {
    console.log('tick');
  }, 1000);

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }
}
```

Современный вариант - `DestroyRef`:

```ts
import { DestroyRef, inject } from '@angular/core';

export class TimerComponent {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const intervalId = window.setInterval(() => {
      console.log('tick');
    }, 1000);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
    });
  }
}
```

Для RxJS в Angular часто используют `takeUntilDestroyed()`:

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class SearchComponent {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((query) => {
      console.log(query);
    });
  }
}
```

## Что можно делать в `ngOnInit`

Короткий ответ для интервью:

- читать initial inputs;
- запускать initial data loading;
- создавать форму;
- подписываться на streams компонента;
- инициализировать state, который не зависит от готового DOM.

Пример:

```ts
export class OrdersPageComponent implements OnInit {
  filter = input<'active' | 'archived'>('active');
  orders = signal<Order[]>([]);

  private readonly api = inject(OrdersApiService);

  ngOnInit(): void {
    this.api.getOrders(this.filter()).subscribe((orders) => {
      this.orders.set(orders);
    });
  }
}
```

Если загрузка должна реагировать на дальнейшие изменения input, одного `ngOnInit` мало. Тогда лучше использовать `ngOnChanges`, `computed` + `resource`, RxJS или router data flow.

## Частые ошибки

- Считать, что `constructor` и `ngOnInit` - одно и то же.
- Читать `ViewChild` в `ngOnInit`.
- Делать DOM measurements до `ngAfterViewInit` или `afterNextRender`.
- Использовать `ngAfterViewChecked` для регулярной бизнес-логики.
- Забывать cleanup в `ngOnDestroy`.
- Делать тяжелую работу в `ngDoCheck`.
- Менять bound state внутри `ngAfterViewInit` и удивляться `ExpressionChangedAfterItHasBeenCheckedError`.
- Использовать lifecycle hooks там, где проще `computed()`, `effect()`, `input()` или RxJS.

## Короткий ответ на собеседовании

Lifecycle в Angular отражает этапы создания, проверки и уничтожения компонента. `constructor` нужен для создания instance и DI, `ngOnChanges` реагирует на input changes, `ngOnInit` запускается один раз после initial inputs, `ngAfterContentInit` относится к projected content, а `ngAfterViewInit` - к собственному template view. Поэтому `ViewChild` нельзя надежно читать раньше `ngAfterViewInit`: view еще не построен. Для cleanup используют `ngOnDestroy`, `DestroyRef` или `takeUntilDestroyed`. Для DOM-задач после фактического рендера сейчас часто подходят `afterNextRender` и `afterEveryRender`.

## Источники и лицензия

- [Angular Component Lifecycle](https://angular.dev/guide/components/lifecycle)
- [Angular Queries](https://angular.dev/guide/components/queries)
- [Using DOM APIs](https://angular.dev/guide/components/dom-apis)
