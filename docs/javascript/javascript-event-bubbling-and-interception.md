---
title: Всплытие и перехват событий (Bubbling, Capturing)
section: JavaScript
order: 3
description: Bubbling, Capturing
source:
---

## Распространение события

Распространение события в JavaScript — это процесс, в котором событие проходит через иерархию DOM-элементов, начиная с самого внешнего элемента и заканчивая на том, где событие было вызвано. Это позволяет вам обработать событие на разных уровнях DOM.

## Фазы распространения события

- [[orange]Capturing Phase] ([[orange]фаза захвата]) — событие сначала проходит через все родительские элементы от самого верхнего (root) до целевого элемента.
- [[orange]Target Phase] ([[orange]фаза цели]) — событие достигает самого целевого элемента, на котором оно было инициировано.
- [[orange]Bubbling Phase] ([[orange]фаза всплытия]) — событие начинает "всплывать" обратно от целевого элемента до самых верхних элементов в DOM.
  Пример с использованием фаз распространения события:

```html
<div id="parent">
  <button id="child">Click me!</button>
</div>
```

```ts
document.getElementById('parent').addEventListener(
  'click',
  () => {
    console.log('Parent clicked during capturing phase');
  },
  true,
); // true означает, что слушатель срабатывает на capturing phase

document.getElementById('child').addEventListener('click', () => {
  console.log('Child clicked during target phase');
});

document.getElementById('parent').addEventListener(
  'click',
  () => {
    console.log('Parent clicked during bubbling phase');
  },
  false,
); // false означает, что слушатель срабатывает на bubbling phase
```

Пример работы:

- Capturing Phase: Когда пользователь кликает на кнопку, событие сначала попадает на элемент parent, где срабатывает первый обработчик.
- Target Phase: Событие достигает элемента child (цель события), где срабатывает второй обработчик.
- Bubbling Phase: Событие затем начинает всплывать обратно, и срабатывает третий обработчик на элементе parent.

## Как управлять фазами

- Слушатели событий можно настроить так, чтобы они работали либо в фазе захвата, либо в фазе всплытия, в зависимости от того, в какой фазе вы хотите перехватывать событие.
- Важно помнить, что событие не всегда должно всплывать или захватываться. Например, можно использовать `event.stopPropagation()` для того, чтобы остановить дальнейшее распространение события, будь то в фазе захвата или всплытия.

Важно: [[Не забывайте об `stopPropagation()`:
Использование метода `event.stopPropagation()` предотвратит распространение события в обеих фазах (и захвате, и всплытии).]]

## Источники и лицензия

[Всплытие и перехват событий в JavaScript (Bubbling, Capturing)](https://www.hackfrontend.com/ru/docs/javascript/bubbling-and-capturing)
