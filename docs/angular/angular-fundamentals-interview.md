---
title: "Основы Angular"
section: "Angular"
subsection: "Fundamentals"
order: 30
description: "Материал из большого списка вопросов для собеседования: Основы Angular."
source: "Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md"
---
## **Основы Angular**

1. Как работает bootstrap Angular приложения?

   #### **Краткий ответ**

   **Bootstrap** — процесс запуска Angular-приложения. Во время него Angular создаёт корневой инжектор, собирает зависимости, создаёт корневой компонент и начинает Change Detection.

   ***

   #### **Что происходит пошагово**

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

   #### **1. Загружается main.ts**

   Это точка входа.

   ***

   #### **2. Создаётся Angular Platform**

   Например

   ```ts
   platformBrowser()

   // или

   platformBrowserDynamic()
   ```

   Платформа содержит сервисы, которые существуют в единственном экземпляре:
   - DOM Renderer

   - Sanitizer

   - EventManager

   - Zone.js

   ***

   #### **3. Создаётся Root Injector**

   Angular строит дерево зависимостей.

   Например

   ```ts
   @Injectable({
       providedIn: 'root'
   })
   ```

   создаст сервис именно здесь.

   ***

   ### **4. Создаётся AppComponent**

   Angular вызывает `new AppComponent(...)`, но вручную его никто не создаёт.

   Все зависимости автоматически внедряются через DI.

   ***

   ### **5. Создаётся DOM**

   Angular рендерит шаблон `<app-root>`

   ***

   #### **6. Запускается Change Detection**

   Теперь Angular начинает следить за изменениями модели.

   ***

   #### **Что любят спросить дополнительно**

   **Почему нельзя создать компонент через new?**

   Потому что тогда Angular не сможет:
   - внедрить зависимости;

   - подключить Change Detection;

   - вызвать lifecycle hooks;

   - зарегистрировать компонент в дереве компонентов.

1. Что происходит после запуска приложения?

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

1. Как Angular находит компонент?

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

1. Что происходит после изменения значения переменной?

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

1. Что такое `Zone.js`?

   Очень частый вопрос.

   Zone.js — библиотека, которая перехватывает асинхронные операции JavaScript.

   Например:

   ```ts
   click
   Promise
   setTimeout
   XHR
   fetch
   WebSocket
   setInterval
   ```

   После завершения любой такой операции Zone.js сообщает Angular:

   “Возможно, данные изменились.”

   После чего Angular запускает `Change Detection`.

   ***

   Если бы Zone.js не было:

   `this.users = data;`

   Angular бы вообще не узнал об изменении.

   Пришлось бы вручную писать `detectChanges();`

1. Как работает `Change Detection`?

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

1. Что изменилось после появления `Signals`?

   `Signals` (Angular 16+) - новый реактивный примитив для управления состоянием.

   `signal()` создает реактивное значение.

   `effect()` реагирует на изменения.

   `computed()` вычисляет производное значение.

   `Fine-grained reactivity` - обновляет только то что изменилось.

   Альтернатива `Zone.js change detection`. Улучшает производительность, делает CD более предсказуемым. Будущее Angular reactivity.

   `Signals` работают синхронно в отличие от `Observable` которые асинхронны.

   ```ts
   // Раньше
   Zone.js
   ↓
   Полная проверка дерева

   // Теперь
   Signal
   ↓
   Angular знает КТО изменился
   ↓
   Обновляет только нужные компоненты
   ```

   Это намного эффективнее.

1. В каких случаях Angular не выполнит `Change Detection`?

   Например , или `runOutsideAngular(() => {...});`, если приложение работает без Zone.js.

   Также при стратегии `OnPush` проверка не запускается автоматически для любого изменения. Компонент будет проверен только если:
   - изменился `@Input` (по ссылке);

   - произошло событие внутри компонента;

   - Observable через `AsyncPipe` выдал новое значение;

   - изменился `Signal`;

   - вручную вызвали `markForCheck()` или `detectChanges()`.

1. Что такое `standalone components`?

   Standalone Components (Angular 14+) - компоненты без NgModule. Используют `standalone: true` в декораторе.

   Импортируют зависимости напрямую через `imports`. Упрощают архитектуру, уменьшают `boilerplate`, улучшают `tree-shaking`.

   Могут использоваться с или без модулей. Будущее Angular - standalone по умолчанию. Поддерживают все features (routing, lazy loading, DI).

   Standalone components могут импортировать как standalone так и module-based зависимости.

   ***

   Теперь можно указать `@Component({ standalone: true })`. Такой компонент самостоятельно импортирует всё необходимое.

   Например:

   ```ts
   imports: [
       CommonModule,
       RouterModule
   ]
   ```

   Преимущества:

   ✔ меньше кода

   ✔ проще lazy loading

   ✔ проще tree shaking

   ✔ проще тестирование

   ✔ лучше архитектура

1. Когда стоит отказаться от `NgModule`?

   Сегодня практически во всех новых проектах используют Standalone API.

   NgModule всё ещё может встречаться:
   - в старых проектах;

   - в некоторых библиотеках;

   - при миграции.

   Но если создаётся новый проект на Angular 18–20, обычно выбирают standalone-компоненты.

---
