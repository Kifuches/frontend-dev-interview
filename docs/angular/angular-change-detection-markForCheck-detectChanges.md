---
title: markForCheck() и detectChanges()
section: Angular
subsection: Change Detection
order: 2
description: ''
source: ''
---

`markForCheck()` помечает компонент как грязный и говорит Angular проверить его при ближайшем Change Detection.

`detectChanges()` запускает проверку сразу для текущего компонента и его дочерних компонентов.

## markForCheck()

```ts
constructor(private cdr: ChangeDetectorRef) {}

update() {
    this.value = 'new value';
    this.cdr.markForCheck();
}
```

Это мягкий способ сказать Angular:

“Проверь этот компонент в следующем цикле.”

Особенно полезно с `OnPush`.

## detectChanges()

```ts
constructor(private cdr: ChangeDetectorRef) {}

update() {
    this.value = 'new value';
    this.cdr.detectChanges();
}
```

Это немедленная проверка.

Angular сразу проверит текущий компонент и его детей.

---

## Как отвечать на интервью

`markForCheck()` — отложенно помечает компонент для проверки.

`detectChanges()` — синхронно запускает проверку прямо сейчас.

`detectChanges()` нужно использовать аккуратно, потому что им легко создать лишние проверки или получить ошибку, если вызвать его в неподходящий момент lifecycle.
