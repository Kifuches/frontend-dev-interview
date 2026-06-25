---
title: Shared services
section: Angular
subsection: Dependency Injection
order: 40
---

## Shared service

Shared service подходит, когда несколько компонентов внутри одной feature должны работать с одним состоянием или одним API.

```ts
@Injectable()
export class UsersPageState {
  private readonly _selectedUserId = signal<string | null>(null);

  readonly selectedUserId = this._selectedUserId.asReadonly();

  selectUser(id: string): void {
    this._selectedUserId.set(id);
  }
}
```

Компоненты получают сервис через `DI`:

```ts
export class UsersListComponent {
  private readonly state = inject(UsersPageState);

  select(id: string): void {
    this.state.selectUser(id);
  }
}
```

```ts
export class UserDetailsComponent {
  private readonly state = inject(UsersPageState);

  selectedUserId = this.state.selectedUserId;
}
```

Когда подходит:

- sibling-компоненты не имеют удобной прямой связи;
- состояние относится к одной странице или feature;
- нужно избежать длинной цепочки input/output через 4-5 уровней.

Важно: Лучше ограничивать область жизни такого сервиса. Если state нужен только странице, можно предоставить сервис на уровне route/component providers, а не делать его глобальным singleton через `providedIn: 'root'`.

## `inject()`

`inject()` - это способ получить зависимость из DI без constructor injection.

```ts
export class ProfileComponent {
  private readonly userApi = inject(UserApiService);
  private readonly state = inject(ProfileState);
}
```

Это не способ передачи данных между конкретными parent/child-компонентами напрямую. Это способ получить сервис, через который компоненты могут работать с общим состоянием или логикой.

Когда удобно:

- в [standalone components](./angular-standalone-components.md);
- в [functional guards](./angular-functional-guards.md)/[interceptors](./angular-functional-interceptors.md);
- в сервисах и factory functions;
- когда dependencies используются рядом с полями, `signals` или `computed`.

Когда быть осторожнее:

- не прятать слишком много зависимостей в случайных местах класса;
- не использовать DI как скрытый глобальный канал для всего подряд;
- помнить, что `inject()` работает только в injection context.
