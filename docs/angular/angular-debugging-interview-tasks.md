# Angular 2+ debug-задачи для собеседования

Задачи в формате: "вот код, тут не показывается информация, почему и как это исправить". Это хороший формат тренировки под live-coding и устные технические интервью.

## Задача 1. `OnPush`, но данные в дочернем компоненте не обновляются

Есть родительский и дочерний компонент.

```ts
// parent.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParentComponent {
  user = {
    name: 'Anna',
    age: 30
  };

  updateName() {
    this.user.name = 'Maria';
  }
}
```

```html
<!-- parent.component.html -->
<button (click)="updateName()">Change name</button>
<app-user-card [user]="user"></app-user-card>
```

```ts
// user-card.component.ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  @Input() user!: { name: string; age: number };
}
```

```html
<!-- user-card.component.html -->
<div>{{ user.name }}</div>
<div>{{ user.age }}</div>
```

### Вопросы
- Почему после нажатия на кнопку имя не меняется в дочернем компоненте?
- Как это исправить?
- Какие есть 2-3 корректных варианта решения?

### Что тут проверяют
- понимание `OnPush`
- мутабельность vs иммутабельность
- как Angular понимает, что нужно перерисовать компонент

## Задача 2. В шаблоне не показывается пользователь

```ts
// profile.component.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { UserService } from './user.service';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  user$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.user$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      map(id => this.userService.getUser(Number(id)))
    );
  }
}
```

```html
<!-- profile.component.html -->
<div *ngIf="user$ | async as user">
  <h3>{{ user.name }}</h3>
  <p>{{ user.email }}</p>
</div>
```

```ts
// user.service.ts
getUser(id: number): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`);
}
```

### Вопросы
- Почему в шаблоне не показываются `name` и `email`?
- Какой тип реально лежит в `user$`?
- Как правильно переписать этот код?
- Почему здесь лучше использовать именно этот RxJS-оператор?

### Что тут проверяют
- понимание `async` pipe
- разницу между `map` и `switchMap`
- работу с `Observable<Observable<T>>`
