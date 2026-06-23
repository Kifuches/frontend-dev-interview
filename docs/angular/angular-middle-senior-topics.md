# Angular Middle/Senior Frontend Developer — темы для подготовки к собеседованию

## 1) Angular Fundamentals (обязательно)
- Архитектура Angular: компоненты, директives, pipes, services, modules, standalone components
- Жизненный цикл компонентов: `ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, `ngOnDestroy`
- Шаблоны: property/event/two-way binding, template reference variables, structural directives
- Dependency Injection: providers, injection token, иерархия инжекторов, `providedIn`
- Change Detection: Default vs OnPush, как работает Zone.js, когда и как триггерится CD
- Signals (современный Angular): `signal`, `computed`, `effect`, interop c RxJS
- Forms: Template-driven vs Reactive Forms, кастомные валидаторы, async validators, dynamic forms

## 2) Routing и навигация
- Настройка роутинга в standalone/NgModule приложениях
- Lazy loading, preload strategies
- Route guards: `CanActivate`, `CanDeactivate`, `CanMatch`
- Route resolvers и prefetch данных
- Работа с query params, fragments, child routes
- Router events и обработка сложной навигации

## 3) RxJS и реактивное мышление
- Cold/Hot observables, Subject/BehaviorSubject/ReplaySubject
- Ключевые операторы: `map`, `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`
- Комбинации потоков: `combineLatest`, `forkJoin`, `withLatestFrom`, `zip`
- Управление подписками: `takeUntil`, `takeUntilDestroyed`, `async` pipe
- Error handling: `catchError`, `retry`, `retryWhen`, graceful degradation
- Кэширование и share стратегии: `shareReplay`, invalidation cache
- Отмена запросов и race conditions

## 4) State Management
- Локальный state на уровне компонента (signals/RxJS)
- Когда нужен глобальный state
- NgRx (Store, Actions, Reducers, Effects, Selectors)
- NgRx Entity, ComponentStore, SignalStore (если используется)
- Альтернативы: Akita, NGXS, RxState, сервисный state
- Нормализация данных, optimistic updates, rollback

## 5) HTTP, API integration, data layer
- `HttpClient`: interceptors, typed responses, error mapping
- Auth flows: JWT, refresh token, silent refresh
- Обработка 401/403, retry policy, idempotency
- API versioning, контрактная совместимость
- Работа с пагинацией, фильтрацией, сортировкой
- Реализация BFF-подхода (понимание на уровне архитектуры)

## 6) Производительность
- Профилирование: Angular DevTools, browser performance tools
- OnPush и иммутабельность
- `trackBy`, виртуализация списков, defer/lazy rendering
- Code splitting, bundle analysis, tree-shaking
- Оптимизация первого рендера: SSR/SSG/Hydration (базовое понимание)
- Оптимизация изображений, шрифтов, критического CSS
- Web Vitals: LCP, CLS, INP

## 7) Architecture & Design (уровень Senior)
- Feature-based / domain-driven структура фронтенда
- Monorepo (Nx) и модульная архитектура
- SOLID/KISS/DRY в frontend-коде
- Паттерны: Facade, Strategy, Adapter, Smart/Dumb components
- Anti-patterns в Angular приложениях
- Миграция legacy кода и план технического долга
- Микрофронтенды: module federation (концептуально + практические риски)

## 8) Testing
- Unit тесты: TestBed, mocking services, testing pipes/directives
- Component tests: взаимодействие с DOM, input/output, async flows
- RxJS тестирование (marble tests — желательно)
- Integration/E2E: Cypress/Playwright (основные сценарии)
- Контрактные тесты API и smoke tests
- Test pyramid и что реально тестировать в enterprise проекте

## 9) Security
- XSS, CSRF, Clickjacking, CORS
- Санитизация в Angular, `DomSanitizer` и риски bypass
- Безопасное хранение токенов
- CSP, SRI, security headers
- OWASP Top 10 (базовое понимание и примеры для frontend)

## 10) CI/CD, DevEx, процессы
- Сборка и деплой Angular приложений
- Environment configs, feature flags
- Git workflow (trunk-based / gitflow), code review практики
- Линтинг/форматирование: ESLint, Prettier
- Quality gates: тесты, coverage, bundle budget
- Release strategy: canary, blue-green (понимание)
- Мониторинг ошибок: Sentry/NewRelic/Datadog

## 11) JavaScript/TypeScript (глубоко)
- Event loop, microtasks/macrotasks
- Prototype chain, `this`, closures
- Async patterns: Promise, async/await, cancellation
- TypeScript advanced: generics, utility types, discriminated unions, type guards
- Strict mode, `unknown` vs `any`, type-safe API clients
- Модульная система, import/export, сборщики (Vite/Webpack esbuild — обзор)

## 12) Browser & Platform Knowledge
- Rendering pipeline: reflow/repaint/compositing
- Storage: localStorage/sessionStorage/indexedDB/cookies
- Service workers, PWA основы
- Accessibility (a11y): semantic HTML, ARIA, keyboard navigation
- i18n/l10n в Angular

## 13) Soft Skills и Senior ожидания
- Как принимать архитектурные решения и объяснять trade-offs
- Менторство, декомпозиция задач, оценка рисков
- Работа с неопределенностью и конфликтующими требованиями
- Коммуникация с backend/product/QA
- Ownership и ответственность за результат команды

---

## Как расставить приоритеты (если времени мало)
1. Angular core + Change Detection + DI + Forms
2. RxJS (операторы и паттерны)
3. Routing + HTTP + Interceptors + Auth
4. Performance + Architecture
5. Testing + Security
6. State management (NgRx/альтернативы)

## Что обычно спрашивают на Middle
- Уверенное понимание компонентной модели Angular
- Reactive Forms, RxJS на практике
- Работа с API, error handling
- Базовая оптимизация производительности
- Unit тесты для ключевой логики

## Что обычно ожидают от Senior
- Проектирование архитектуры фич/приложения
- Выбор подхода к state management и обоснование
- Performance strategy для крупных приложений
- Техническое лидерство, ревью, наставничество
- Системное мышление: качество, релизы, риски, supportability

## Формат подготовки (рекомендация)
- На каждую тему: 1) теория, 2) практический мини-пример, 3) типовые interview-вопросы
- Тренировать устные ответы по схеме: контекст → решение → компромиссы → результат
- Повторять темы циклами: core → rxjs → architecture → mock interview
