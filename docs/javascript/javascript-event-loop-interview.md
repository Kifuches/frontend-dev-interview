---
title: Event Loop
section: JavaScript
order: 2
description: JavaScript, Event Loop.
source: Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md
---

- Microtasks хороши для “сделать сразу после текущего синхронного кода”.
- Macrotasks хороши для “уступить браузеру/следующим событиям”.
- `requestAnimationFrame` хорош для “сделать перед следующим paint”.
- `requestIdleCallback` хорош для “сделать когда браузеру нечем заняться”, но не для критичной логики.

# JavaScript и Event Loop

JavaScript на собеседовании часто начинается с базовой модели выполнения: call stack, event loop, microtasks, macrotasks, [promises](./javascript-promise-general.md), closures, `this`, prototypes и modules. Хороший ответ показывает не только знание терминов, но и умение предсказать порядок выполнения кода.

## Event Loop

[[orange]Event Loop] - это механизм, который позволяет JavaScript выполнять синхронный код и асинхронные callbacks в однопоточной модели.

Структуры данных:

- [[orange]Call Stack] (LIFO — Last In, First Out) — стек вызовов содержит все функции, которые выполняются в текущий момент. Когда вызывается функция, она добавляется в стек. После выполнения удаляется. Если внутри функции вызывается другая функция, она добавляется на вершину стека.
- [[orange]Web API] — асинхронные операции (setTimeout, обработчики событий, сетевые запросы) передаются в Web API. Это среда, предоставляемая браузером (или Node.js). После завершения асинхронной операции callback помещается в соответствующую очередь.
- [[orange]Task Queue / Callback Queue] (FIFO — First In, First Out) — здесь хранятся callback-функции макротасков. Event Loop перемещает задачи из очереди в Call Stack, когда стек пуст.
- [[orange]Microtask Queue] — отдельная очередь для микротасков. Имеет приоритет над Task Queue. Полностью опустошается после каждой синхронной задачи или макрозадачи.

Основные части:

| Часть                | Что делает                                                                           |
| -------------------- | ------------------------------------------------------------------------------------ |
| Call stack           | Выполняет текущий синхронный код                                                     |
| Web APIs / Node APIs | Берут на себя таймеры, сетевые запросы, DOM events                                   |
| Microtask queue      | Очередь для `Promise.then`, `catch`, `finally`, `queueMicrotask`, `MutationObserver` |
| Macrotask queue      | Очередь для `setTimeout`, `setInterval`, DOM events, MessageChannel                  |
| Render step          | Браузер может обновить layout/paint между задачами                                   |

Упрощенный порядок:

1. Выполняется весь синхронный код.
2. Выполняются все microtasks до полного опустошения очереди.
3. Браузер может выполнить render.
4. Выполняется следующая macrotask.
5. После каждой macrotask снова очищается очередь microtasks.

Важно: `Promise.then()` не делает код параллельным. Он ставит callback в microtask queue, которая выполнится после текущего синхронного кода.

## Что выполнится первым

Пример:

```ts
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise');
});

queueMicrotask(() => {
  console.log('microtask');
});

console.log('end');
```

Порядок:

```txt
start
end
promise
microtask
timeout
```

Почему:

- `console.log('start')` и `console.log('end')` выполняются синхронно.
- `setTimeout` попадает в macrotask queue.
- `Promise.then` и `queueMicrotask` попадают в microtask queue.
- Microtasks выполняются раньше следующей macrotask.

Если поменять порядок `Promise.then` и `queueMicrotask`, поменяется и порядок между ними: обе задачи лежат в одной microtask queue и выполняются в порядке добавления.

## Promise

[[orange]Promise] представляет результат асинхронной операции. У promise есть состояния:

- `pending` - ожидание;
- `fulfilled` - успешно выполнен;
- `rejected` - завершился ошибкой.

```ts
const promise = new Promise((resolve) => {
  console.log('executor');
  resolve('done');
});

promise.then((value) => {
  console.log(value);
});

console.log('sync');
```

Порядок:

```txt
executor
sync
done
```

Важно: executor внутри `new Promise()` выполняется синхронно. Асинхронным становится callback в `.then()`.

## `setTimeout`

`setTimeout(callback, 0)` не означает "выполнить прямо сейчас". Это означает "поставить callback в очередь macrotasks после минимальной задержки".

```ts
setTimeout(() => console.log('timeout'), 0);
console.log('sync');
```

Порядок:

```txt
sync
timeout
```

Даже если задержка `0`, сначала завершится текущий call stack и microtasks.

## `queueMicrotask`

`queueMicrotask()` явно добавляет callback в microtask queue.

Важно: Используйте `queueMicrotask`, если хотите выполнить задачу асинхронно, но сразу после текущей операции — быстрее, чем `setTimeout(...)`.

```ts
queueMicrotask(() => {
  console.log('microtask');
});

console.log('sync');
```

Порядок:

```txt
sync
microtask
```

Когда использовать:

- выполнить код после текущего синхронного блока;
- сохранить порядок с promise callbacks;
- не ждать следующей macrotask.

Важно: Если бесконечно добавлять microtasks, можно заблокировать render и macrotasks. Браузер сначала очищает microtask queue, и только потом идет дальше.

Вывод

- `queueMicrotask()` — способ добавить задачу в микротаски, которая выполнится после текущего стека, но до макрозадач.
- Это быстрый и надёжный способ отложить выполнение кода, не дожидаясь следующего рендера или события.
- Используется для точного контроля порядка выполнения в асинхронных операциях.

## `requestAnimationFrame`

`requestAnimationFrame` планирует callback перед следующим repaint браузера.

```ts
requestAnimationFrame(() => {
  console.log('raf');
});

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('sync');
```

Гарантированный порядок:

```txt
sync
promise
```

`requestAnimationFrame` и `setTimeout` зависят от фазы браузерного event loop и текущего кадра, поэтому в реальном браузере порядок между ними может зависеть от ситуации. На интервью безопаснее говорить так: `Promise` как microtask выполнится раньше, а `requestAnimationFrame` нужен для работы перед отрисовкой кадра.

Когда использовать `requestAnimationFrame`:

- анимации;
- измерение/обновление DOM перед paint;
- синхронизация визуальных изменений с частотой кадров.

## Частая задача на порядок вывода

```ts
console.log(1);

setTimeout(() => console.log(2), 0);

Promise.resolve()
  .then(() => {
    console.log(3);
    queueMicrotask(() => console.log(4));
  })
  .then(() => console.log(5));

queueMicrotask(() => console.log(6));

console.log(7);
```

Порядок:

```txt
1
7
3
6
4
5
2
```

Разбор:

- `1` и `7` - синхронный код.
- Первый `.then()` попал в microtask queue раньше `queueMicrotask(() => console.log(6))`.
- Внутри первого `.then()` логируется `3`, затем добавляется microtask `4`.
- Следом выполняется уже стоявшая в очереди microtask `6`.
- Потом выполняются `4` и следующий `.then()` с `5`.
- `setTimeout` выполняется позже как macrotask.

## `this`

`this` в JavaScript определяется тем, как функция вызвана, а не тем, где она объявлена. Исключение - arrow functions: они не имеют собственного `this`, а берут его из внешнего lexical scope.

```ts
const user = {
  name: 'Ada',
  sayName() {
    console.log(this.name);
  },
};

user.sayName(); // Ada
```

Если потерять контекст:

```ts
const say = user.sayName;
say(); // undefined в strict mode
```

Почему: функция вызвана не как метод объекта, значит `this` уже не `user`.

## `bind`, `call`, `apply`

`call`, `apply` и `bind` позволяют явно задать `this`.

```ts
function greet(prefix: string) {
  console.log(`${prefix}, ${this.name}`);
}

const user = { name: 'Ada' };

greet.call(user, 'Hello');
greet.apply(user, ['Hi']);

const boundGreet = greet.bind(user);
boundGreet('Hey');
```

Разница:

| Метод                       | Что делает                                            |
| --------------------------- | ----------------------------------------------------- |
| `call(thisArg, ...args)`    | Вызывает функцию сразу, аргументы передаются списком  |
| `apply(thisArg, argsArray)` | Вызывает функцию сразу, аргументы передаются массивом |
| `bind(thisArg, ...args)`    | Возвращает новую функцию с привязанным `this`         |

Arrow function нельзя перебиндить через `call/apply/bind` по `this`.

```ts
const obj = {
  name: 'Ada',
  arrow: () => console.log(this.name),
};
```

`this` внутри `arrow` будет взят из внешней области, а не из `obj`.

## Inheritance

Современное наследование чаще пишут через `class`, но под капотом все равно работает prototype chain.

```ts
class Animal {
  constructor(public name: string) {}

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks`;
  }
}

const dog = new Dog('Rex');
console.log(dog.speak()); // Rex barks
```

`class` в JavaScript - это синтаксическая оболочка над prototype-based inheritance, а не классическая class-модель как в Java или C#.

## Modules

Модули помогают разделять код на файлы и явно управлять зависимостями.

### ESM

ESM - современная стандартная модульная система JavaScript.

```ts
// math.ts
export function sum(a: number, b: number) {
  return a + b;
}
```

```ts
// app.ts
import { sum } from './math';

console.log(sum(1, 2));
```

Особенности ESM:

- статические `import/export`;
- imports hoisted;
- поддерживает tree-shaking;
- работает в браузере и современных Node.js проектах;
- `import()` позволяет динамическую загрузку.

### CommonJS

CommonJS - историческая модульная система Node.js.

```ts
// math.js
function sum(a, b) {
  return a + b;
}

module.exports = { sum };
```

```ts
// app.js
const { sum } = require('./math');
```

Разница:

| Критерий     | ESM                  | CommonJS                    |
| ------------ | -------------------- | --------------------------- |
| Импорт       | `import`             | `require()`                 |
| Экспорт      | `export`             | `module.exports`            |
| Анализ       | Статический          | Более динамический          |
| Tree-shaking | Лучше поддерживается | Сложнее                     |
| Загрузка     | Async-friendly       | Синхронная модель `require` |

## AbortController

`AbortController` позволяет отменять асинхронные операции, которые поддерживают `AbortSignal`, например `fetch`.

```ts
const controller = new AbortController();

fetch('/api/search?q=angular', {
  signal: controller.signal,
})
  .then((response) => response.json())
  .catch((error) => {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
      return;
    }

    throw error;
  });

controller.abort();
```

Когда использовать:

- отмена запроса при уходе со страницы;
- отмена старого search-запроса при новом вводе;
- timeout;
- cleanup в компонентах.

Важно: `AbortController` не "откатывает" уже выполненную операцию. Он сигнализирует операции, что ее нужно прервать, если она умеет это делать.

## Garbage Collector

Garbage Collector освобождает память, занятую объектами, которые больше недостижимы из корней программы.

Пример:

```ts
let user = { name: 'Ada' };

user = null;
```

Если на объект `{ name: 'Ada' }` больше нет ссылок, он становится кандидатом на удаление.

Главная идея - reachability:

- если объект достижим из global scope, call stack, closures, active timers или DOM references, он жив;
- если объект недостижим, сборщик мусора может освободить память.

Частые причины memory leaks:

- забытые event listeners;
- timers, которые не очищаются;
- подписки, которые живут дольше компонента;
- большие объекты в closures;
- кеши без invalidation;
- ссылки на удаленные DOM nodes.

Пример утечки:

```ts
function attachHandler() {
  const largeData = new Array(1_000_000).fill('data');

  window.addEventListener('resize', () => {
    console.log(largeData.length);
  });
}
```

Пока listener висит на `window`, closure удерживает `largeData`.

Как исправлять:

- удалять listeners;
- очищать timers;
- отписываться от streams;
- ограничивать размер кешей;
- использовать `WeakMap` для метаданных объектов, если это подходит.

## Короткий ответ на собеседовании

JavaScript выполняет синхронный код в call stack. Асинхронные операции делегируются Web API или Node API, а callbacks возвращаются через очереди. После синхронного кода сначала выполняются microtasks (`Promise.then`, `queueMicrotask`), потом браузер может сделать render, затем берется следующая macrotask (`setTimeout`, events). Closures позволяют функциям помнить внешние переменные. `this` зависит от способа вызова функции, кроме arrow functions. Наследование построено на prototype chain. ESM - современный статический формат модулей, CommonJS - старый Node.js формат. `async/await` - синтаксис поверх Promise, а `AbortController` нужен для отмены поддерживаемых async-операций.

## Источники и лицензия

- [Event Loop в JavaScript: Microtasks и Macrotasks](https://www.hackfrontend.com/ru/docs/javascript/event-loop)
