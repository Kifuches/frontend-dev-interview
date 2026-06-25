---
title: NgZone
section: Angular
subsection: Change Detection
order: 5
description: NgZone, Zone.js
source: ''
---

## Zone.js

Zone.js — библиотека, которая перехватывает асинхронные операции JavaScript.

Например:

| Источник изменения    | Пример                       |
| --------------------- | ---------------------------- |
| События DOM           | click, input, change, и т.д. |
| Таймеры               | setTimeout, setInterval      |
| HTTP-запросы          | HttpClient, WebSocket        |
| Promise и async/await | fetch().then(...), await     |
| Внутренние изменения  | this.value = ...             |

После завершения любой такой операции Zone.js сообщает Angular: “Возможно, данные изменились.” После чего Angular запускает `Change Detection`.

Важно: Zone.js не знает, что именно изменилось. Он просто говорит Angular, что что-то могло измениться. Поэтому Angular должен проверить компоненты.

Если бы Zone.js не было:

`this.users = data;`

Angular бы вообще не узнал об изменении. Пришлось бы вручную писать `detectChanges();`

## NgZone

NgZone — это сервис в Angular, который используется для управления зонами выполнения (execution context) и запуска change detection (обнаружения изменений). Он основан на библиотеке zone.js и позволяет Angular отслеживать все асинхронные операции, такие как setTimeout, Promise, XHR и т.д.

## Зачем нужен NgZone?

Angular использует NgZone, чтобы:

- автоматически запускать детектирование изменений после завершения асинхронных операций;
- отслеживать внешние события (например, click, HTTP, setTimeout);
- позволить оптимизировать производительность, управляя вручную запуском change detection.

### Как работает NgZone

Когда происходит асинхронное событие (например, setTimeout, fetch, input), Angular автоматически:

1. Заходит в NgZone;
2. Выполняет асинхронную задачу;
3. После завершения — вызывает Change Detection для обновления UI.

Пример:

```ts
import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-zone-demo',
  template: `<p>{{ progress }}%</p>`,
})
export class ZoneDemoComponent {
  progress = 0;

  constructor(private ngZone: NgZone) {}

  startProgress() {
    this.progress = 0;
    this.increaseProgress();
  }

  // Без выхода из зоны — будет вызывать change detection каждый шаг
  increaseProgress() {
    if (this.progress < 100) {
      setTimeout(() => {
        this.progress += 1;
        this.increaseProgress();
      }, 10);
    }
  }
}
```

### А если выйти из зоны?

Иногда вам не нужно вызывать change detection слишком часто. В этом случае можно использовать runOutsideAngular():

```ts
this.ngZone.runOutsideAngular(() => {
  this.progress = 0;
  const timer = setInterval(() => {
    this.progress += 1;

    if (this.progress >= 100) {
      clearInterval(timer);

      // Вернуться обратно в Angular-зону, чтобы обновить UI
      this.ngZone.run(() => {
        console.log('Завершено!');
      });
    }
  }, 10);
});
```

## Вывод

| Что делает NgZone?                            | Преимущества                        |
| --------------------------------------------- | ----------------------------------- |
| Отслеживает асинхронные операции              | Автоматическое обновление UI        |
| Запускает Change Detection                    | Удобно при взаимодействии с DOM     |
| Позволяет выйти из зоны (runOutsideAngular) П | овышение производительности         |
| Позволяет вручную вернуться в Angular-зону    | Контроль над обновлением интерфейса |
