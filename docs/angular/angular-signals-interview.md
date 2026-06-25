---
title: Signals
section: Angular
subsection: State Management
order: 60
description: Signals
source: Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md
---

## Signals (Angular 17-20)

Практически обязательная тема на Angular-собеседованиях. Хороший ответ не должен сводиться к "это новая реактивность". Важно объяснить, какую проблему signals решают: они позволяют Angular точнее понимать, где используется состояние, и обновлять UI более гранулярно.

## Что такое `signal()`

`signal()` создает синхронное реактивное значение. Сигнал читается как функция: `count()`. Когда значение меняется через `set()` или `update()`, Angular знает, какие потребители зависят от этого значения.

```ts
const count = signal(0);

count.set(3);
count.update((value) => value + 1);

console.log(count());
```

Главная разница с обычным полем класса: Angular может отследить чтение сигнала в шаблоне, `computed()` или `effect()` и потом обновить только зависимые места.

На собеседовании стоит добавить:

- `signal()` хранит текущее значение всегда, его можно прочитать синхронно.
- Для изменения writable signal используют `set()` и `update()`.
- Для наружного API сервиса часто отдают readonly-версию через `asReadonly()`.
- По умолчанию сравнение значений идет по `Object.is()`, но можно передать свою функцию equality.

```ts
@Injectable({ providedIn: 'root' })
export class CounterState {
  private readonly _count = signal(0);

  readonly count = this._count.asReadonly();

  increment(): void {
    this._count.update((value) => value + 1);
  }
}
```

## Что изменилось после появления `Signals`?

`Signals` (Angular 16+) - новый реактивный примитив для управления состоянием.

`signal()` создает реактивное значение.

`effect()` реагирует на изменения.

`computed()` вычисляет производное значение.

`Fine-grained reactivity` - обновляет только то что изменилось.

Альтернатива `Zone.js change detection`. Улучшает производительность, делает CD более предсказуемым. Будущее Angular reactivity.

`Signals` работают синхронно в отличие от `Observable` которые асинхронны.

```ts
// Раньше
Zone.js
↓
Полная проверка дерева

// Теперь
Signal
↓
Angular знает КТО изменился
↓
Обновляет только нужные компоненты
```

Это намного эффективнее.

## Что такое `computed()`

`computed()` создает readonly signal, значение которого вычисляется из других signals.

```ts
const firstName = signal('Ada');
const lastName = signal('Lovelace');

const fullName = computed(() => `${firstName()} ${lastName()}`);
```

`computed()` ленивый и мемоизированный: вычисление запускается при первом чтении, результат кэшируется, а пересчет происходит только после изменения зависимостей и следующего чтения.

Важно: Зависимости у `computed()` динамические. Angular отслеживает только те `signals`, которые реально были прочитаны во время последнего вычисления.

```ts
const showDetails = signal(false);
const user = signal({ name: 'Ada', role: 'admin' });

const label = computed(() => {
  if (!showDetails()) {
    return 'User';
  }

  return `${user().name} (${user().role})`;
});
```

Если `showDetails()` равен `false`, `user()` не читается, значит изменение `user` не инвалидирует `label`.

Что сказать на senior-уровне:

- `computed()` подходит для derived state: фильтрации, форматирования, вычисления флагов UI.
- Не стоит делать side effects внутри `computed()`: он должен быть чистым вычислением.
- Нельзя вызывать `set()` у `computed()`, потому что это readonly signal.

## Что такое `effect()`

`effect()` запускает функцию, которая читает signals, и повторяет ее, когда эти signals меняются. Это инструмент для side effects, а не для вычисления state.

```ts
const query = signal('');

effect(() => {
  console.log('Search query changed:', query());
});
```

Хорошие кейсы для `effect()`:

- логирование;
- синхронизация с browser API;
- запись в `localStorage`;
- вызов внешнего imperative API, который не является частью Angular-шаблона.

Плохие кейсы:

- пересчитывать одно состояние в другое, если можно использовать `computed()`;
- строить цепочки `effect()` -> `set()` -> `effect()`;
- делать сложные async-flow вместо RxJS или `resource`.

Пример нормального использования:

```ts
const theme = signal<'light' | 'dark'>('dark');

effect(() => {
  localStorage.setItem('theme', theme());
});
```

Если внутри `effect()` нужно прочитать signal, но не сделать его зависимостью, используют `untracked()`.

```ts
effect(() => {
  const currentUser = user();

  untracked(() => {
    analytics.trackUser(currentUser.id, counter());
  });
});
```

Здесь `effect()` зависит от `user`, но не от `counter`.

## Signal vs Observable

Короткий ответ: `signal` - это текущее синхронное состояние, Observable - это поток значений во времени.

| Критерий              | `Signal`                     | `Observable`                                  |
| --------------------- | ---------------------------- | --------------------------------------------- |
| Модель                | Значение сейчас              | Поток событий                                 |
| Чтение                | Синхронно: `value()`         | Через `subscribe`, `async pipe`, `toSignal()` |
| Значение по умолчанию | Всегда есть текущее значение | Может не быть до первого emit                 |
| Отмена                | Обычно не нужна              | Важна для async и long-lived streams          |
| Сильная сторона       | UI state и derived state     | Async, события, сложные stream-сценарии       |

Пример, где `signal` удобнее:

```ts
const selectedTab = signal<'profile' | 'settings'>('profile');
const isProfile = computed(() => selectedTab() === 'profile');
```

Пример, где `Observable` удобнее:

```ts
results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((query) => this.api.search(query)),
);
```

Здесь важны `debounce`, `cancellation` и управление async-потоком, поэтому RxJS подходит лучше.

## Когда использовать RxJS

RxJS стоит использовать, когда задача описывается как поток событий или async-операций:

- HTTP-запросы с отменой предыдущего запроса через `switchMap`;
- debounce/throttle пользовательского ввода;
- WebSocket, server-sent events, interval, polling;
- объединение нескольких потоков через `combineLatest`, `merge`, `withLatestFrom`;
- retry, timeout, error handling;
- сложные сценарии, где важны cancellation и backpressure.

Важно: "Signals не заменяют RxJS. Они закрывают другой слой - синхронное состояние и привязку к UI. RxJS остается сильным инструментом для async orchestration".

## Когда использовать Signals

Signals хорошо подходят для локального и синхронного UI state:

- выбранная вкладка, фильтр, раскрытый блок, режим отображения;
- derived state: отфильтрованный список, `isValid`, `canSubmit`, `fullName`;
- состояние компонента или feature-сервиса;
- публичный state сервиса через readonly signals;
- данные, которые уже загружены и дальше используются как текущее значение.

```ts
const users = signal<User[]>([]);
const query = signal('');

const filteredUsers = computed(() => {
  const normalizedQuery = query().trim().toLowerCase();

  if (!normalizedQuery) {
    return users();
  }

  return users().filter((user) => user.name.toLowerCase().includes(normalizedQuery));
});
```

В шаблоне signals читаются напрямую:

```html
@for (user of filteredUsers(); track user.id) {
<p>{{ user.name }}</p>
}
```

Важно: Для `OnPush` компонентов это особенно полезно: когда signal читается в шаблоне, Angular отслеживает эту зависимость и помечает компонент для обновления при изменении signal.

## Как связывать Signals и RxJS

В Angular есть interop API:

- `toSignal()` превращает Observable в signal;
- `toObservable()` превращает signal в Observable;
- `rxResource()` помогает использовать Observable-источник в resource-подходе.

```ts
counter = toSignal(this.counter$, { initialValue: 0 });
```

Важно: `toSignal()` создает подписку. Не стоит вызывать его много раз для одного и того же Observable. Лучше создать signal один раз и переиспользовать.

```ts
query$ = toObservable(this.query);

results$ = this.query$.pipe(switchMap((query) => this.api.search(query)));
```

Такой мост полезен, когда UI state удобно держать в signals, но async-операция лучше выражается через RxJS.

## Можно ли заменить NgRx Signals?

Короткий ответ: иногда можно заменить часть NgRx, но не всегда весь NgRx.

`Signals` могут заменить простой локальный или feature-level state, если:

- состояние небольшое;
- мало сложных async-сценариев;
- не нужна строгая event/action architecture;
- не нужны time-travel, devtools, effects-слой, единый audit trail;
- команда хочет более простой API.

Например, для состояния фильтров, выбранного элемента, списка после загрузки и derived values достаточно сервиса на signals:

```ts
@Injectable()
export class UsersPageState {
  private readonly _users = signal<User[]>([]);
  private readonly _query = signal('');

  readonly users = this._users.asReadonly();
  readonly query = this._query.asReadonly();

  readonly filteredUsers = computed(() => {
    const query = this._query().toLowerCase();
    return this._users().filter((user) => user.name.toLowerCase().includes(query));
  });

  setQuery(query: string): void {
    this._query.set(query);
  }

  setUsers(users: User[]): void {
    this._users.set(users);
  }
}
```

NgRx все еще уместен, если:

- состояние глобальное и разделяется многими фичами;
- важна предсказуемая архитектура через actions/reducers/effects;
- много сложных side effects;
- нужны devtools, traceability, replay/debug;
- в команде уже есть устоявшийся NgRx-подход.

Senior-ответ: "Я бы не заменяла `NgRx` только потому, что появились `signals`. Я бы смотрела на сложность состояния, требования к дебагу, размер команды и стоимость миграции. `Signals` отлично подходят для локального state и derived UI state, а `NgRx` - для сложного application state с явными событиями и эффектами".

### Частые ошибки в ответах

- Говорить, что signals полностью заменяют RxJS.
- Использовать `effect()` для всего подряд.
- Мутировать объект внутри signal без смены ссылки и ожидать понятного поведения.
- Держать весь application state в одном большом signal.
- Создавать `toSignal()` в getter или методе, который вызывается много раз.
- Забывать, что signals синхронные, а async-сценарии требуют отдельного подхода.

### Короткий ответ на собеседовании

`Signals` - это модель синхронного реактивного состояния в Angular. `signal()` хранит writable state, `computed()` вычисляет readonly derived state, `effect()` нужен для side effects. Signals удобны для локального UI state и derived values, а RxJS остается лучше для async-потоков, отмены запросов, debounce и сложной композиции событий. NgRx можно заменить signals-сервисом в простых feature-сценариях, но для большого глобального state с actions, effects и devtools NgRx все еще может быть оправдан.

## Полезные ссылки

- [Angular Signals](https://angular.dev/guide/signals)
- [RxJS interop with Angular signals](https://angular.dev/ecosystem/rxjs-interop)
