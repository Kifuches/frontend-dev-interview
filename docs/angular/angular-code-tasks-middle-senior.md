---
title: 10 задач по коду Angular-приложения
section: Задачи
order: 1
description: Change Detection, Default, OnPush
---

Ниже 10 задач, похожих на live-coding, code review или устный разбор бага на Angular-собеседовании. Формат у каждой задачи одинаковый: код, проблема и что нужно объяснить.

## Задача 1. Почему дочерний компонент не обновляется

```ts
// parent.component.ts
@Component({
  selector: 'app-parent',
  template: `
    <button (click)="rename()">Rename</button>
    <app-user-card [user]="user"></app-user-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentComponent {
  user = { name: 'Anna' };

  rename() {
    this.user.name = 'Maria';
  }
}
```

```ts
// user-card.component.ts
@Component({
  selector: 'app-user-card',
  template: `{{ user.name }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @Input() user!: { name: string };
}
```

Что нужно объяснить:

- почему имя не обновляется;
- как это связано с `OnPush`;
- как исправить код корректно.

### Ответ

Проблема в том, что при `OnPush` Angular ориентируется на изменение ссылки входных данных, а не на мутацию поля внутри объекта. Здесь ссылка `user` остается той же самой, меняется только `user.name`, поэтому дочерний `OnPush` компонент не видит нового `@Input`.

Корректное исправление:

```ts
rename() {
  this.user = { ...this.user, name: 'Maria' };
}
```

Главная мысль: с `OnPush` важно обновлять данные иммутабельно.

---

## Задача 2. Почему шаблон ничего не показывает

```ts
export class ProfileComponent {
  user$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    map((id) => this.userService.getUser(Number(id))),
  );

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) {}
}
```

```html
<div *ngIf="user$ | async as user">{{ user.name }}</div>
```

Что нужно объяснить:

- какой тип реально лежит в `user$`;
- почему `async` pipe здесь не дает нужный результат;
- какой оператор нужен вместо текущего и почему.

### Ответ

Сейчас `user$` имеет тип `Observable<Observable<User>>`, потому что второй `map` возвращает не самого пользователя, а новый observable. `async` pipe подписывается только на внешний observable и получает внутренний observable как значение, а не итоговый объект пользователя.

Правильно использовать `switchMap`:

```ts
user$ = this.route.paramMap.pipe(
  map((params) => params.get('id')),
  switchMap((id) => this.userService.getUser(Number(id))),
);
```

`switchMap` здесь хорош тем, что flatten-ит поток и при смене параметра маршрута отменяет предыдущий запрос.

---

## Задача 3. Почему запросы не отменяются

```ts
this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    mergeMap((query) => this.userService.search(query)),
  )
  .subscribe((result) => {
    this.users = result;
  });
```

Что нужно объяснить:

- в чем проблема такого решения для строки поиска;
- почему здесь может появляться гонка запросов;
- какой оператор выбрать вместо `mergeMap`.

### Ответ

Для поиска `mergeMap` плох тем, что старые запросы не отменяются. Если пользователь быстро вводит несколько значений, ответы могут прийти в другом порядке и устаревший результат перезапишет актуальный.

Нужен `switchMap`:

```ts
this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    switchMap((query) => this.userService.search(query)),
  )
  .subscribe((result) => {
    this.users = result;
  });
```

Идея: для строки поиска нас интересует только последний запрос.

---

## Задача 4. Почему есть утечка памяти

```ts
export class DashboardComponent implements OnInit {
  constructor(private eventsService: EventsService) {}

  ngOnInit() {
    this.eventsService.events$.subscribe((event) => {
      console.log(event);
    });
  }
}
```

Что нужно объяснить:

- почему тут возможна утечка;
- как это исправить в современном Angular;
- когда `async` pipe лучше ручной подписки.

### Ответ

Подписка создается в `ngOnInit`, но нигде не очищается. Если `events$` долгоживущий поток, компонент может быть уничтожен, а подписка останется жить, что ведет к утечке памяти и лишней работе.

Современный вариант:

```ts
export class DashboardComponent implements OnInit {
  constructor(private eventsService: EventsService) {}

  ngOnInit() {
    this.eventsService.events$.pipe(takeUntilDestroyed()).subscribe((event) => {
      console.log(event);
    });
  }
}
```

`async` pipe лучше ручной подписки, когда поток нужен прямо в шаблоне. Тогда Angular сам управляет подпиской и ее очисткой.

---

## Задача 5. Почему форма ведет себя нестабильно

```ts
this.form = this.fb.group({
  password: [''],
  confirmPassword: [''],
});

this.form.get('password')?.valueChanges.subscribe((value) => {
  if (value.length < 8) {
    this.form.get('confirmPassword')?.disable();
  } else {
    this.form.get('confirmPassword')?.enable();
  }
});
```

Что нужно объяснить:

- какие здесь есть архитектурные и реактивные проблемы;
- где возможны лишние side effects;
- как сделать это чище и надежнее.

### Ответ

Проблема в том, что поведение формы строится на ручной подписке и прямых side effects `enable/disable`. Со временем такие подписки начинают размножаться, логика формы расползается и становится трудно предсказуемой.

Минимум, что стоит сделать:

- контролировать lifecycle подписки;
- защищаться от `null/undefined`;
- не смешивать бизнес-правила и imperative-логику в случайных местах.

Более чистый вариант — вынести логику в отдельный поток или helper и централизованно управлять состоянием формы. На собеседовании хороший ответ: “это работает, но плохо масштабируется”.

---

## Задача 6. Почему `trackBy` важен

```html
<div *ngFor="let item of items">
  <app-row [item]="item"></app-row>
</div>
```

Что нужно объяснить:

- в чем риск такого списка без `trackBy`;
- почему это особенно важно на больших списках;
- как должен выглядеть корректный `trackBy`.

### Ответ

Без `trackBy` Angular по умолчанию сопоставляет элементы списка менее эффективно и может пересоздавать DOM-узлы там, где это не нужно. На больших списках это бьет по производительности и может приводить к потере локального состояния дочерних компонентов.

Корректный вариант:

```ts
trackById(index: number, item: { id: number }) {
  return item.id;
}
```

```html
<div *ngFor="let item of items; trackBy: trackById">
  <app-row [item]="item"></app-row>
</div>
```

Идея: Angular должен понимать, какой элемент списка реально тот же самый, а какой новый.

---

## Задача 7. Почему guard выбран неудачно

```ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAdmin();
};
```

Маршрут:

```ts
{
  path: 'admin',
  loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
  canActivate: [authGuard]
}
```

Что нужно объяснить:

- почему в некоторых случаях здесь полезнее `CanMatch`, а не `CanActivate`;
- как это влияет на lazy loading;
- что guard делает, а чего не делает с точки зрения безопасности.

### Ответ

`CanActivate` проверяет доступ уже на этапе активации маршрута. `CanMatch` полезен раньше — он может не дать маршруту вообще сматчиться, что особенно важно для lazy-loaded маршрутов. Это помогает не загружать лишний код, если пользователь все равно не должен видеть эту фичу.

С точки зрения безопасности guard защищает клиентский сценарий и UX, но не заменяет серверную авторизацию. Проверка прав все равно должна существовать на backend.

---

## Задача 8. Почему interceptor может сломать auth flow

```ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${this.authService.getToken()}`
    }
  });

  return next.handle(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        return this.authService.refreshToken().pipe(
          switchMap(token => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next.handle(retryReq);
          })
        );
      }

      throw err;
    })
  );
}
```

Что нужно объяснить:

- где здесь риск бесконечных или дублирующихся refresh-сценариев;
- почему при нескольких параллельных `401` это может стать проблемой;
- как обычно проектируют централизованный refresh flow.

### Ответ

Если несколько запросов одновременно получили `401`, каждый из них может независимо вызвать `refreshToken()`. Это приводит к гонкам, лишним refresh-запросам и сложному непредсказуемому поведению. Отдельный риск — если сам refresh-запрос тоже вернет `401`, можно получить цикл.

Обычно refresh flow проектируют централизованно:

- один refresh в единицу времени;
- остальные запросы ждут его результат;
- после успешного refresh запросы повторяются с новым токеном;
- при неуспехе происходит единый logout/redirect сценарий.

---

## Задача 9. Почему компонент слишком “толстый”

```ts
export class OrdersComponent {
  orders: Order[] = [];
  loading = false;
  selectedStatus = 'all';

  loadOrders() {
    this.loading = true;
    this.ordersService.getOrders().subscribe((orders) => {
      this.orders = orders.filter((order) => {
        if (this.selectedStatus === 'all') return true;
        return order.status === this.selectedStatus;
      });

      this.loading = false;
    });
  }

  changeStatus(status: string) {
    this.selectedStatus = status;
    this.loadOrders();
  }
}
```

Что нужно объяснить:

- какие ответственности смешаны в одном компоненте;
- как бы ты вынесла это в более чистую архитектуру;
- где здесь можно использовать RxJS/state-подход вместо imperative-логики.

### Ответ

Компонент одновременно управляет загрузкой, хранит состояние фильтра, фильтрует данные, обрабатывает подписки и знает о data layer. Это слишком много ответственности для одного класса.

Я бы разделила:

- data fetching и error/loading state вынесла в facade/service/store;
- selectedStatus сделала бы отдельным реактивным источником состояния;
- фильтрацию связала бы через поток данных, а не через ручной `loadOrders()` после каждого изменения.

Так код становится лучше тестируемым и масштабируемым.

---

## Задача 10. Почему `shareReplay` может стать багом

```ts
users$ = this.http.get<User[]>('/api/users').pipe(shareReplay(1));
```

Что нужно объяснить:

- в чем плюс такого кода;
- в чем риск такого кода в долгоживущем приложении;
- когда этот кэш может начать мешать;
- как бы ты управляла invalidation.

### Ответ

Плюс `shareReplay(1)` в том, что он переиспользует уже загруженный результат и не делает повторный HTTP-запрос для каждого подписчика.

Риск в том, что кэш может жить дольше, чем нужно, и UI начнет получать устаревшие данные. В долгоживущем приложении это особенно опасно, если список пользователей может меняться, а поток так и остается закэшированным навсегда.

Явный вопрос здесь — invalidation. Нужно заранее понимать:

- когда кэш нужно сбрасывать;
- кто это делает;
- должен ли пользователь видеть обновленные данные после мутации, навигации или по таймеру.

На senior-уровне важно не просто знать `shareReplay`, а понимать lifecycle кэша.

## Как тренироваться по этим задачам

Хороший формат ответа:

1. Сначала назвать точную проблему.
2. Потом объяснить, почему Angular или RxJS ведут себя именно так.
3. После этого предложить исправление.
4. В конце коротко сказать, какой engineering trade-off ты здесь видишь.
