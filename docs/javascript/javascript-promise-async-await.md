---
title: async/await
section: JavaScript
subsection: Promise
order: 3
description: Promise
source:
---

## async и await

`async` и `await` — это синтаксический сахар над промисами, появившийся в ES2017, который позволяет писать асинхронный код, как если бы он был синхронным.

- `async` — делает функцию асинхронной, автоматически возвращающей Promise.
- `await` — приостанавливает выполнение внутри async-функции, пока промис не завершится (успешно или с ошибкой).

Важно: `await` не блокирует основной поток! Он лишь приостанавливает выполнение текущей `async`-функции, освобождая поток для других задач.

Пример:

```ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function greet() {
  console.log('Жду...');
  await delay(1000); // Ожидаем 1 секунду
  console.log('Привет после 1 секунды!');
}

greet();
```

### `async`: как работает?

```ts
async function foo() {
  return 42;
}

foo().then((result) => console.log(result)); // 42
```

Даже если функция возвращает простое значение, `async` оборачивает его в Promise.

### `await`: как работает?

```ts
async function fetchUser() {
  const res = await fetch('/user.json');
  const data = await res.json();
  return data;
}
```

`await` ставит выполнение на паузу, пока `fetch` не вернёт результат.
После завершения, результат передаётся в переменную и выполнение продолжается.

## Обработка ошибок

С `async/await` удобно использовать `try/catch`:

```ts
async function getData() {
  try {
    const response = await fetch('/api');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}
```

### Особенности

- `await` можно использовать только внутри `async`-функции.
- `await` работает только с промисами (или с любыми thenable-объектами).
- Если `await` возвращает ошибку, она выбрасывается и попадает в `catch`.

## Вывод

- `async/await` делает асинхронный код понятным, линейным и чистым.
- Он не заменяет промисы, а упрощает их использование.
- Обязательно обрабатывайте ошибки через `try/catch` или `.catch()`.
