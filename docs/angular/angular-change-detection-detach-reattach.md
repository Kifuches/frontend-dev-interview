---
title: detach() и reattach()
section: Angular
subsection: Change Detection
order: 2
description: detach, reattach
source: ''
---

`detach()` отключает компонент от дерева `Change Detection`.

`reattach()` подключает его обратно.

Например:

```ts
constructor(private cdr: ChangeDetectorRef) {}

ngOnInit() {
    this.cdr.detach();
}
```

После этого Angular больше не будет автоматически проверять этот компонент.

```ts
// Если нужно обновить его вручную:
refresh() {
    this.cdr.detectChanges();
}

// Если нужно вернуть обычное поведение:
enableChecks() {
    this.cdr.reattach();
}
```

### Когда это нужно

Например, есть тяжелый readonly-компонент, который не должен обновляться на каждое событие приложения.

Можно отключить его от общей проверки и обновлять вручную раз в несколько секунд или только по конкретному событию.
