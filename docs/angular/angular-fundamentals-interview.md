---
title: Основы Angular
section: Angular
subsection: Base
order: 70
description: Lifecycle hooks, ngOnInit, ngAfterViewInit, ViewChild
source:
---

# Основы Angular

## Как работает bootstrap Angular приложения?

### Краткий ответ

**Bootstrap** — процесс запуска Angular-приложения. Во время него Angular создаёт корневой инжектор, собирает зависимости, создаёт корневой компонент и начинает Change Detection.

---

### Что происходит пошагово

Допустим есть

```ts
bootstrapApplication(AppComponent, {
  providers: [...]
});

// или старый вариант

 platformBrowserDynamic()
    .bootstrapModule(AppModule)
```

Далее происходит:

### 1. Загружается main.ts

Это точка входа.

---

### 2. Создаётся Angular Platform

Например

```ts
platformBrowser();

// или

platformBrowserDynamic();
```

Платформа содержит сервисы, которые существуют в единственном экземпляре:

- DOM Renderer

- Sanitizer

- EventManager

- Zone.js

---

### 3. Создаётся Root Injector

Angular строит дерево зависимостей.

Например

```ts
@Injectable({
    providedIn: 'root'
})
```

создаст сервис именно здесь.

---

### 4. Создаётся AppComponent

Angular вызывает `new AppComponent(...)`, но вручную его никто не создаёт.

Все зависимости автоматически внедряются через DI.

---

### 5. Создаётся DOM

Angular рендерит шаблон `<app-root>`

---

### 6. Запускается Change Detection

Теперь Angular начинает следить за изменениями модели.

---

## Что любят спросить дополнительно

### Почему нельзя создать компонент через new?

Потому что тогда Angular не сможет:

- внедрить зависимости;

- подключить Change Detection;

- вызвать lifecycle hooks;

- зарегистрировать компонент в дереве компонентов.

### Что происходит после запуска приложения?

Это один из любимых Senior-вопросов.

Полный ответ выглядит так:

```ts
main.ts
↓
bootstrap
↓
Platform
↓
Injector
↓
Root Component
↓
DOM Render
↓
Lifecycle Hooks
↓
Change Detection
↓
Event Loop
↓
Обработка пользовательских событий
```

После запуска приложение постоянно находится в цикле:

```ts
Пользователь нажал кнопку
↓
Angular получил событие
↓
Изменилось состояние
↓
Запустился Change Detection
↓
DOM обновился
```

### Как Angular находит компонент?

Например, `<app-user></app-user>` Как Angular понимает, что это `UserComponent`?

Во время сборки компилятор сопоставляет строку `<app-user>` со статическими метаданными импортированных классов и генерирует чистый, быстрый JavaScript-код, который сразу создает нужный компонент.

Во время компиляции Angular строит таблицу

```ts
selector
↓
component
```

Например:

```ts
app-user
↓
UserComponent

app-menu
↓
MenuComponent

app-header
↓
HeaderComponent
```

Когда Angular встречает `<app-user>`, он просто смотрит в эту таблицу.

Это одна из причин, почему селекторы должны быть уникальными.

### Что происходит после изменения значения переменной?

```ts
name = 'John';

change() {
    this.name = 'Mike';
}
```

```ts
button click
↓
Zone.js замечает событие
↓
Angular запускает Change Detection
↓
Проверяет шаблон
↓
Сравнивает старое значение
↓
Видит изменение
↓
Обновляет DOM
```

Важно понимать:

Angular **не перерисовывает весь DOM**.

Он обновляет только изменившиеся привязки.

### Как работает [`Change Detection`](./angular-change-detection-general.md)?

Каждый компонент имеет представление

```ts
Component
↓
View
↓
Bindings
```

Когда происходит событие

```ts
click
↓
Angular проходит по дереву компонентов
↓
Проверяет все bindings
↓
Если значение изменилось
↓
Обновляет DOM
```

Например, `{{user.name}}`

Angular хранит

```ts
старое значение
John

новое значение
Mike
```

Если разные — обновляет текст.

### Когда стоит отказаться от `NgModule`?

Сегодня практически во всех новых проектах используют Standalone API.

NgModule всё ещё может встречаться:

- в старых проектах;

- в некоторых библиотеках;

- при миграции.

Но если создаётся новый проект на Angular 18–20, обычно выбирают standalone-компоненты.
