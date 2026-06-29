---
title: Promise
section: JavaScript
subsection: Promise
order: 1
description: Promise
source:
---

## Promise

Promise — это функция-конструктор, которая используется для создания промисов в JavaScript. Промис представляет собой объект, который позволяет работать с асинхронными операциями и выполнять их без блокировки основного потока выполнения.

Промис может находиться в одном из следующих состояний:

- Pending (Ожидание) — начальное состояние, когда асинхронная операция еще не завершена.
- Fulfilled (Исполнено) — когда асинхронная операция завершена успешно.
- Rejected (Отклонено) — когда асинхронная операция завершена с ошибкой.

Пример создания промиса:

```ts
let promise = new Promise((resolve, reject) => {
  let success = true;

  if (success) {
    resolve('Операция выполнена успешно!'); // Успешное выполнение
  } else {
    reject('Произошла ошибка!'); // Ошибка
  }
});
```

## Методы промиса

### `Promise.all`

`Promise.all()` используется для выполнения нескольких промисов параллельно и возвращает новый промис, который выполнится, когда **все** промисы из массива завершатся успешно. Если хотя бы один промис отклонится, результат будет отклонен с ошибкой того промиса, который отклонился.

Пример `Promise.all`:

```ts
let promise1 = new Promise((resolve) => setTimeout(resolve, 1000, 'Первый'));
let promise2 = new Promise((resolve) => setTimeout(resolve, 2000, 'Второй'));

Promise.all([promise1, promise2])
  .then((results) => {
    console.log(results); // ["Первый", "Второй"]
  })
  .catch((error) => {
    console.log(error); // Если один из промисов отклонится, будет выведена ошибка
  });
```

### `Promise.allSettled`

`Promise.allSettled()` выполняет все промисы в массиве и возвращает результат **для каждого**, независимо от того, были ли они выполнены или отклонены.

Пример `Promise.allSettled`:

```ts
let promise1 = Promise.resolve('Первый');
let promise2 = Promise.reject('Ошибка во втором');

Promise.allSettled([promise1, promise2]).then((results) => {
  console.log(results);
  // [{ status: "fulfilled", value: "Первый" }, { status: "rejected", reason: "Ошибка во втором" }]
});
```

### `Promise.race`

`Promise.race()` принимает массив промисов и возвращает новый промис, который завершится как только завершится первый из промисов в массиве (независимо от того, был ли он выполнен успешно или с ошибкой).

Пример `Promise.race`:

```ts
let promise1 = new Promise((resolve) => setTimeout(resolve, 1000, 'Первый'));
let promise2 = new Promise((resolve) => setTimeout(resolve, 2000, 'Второй'));

Promise.race([promise1, promise2]).then((value) => {
  console.log(value); // "Первый", так как он завершился первым
});
```

### `Promise.any`

Promise.any() возвращает новый промис, который выполнится, как только первый промис из массива завершится успешно. Если все промисы отклоняются, он отклонится с ошибкой.

Пример `Promise.any`:

```ts
let promise1 = new Promise((resolve, reject) => setTimeout(reject, 1000, 'Ошибка 1'));
let promise2 = new Promise((resolve) => setTimeout(resolve, 2000, 'Успех'));

Promise.any([promise1, promise2])
  .then((value) => {
    console.log(value); // "Успех", потому что второй промис завершился первым успешно
  })
  .catch((error) => {
    console.log(error); // Если все промисы отклонятся, будет выведена ошибка
  });
```
