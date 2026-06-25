---
title: InjectionToken
section: Angular
subsection: Dependency Injection
order: 40
---

`InjectionToken` - класс для создания DI токенов для примитивных значений или interfaces. Решает проблему отсутствия runtime информации о interfaces.

Синтаксис: `const TOKEN = new InjectionToken<Type>("description")`.

Используется для конфигурации, feature flags, базовых URL. Можно указать `factory` и `providedIn` для tree-shakeable providers. Type-safe в отличие от string tokens.

`InjectionToken` предпочтительнее `string literals - type-safe` и избегает коллизий.

```ts
type Status = 'success' | 'pending' | 'error';

let currentStatus: Status = 'success';
// currentStatus = "failed"; // ❌ Compile Error

// Template literals automatically build combinations
type Alignment = 'left' | 'right';
type ClassName = `text-${Alignment}`; // Resolves to: "text-left" | "text-right"
```

---

`InjectionToken` — это объект, который система внедрения зависимостей Angular использует для уникальной идентификации значений при внедрении. Представьте его как специальный ключ, позволяющий хранить и извлекать любые типы значений в системе внедрения зависимостей Angular:

```ts
import { InjectionToken } from '@angular/core';

// Create a token for a string value
export const API_URL = new InjectionToken<string>('api.url');

// Create a token for a function
export const LOGGER = new InjectionToken<(msg: string) => void>('logger.function');

// Create a token for a complex type
export interface Config {
  apiUrl: string;
  timeout: number;
}

export const CONFIG_TOKEN = new InjectionToken<Config>('app.config');
```

ПРИМЕЧАНИЕ: Параметр строки (например, `'api.url'`) является описанием исключительно для отладки — Angular идентифицирует токены по их объектной ссылке, а не по этой строке.

### InjectionToken с `providedIn: 'root'`

`InjectionToken`, имеющий фабрику, по умолчанию приводит к значению `providedIn: 'root'` (но это значение можно переопределить с помощью свойства `providedIn`).

```ts
// 📁 /app/config.token.ts
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  version: string;
  features: Record<string, boolean>;
}

// Globally available configuration using providedIn
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: 'https://api.example.com',
    version: '1.0.0',
    features: {
      darkMode: true,
      analytics: false,
    },
  }),
});

// No need to add to providers array - available everywhere!
@Component({
  selector: 'app-header',
  template: `<h1>Version: {{ config.version }}</h1>`,
})
export class Header {
  config = inject(APP_CONFIG); // Automatically available
}
```

## Понимание ручной настройки серсвиса

Когда вам требуется больше контроля, чем предоставляет `'root'`, вы можете настроить сервисы вручную. Ручная настройка через массив сервисов полезна, когда:

- **У сервиса нет `providedIn`** - Services without automatic provision must be manually provided
- **Вы хотите новый экземпляр** - Чтобы создать отдельный экземпляр на уровне компонента/директивы вместо использования общего экземпляра
- **Вам нужна конфигурация времени выполнения** - Когда поведение службы зависит от значений времени выполнения
- **Вы предоставляете значения, не относящиеся к классу** - объекты конфигурации, функции или примитивные значения

Пример: Сервис безprovidedIn:

```ts
import { Injectable, Component, inject } from '@angular/core';

// Service without providedIn
@Injectable()
export class LocalDataStore {
  private data: string[] = [];
  addData(item: string) {
    this.data.push(item);
  }
}

// Component must provide it
@Component({
  selector: 'app-example',
  // A provider is required here because the `LocalDataStore` service has no providedIn.
  providers: [LocalDataStore],
  template: `...`,
})
export class Example {
  dataStore = inject(LocalDataStore);
}
```

## Объявление сервиса

Думайте о системе внедрения зависимостей Angular как о хэш-карте или словаре. Каждый объект конфигурации провайдера определяет пару ключ-значение:

Ключ (идентификатор сервиса): уникальный идентификатор, который вы используете для запроса зависимости
Значение: Что Angular должен вернуть при запросе этого токена
При ручном предоставлении зависимостей вы обычно видите этот сокращенный синтаксис:

```ts
import { Component } from '@angular/core';
import { LocalService } from './local-service';

@Component({
  selector: 'app-example',
  providers: [LocalService], // Service without providedIn
})
export class Example {}
```

На самом деле это сокращение для более подробной конфигурации провайдера:

```ts
{
  // This is the shorthand version
  providers: [LocalService],

  // This is the full version
  providers: [
    { provide: LocalService, useClass: LocalService }
  ]
}
```

## Объект конфигурации провайдера

Каждый объект конфигурации сервиса состоит из двух основных частей:

Идентификатор провайдера: уникальный ключ, который Angular использует для получения зависимости (установлен с помощью свойства `provide`)
Значение: Фактическая зависимость, которую вы хотите получить Angular, настроенная с помощью различных ключей в зависимости от желаемого типа:

- `useClass`- Предоставляет класс JavaScript
- `useValue`- Обеспечивает статическое значение
- `useFactory`- Обеспечивает заводскую функцию, которая возвращает значение
- `useExisting`- Предоставляет псевдоним существующему сервису

---
