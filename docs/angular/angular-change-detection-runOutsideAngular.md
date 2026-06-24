---
title: runOutsideAngular()
section: Angular
subsection: Change Detection
order: 2
description: runOutsideAngular
source: ''
---

## Что делает `runOutsideAngular()`?

**Краткий ответ**

`runOutsideAngular()` запускает код вне Angular zone, чтобы этот код не запускал `Change Detection` после каждого асинхронного события.

---

Например:

```ts
constructor(private ngZone: NgZone) {}

ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
        window.addEventListener('scroll', () => {
            this.calculateScrollPosition();
        });
    });
}
```

Если обработчик `scroll` остаётся внутри Angular zone, `Change Detection` может запускаться десятки раз в секунду.

Это дорого.

Если потом нужно вернуться обратно в Angular:

```ts
this.ngZone.run(() => {
  this.isSticky = true;
});
```

`run()` снова запускает код внутри Angular zone, и Angular сможет обновить шаблон.
