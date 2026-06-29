---
title: Цепочки промисов (Promise Chaining)
section: JavaScript
subsection: Promise
order: 2
description: Promise
source:
---

## Цепочки промисов (Promise Chaining)

Проваливание промисов (или Promise Chaining) — это механизм, при котором каждый `.then()` возвращает новый промис, позволяя выстраивать цепочку асинхронных операций.

По сути, это означает, что результат одного `.then()` передаётся в следующий `.then()`, пока не будет достигнут финальный результат.

Пример:

```ts
fetch('/user.json')
  .then((response) => response.json()) // промис №1
  .then((user) => fetch(`/users/${user.id}`)) // промис №2
  .then((response) => response.json()) // промис №3
  .then((userData) => console.log(userData)) // промис №4
  .catch((error) => console.error(error)); // обработка ошибок
```

Здесь каждый `.then()` возвращает новый промис, и следующий `.then()` ждёт его выполнения — именно это и называется проваливанием промисов.

Важно помнить:

- Каждый `.then()` всегда возвращает промис, даже если явно не указан return.
- Если внутри `.then()` вернуть значение (не промис), оно автоматически будет обёрнуто в промис.
- Если внутри `.then() `выброшено исключение — оно будет передано в ближайший .catch().

### Неправильный пример (без проваливания)

```ts
fetch('/user.json').then((response) => {
  response.json().then((user) => {
    fetch(`/users/${user.id}`).then((response) => {
      response.json().then((userData) => {
        console.log(userData);
      });
    });
  });
});
```

Такое "вложенное" использование промисов называется "callback hell" и усложняет чтение и поддержку.

То же с проваливанием (чейнингом)

```ts
fetch('/user.json')
  .then((res) => res.json())
  .then((user) => fetch(`/users/${user.id}`))
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

## Вывод

- Проваливание промисов — это важная концепция для работы с асинхронным кодом.
- Используйте `.then()` правильно: возвращайте промисы для создания цепочек.
- Это позволяет писать чистый, линейный и удобный код, без вложенности и путаницы.
