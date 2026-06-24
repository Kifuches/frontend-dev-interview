---
title: 'Functional Interceptors'
section: 'Angular'
subsection: 'Interceptors'
order: 80
description: ''
source: ''
---

[Документация](https://angular.dev/guide/http/interceptors#configuring-interceptors)

`Functional Interceptors` (Angular 15+) - HTTP interceptors как функции. Типы: `HttpInterceptorFn` для функций, `provideHttpClient()` с `withInterceptors()` для регистрации. Используют `inject()` и `next()` `handler`. Проще чем class-based, меньше boilerplate. Легче композиция и тестирование. Chain порядок определяется массивом. Современная альтернатива `HttpInterceptor` классам.

`Functional interceptors` интегрируются с новым `provideHttpClient()` standalone API.

```ts
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inject the current `AuthService` and use it to get an authentication token:
  const authToken = inject(AuthService).getAuthToken();

  // Clone the request to add the authentication header.
  const newReq = req.clone({
    headers: req.headers.append('X-Authentication-Token', authToken),
  });
  return next(newReq);
}
```
