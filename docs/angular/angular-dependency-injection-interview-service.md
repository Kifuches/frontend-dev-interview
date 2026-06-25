---
title: Создание и использование сервисов
section: Angular
subsection: Dependency Injection
order: 40
---

## **Создание и использование сервисов**

**Сервисы** - это многоразовые фрагменты кода, которыми вы можете поделиться в своем приложении Angular. Вы обычно используете их для обработки извлечения данных, бизнес-логики или других функций, к которым необходимо получить доступ нескольким компонентам.

## Как сервисы становятся доступными?

Когда мы используем `@Injectable({ providedIn: 'root' })` в сервисе, Angular:

- **Создает один экземпляр** (синглтон) для всего приложения
- **Делает его доступным для всего приложения** без дополнительной конфигурации
- **Включает встяхивание деревьев**, поэтому Angular включает сервис в ваш пакет JavaScript только в том случае, если вы действительно его используете.

```ts
import { Service } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BasicDataStore {
  private data: string[] = [];
  addData(item: string): void {
    this.data.push(item);
  }
  getData(): string[] {
    return [...this.data];
  }
}
```

### Разница между `providers`:

`providedIn` - свойство `@Injectable` декоратора, определяющее где сервис регистрируется. Значения:

- **root** - `providedIn: 'root'` Один экземпляр на всё приложение.
- **platform** - Один экземпляр на всю Angular-платформу. Полезно, если на одной странице работает несколько Angular-приложений и сервис должен быть общим.
- **any** - Создаёт отдельный экземпляр для каждого лениво загруженного инжектора (`lazy-loaded` модуля/маршрута), а для eagerly-loaded частей приложения используется общий экземпляр.
- **component providers** - `@Component({ providers:[UserService] })` Каждый экземпляр компонента получит **свой собственный** экземпляр `UserService`. Очень удобно для локального состояния.

`providedIn: "root"` предпочтительнее `providers` в `@NgModule` для tree-shaking и упрощения.
Tree-shaking с `providedIn: "root"` - сервис удаляется из bundle если не используется.

## Использование декоратора `@Service`

Обычно, когда сервис является единственным в своем роде и доступен во всем приложении, Angular предлагает декоратор `@Service` в качестве более удобной альтернативы `@Injectable({providedIn: 'root'})`.

Этот подход работает так же, как и версия с `@Injectable({providedIn: 'root'})`, описанная выше: Angular создает единственный экземпляр, делает его доступным везде и удаляет его из бандла, если он никогда не был внедрен.

```ts
import { Service } from '@angular/core';

@Service()
export class BasicDataStore {
  private data: string[] = [];
  addData(item: string): void {
    this.data.push(item);
  }
  getData(): string[] {
    return [...this.data];
  }
}
```

По умолчанию аннотация `@Service` предоставляет класс в корневом инжекторе. Если вы хотите предоставить его вручную, например, чтобы ограничить его использование определенным маршрутом или компонентом, установите `autoProvided: false:`.

```ts
import { Service } from '@angular/core';

@Service({ autoProvided: false })
export class AnalyticsLogger {
  trackEvent(name: string) {
    console.log('event:', name);
  }
}
```

Затем вы несете ответственность за добавление сервиса в массив providers, как и с `@Injectable()`.

## When to use `@Service` vs `@Injectable`

`inject()` - функция для injection dependencies вне конструктора (Angular 14+). Можно использовать в: поле инициализации, функциональных `guards`, `factory functions`, `top-level функциях`. Работает только в injection context. Заменяет constructor injection для функционального стиля. Улучшает composability и testability. Основа для functional APIs (guards, interceptors).
`inject()` делает functional guards и interceptors type-safe и композабельными.

Reach for `@Service` when you are creating a new singleton class that uses `inject()` for its dependencies. Keep using `@Injectable` when you need any of the following:

- Constructor-based dependency injection. `@Service` only supports the `inject()` function.
- Advanced provider configuration such as useClass, useValue, useExisting, or useFactory. `@Service` exposes a single factory option instead.
- Non-root scopes such as `providedIn: 'platform'`.

`Functional Guards` (Angular 15+) - guards как функции вместо классов. Синтаксис: `canActivateFn`, `canDeactivateFn` и др. Используют `inject()` для dependencies. Преимущества: меньше boilerplate, композабельность, легче тестирование, type-safe. Заменяют class-based guards. Можно комбинировать через логические операторы. Будущее Angular routing guards.
`Functional guards` можно легко композировать: `const guard = () => authGuard() && roleGuard()`.

---
