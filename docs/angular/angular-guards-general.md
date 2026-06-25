---
title: Основное
section: Angular
subsection: Guards
order: 80
description: ''
source: ''
---

`Guards` - это функции, которые контролируют, может ли пользователь перемещаться по определенному маршруту или покинуть его. Они похожи на контрольные точки, которые управляют тем, может ли пользователь получить доступ к определенным маршрутам. Распространенные примеры использования защиты маршрутов включают аутентификацию и контроль доступа.

Angular предоставляет четыре типа защитных механизмов для маршрутов, каждый из которых выполняет разные функции:

- `CanActivate` - определяет, может ли пользователь получить доступ к маршруту. Чаще всего она используется для аутентификации и авторизации.
- `CanActivateChild`
- `CanDeactivate`
- `CanMatch`

Типы возвращаемых значений guard:

| тип                         | Описание                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------ |
| boolean                     | `true` позволяет навигацию, `false` блокирует её (see note for CanMatch route guard) |
| UrlTree or RedirectCommand  | Перенаправляет на другой маршрут вместо блокировки                                   |
| Promise<T> or Observable<T> | Маршрутизатор использует первое полученное значение, а затем отписывается            |

`CanActivate`, `CanActivateChild`, `CanDeactivate` могут возвращать стандартные типы возвращаемых значений.

`CanMatch` может возвращать стандартные типы параметров возврата, но если он возвращает `false`, Angular пытается использовать другие подходящие маршруты вместо того, чтобы полностью блокировать навигацию.

### CanActivate

Определяет, может ли пользователь получить доступ к маршруту. Чаще всего она используется для аутентификации и авторизации.

Он имеет доступ к следующим аргументам по умолчанию:

- `route: ActivatedRouteSnapshot` — содержит информацию об активируемом маршруте
- `state: RouterStateSnapshot` — содержит текущее состояние маршрутизатора

```ts
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

Совет: Если вам нужно перенаправить пользователя, верните `URLTree` или `RedirectCommand`. Не возвращайте `false`, а затем программно не перенаправляйте пользователя.

### CanActivateChild

Функция `canActivateChild` определяет, может ли пользователь получить доступ к дочерним маршрутам определенного родительского маршрута. Это полезно, когда необходимо защитить весь раздел вложенных маршрутов. Другими словами, `canActivateChild` выполняется для всех дочерних компонентов. Если дочерний компонент содержит другой дочерний компонент, `canActivateChild` будет выполнен один раз для обоих компонентов.

Он имеет доступ к следующим аргументам по умолчанию:

- `childRoute: ActivatedRouteSnapshot` — содержит информацию о «будущем» снимке (т.е. состоянии, в которое маршрутизатор пытается перейти) активируемого дочернего маршрута.
- `state: RouterStateSnapshot` — содержит текущее состояние маршрутизатора.

```ts
export const adminChildGuard: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

### CanDeactivate

Параметр `CanDeactivate` определяет, может ли пользователь покинуть маршрут. Распространенный сценарий — предотвращение перехода с несохраненных форм.

Он имеет доступ к следующим аргументам по умолчанию:

- `component: T` — экземпляр компонента, который деактивируется
- `currentRoute: ActivatedRouteSnapshot` — содержит информацию о текущем маршруте
- `currentState: RouterStateSnapshot` — содержит текущее состояние маршрутизатора
- `nextState: RouterStateSnapshot` — содержит следующее состояние маршрутизатора, к которому осуществляется переход

```ts
export const unsavedChangesGuard: CanDeactivateFn<Form> = (
  component: Form,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot,
) => {
  return component.hasUnsavedChanges() ? confirm('You have unsaved changes. Are you sure you want to leave?') : true;
};
```

### CanMatch

Механизм `CanMatch` определяет, может ли маршрут быть сопоставлен во время сопоставления путей. В отличие от других механизмов, в случае отклонения происходит попытка сопоставления с другими маршрутами, а не блокировка навигации полностью. Это может быть полезно для флагов функций, A/B-тестирования или условной загрузки маршрутов.

Он имеет доступ к следующим аргументам по умолчанию:

- `route: Route` - Конфигурация маршрута, которая оценивается
- `segments: UrlSegment[]` - Сегменты URL, которые не были использованы предыдущими оценками родительского маршрута
- `currentSnapshot: PartialMatchRouteSnapshot` - Текущий снимок маршрута на данный момент в процессе сопоставления

Он может возвращать стандартные типы параметров возврата, но если он возвращает `false`, Angular пытается использовать другие подходящие маршруты вместо того, чтобы полностью блокировать навигацию.

```ts
export const unsavedChangesGuard: CanDeactivateFn<Form> = (
  component: Form,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot,
) => {
  return component.hasUnsavedChanges() ? confirm('You have unsaved changes. Are you sure you want to leave?') : true;
};
```

Это также позволяет использовать разные компоненты для одного и того же пути.

```ts
// 📄 routes.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboard,
    canMatch: [adminGuard],
  },
  {
    path: 'dashboard',
    component: UserDashboard,
    canMatch: [userGuard],
  },
];
```

В этом примере, когда пользователь переходит по адресу `/dashboard`, будет использован первый вариант, соответствующий нужному защитному механизму.
