---
title: Общее
section: Angular
subsection: Dependency Injection
order: 40
description: ''
source: ''
---

## **Dependency Injection**

### Как работает `DI`?

**Dependency Injection** (DI) - это паттерн проектирования, встроенный в Angular для управления зависимостями. Позволяет внедрять зависимости через конструктор вместо создания вручную. Декоратор `@Injectable` делает класс доступным для DI. Преимущества: loose coupling, легкое тестирование, повторное использование кода. Angular автоматически создает и управляет экземплярами сервисов.

DI в Angular работает на основе TypeScript типов через `metadata reflection`.

Это способ передавать объект классу извне, а не создавать его внутри.

```ts
// Плохо:
class UserComponent {
    service = new UserService();
}

// Хорошо:
constructor(
    private service: UserService // Теперь Angular сам создаёт сервис.
){}
```

#### Зачем это нужно?

Компонент не знает, кто именно создал сервис — это повышает тестируемость и снижает связанность.

```ts
// Без DI:
Компонент
↓
сам создаёт сервис
↓
жёсткая зависимость

// С DI:
Компонент
↓
просит сервис
↓
Angular предоставляет его
```

### Что такое `Injector`?

Injector — контейнер, который хранит экземпляры сервисов и умеет их создавать.

```ts
@Injectable({
  providedIn: 'root',
})
export class UserService {}
```

При первом запросе `UserService` Root Injector создаст экземпляр и запомнит его. Все последующие запросы получат тот же объект (singleton).

### Что делают декораторы для поиска зависимостей.

Чтобы понять эти декораторы, сначала нужно разобраться, **как Angular ищет зависимости**.

```ts
AppComponent
│
├── DashboardComponent
│      │
│      └── UserComponent
│              │
│              └── AvatarComponent
```

У каждого компонента может быть **свой Injector**.

Когда Angular видит `constructor(private userService: UserService) {}` он начинает искать `UserService`.

По умолчанию поиск выглядит так:

```ts
Avatar Injector
↓
User Injector
↓
Dashboard Injector
↓
App Injector
↓
Root Injector
```

То есть Angular поднимается вверх по дереву, пока не найдёт сервис.

Все следующие декораторы изменяют именно это поведение:

- `@Self()` - Ищи сервис только в текущем Injector.
- `@SkipSelf()` - Не смотри в текущем Injector. Начинай поиск выше.
- `@Host()` - Не выходи за пределы Host Component.
- `@Optional()` - Если сервис найден — получаем его. Если нет — получаем null вместо ошибки.

### `@Self()` - Ищи сервис только в текущем Injector.

Например

```ts
@Component({
    providers: [UserService]
})
export class UserComponent {}
// и
constructor(
    @Self() private userService: UserService
){}
```

Если сервис находится именно в этом компоненте — всё хорошо.

Если только у родителя — Angular выдаст ошибку `NullInjectorError`.

**Когда использовать:**

Например, компонент **должен** работать **только** со своим локальным сервисом.

Нельзя случайно взять глобальный сервис.

#### `@SkipSelf()` - Не смотри в текущем Injector. Начинай поиск выше.

```ts
// Допустим
App
│
└── UserComponent
      providers:
      UserService

// Если написать
constructor(
   @SkipSelf() private userService: UserService
){}
// Angular проигнорирует локальный сервис UserComponent.
// И найдёт родительский.
```

**Где используется:**

Редко. Например при переопределении сервиса.

Есть глобальный сервис `Root UserService`и локальный `Component UserService`. Иногда внутри локального сервиса нужно обратиться именно к родительскому.

#### `@Host()` - Не выходи за пределы Host Component.

Самый непонятный декоратор.

```ts
App
↓
CardComponent
↓
ButtonDirective
```

ButtonDirective может искать сервис только до CardComponent.

Дальше вверх идти нельзя.

**Где применяется:**

Чаще всего в библиотеках компонентов.

Например,:

- Angular Material

- CDK

- PrimeNG

#### `@Optional()` - Если сервис найден — получаем его. Если нет — получаем null вместо ошибки.

```ts
constructor(
    @Optional() private logger: LoggerService
){}
```

Если LoggerService отсутствует, то `logger === null`

#### Комбинации

Очень любят спросить

`@Optional() + @Self()` получится `Ищи только здесь. Если нет — верни null.`

`@SkipSelf() + @Optional()` получиться `Ищи только у родителей.  Если нет — верни null.`

1. Когда использовать `Factory Provider`?

1. multi providers?

Эти вопросы сейчас встречаются значительно чаще, чем раньше.

---
