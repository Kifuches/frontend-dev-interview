---
title: 'Вопросы и ответы'
section: 'Angular'
subsection: 'Change Detection'
order: 50
description: 'Материал из большого списка вопросов для собеседования: Change Detection: вопросы и ответы.'
source: 'Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md'
---

## **13 Change Detection**

1. Что такое `Change Detection`?

   #### **Краткий ответ**

   `Change Detection` — механизм Angular, который проверяет, изменились ли данные компонента, и обновляет DOM только там, где изменились привязки.

   Angular не перерисовывает весь экран заново.

   Он проверяет bindings:

   ```ts
   {{ user.name }}
   [disabled]="isLoading"
   [class.active]="selected"
   ```

   и сравнивает старое значение с новым.

   ***

   #### **Как это выглядит**

   ```ts
   Пользователь нажал кнопку
   ↓
   Изменилось состояние
   ↓
   Angular запускает Change Detection
   ↓
   Проверяет дерево компонентов
   ↓
   Сравнивает значения в шаблонах
   ↓
   Обновляет DOM
   ```

   Например:

   ```ts
   name = 'John';

   changeName() {
       this.name = 'Mike';
   }
   ```

   В шаблоне:

   ```html
   {{ name }}
   ```

   Angular помнит старое значение `John`, после события видит новое значение `Mike` и обновляет текст в DOM.

1. Что запускает `Change Detection`?

   Чаще всего Change Detection запускается после асинхронных событий.

   Например:

   ```ts
   click
   input
   setTimeout
   setInterval
   Promise
   HTTP request
   Router navigation
   AsyncPipe
   Signal update
   ```

   В классическом Angular это обычно происходит через `Zone.js`.

   `Zone.js` перехватывает асинхронную операцию и сообщает Angular:

   “Возможно, данные изменились.”

   После этого Angular запускает проверку.

   ***

   #### **Важно**

   `Zone.js` не знает, что именно изменилось.

   Он просто говорит Angular, что что-то могло измениться.

   Поэтому Angular должен проверить компоненты.

1. Чем отличается `Default` от `OnPush`?

   #### **Краткий ответ**

   `Default` проверяет компонент почти при каждом запуске Change Detection.

   `OnPush` проверяет компонент только при конкретных условиях.

   ***

   #### **Default**

   Это стратегия по умолчанию.

   ```ts
   @Component({
     selector: 'app-user',
     templateUrl: './user.component.html',
   })
   export class UserComponent {}
   ```

   При любом событии Angular проходит по дереву компонентов и проверяет этот компонент тоже.

   Это проще, но на больших экранах может быть дороже.

   ***

   #### **OnPush**

   ```ts
   @Component({
     selector: 'app-user',
     templateUrl: './user.component.html',
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   export class UserComponent {}
   ```

   Компонент с `OnPush` будет проверен, если:

   - изменился `@Input` по ссылке;

   - произошло событие внутри компонента;

   - `AsyncPipe` получил новое значение;

   - изменился `Signal`, который используется в шаблоне;

   - вручную вызвали `markForCheck()` или `detectChanges()`.

   ***

   #### **Главная мысль**

   `OnPush` хорошо работает с immutable-подходом.

   Плохо:

   ```ts
   this.user.name = 'Mike';
   ```

   Хорошо:

   ```ts
   this.user = {
     ...this.user,
     name: 'Mike',
   };
   ```

   Во втором случае изменилась ссылка на объект, и Angular понимает, что компонент нужно проверить.

1. Почему `OnPush` может не обновить шаблон?

   Частая причина — мутация объекта без изменения ссылки.

   Например:

   ```ts
   @Input() user!: User;

   changeUser() {
       this.user.name = 'Mike';
   }
   ```

   Для Angular ссылка на `user` осталась той же самой.

   Поэтому `OnPush` компонент может не обновиться.

   Правильно:

   ```ts
   changeUser() {
       this.user = {
           ...this.user,
           name: 'Mike'
       };
   }
   ```

   ***

   #### **Что любят спросить дополнительно**

   **Почему массив не обновился?**

   Потому что сделали мутацию:

   ```ts
   this.items.push(newItem);
   ```

   А надо создать новый массив:

   ```ts
   this.items = [...this.items, newItem];
   ```

1. Чем отличаются `markForCheck()` и `detectChanges()`?

   #### **Краткий ответ**

   `markForCheck()` помечает компонент как грязный и говорит Angular проверить его при ближайшем Change Detection.

   `detectChanges()` запускает проверку сразу для текущего компонента и его дочерних компонентов.

   ***

   #### **markForCheck()**

   ```ts
   constructor(private cdr: ChangeDetectorRef) {}

   update() {
       this.value = 'new value';
       this.cdr.markForCheck();
   }
   ```

   Это мягкий способ сказать Angular:

   “Проверь этот компонент в следующем цикле.”

   Особенно полезно с `OnPush`.

   ***

   #### **detectChanges()**

   ```ts
   constructor(private cdr: ChangeDetectorRef) {}

   update() {
       this.value = 'new value';
       this.cdr.detectChanges();
   }
   ```

   Это немедленная проверка.

   Angular сразу проверит текущий компонент и его детей.

   ***

   #### **Как отвечать на интервью**

   `markForCheck()` — отложенно помечает компонент для проверки.

   `detectChanges()` — синхронно запускает проверку прямо сейчас.

   `detectChanges()` нужно использовать аккуратно, потому что им легко создать лишние проверки или получить ошибку, если вызвать его в неподходящий момент lifecycle.

1. Что делают `detach()` и `reattach()`?

   #### **Краткий ответ**

   `detach()` отключает компонент от дерева Change Detection.

   `reattach()` подключает его обратно.

   ***

   Например:

   ```ts
   constructor(private cdr: ChangeDetectorRef) {}

   ngOnInit() {
       this.cdr.detach();
   }
   ```

   После этого Angular больше не будет автоматически проверять этот компонент.

   Если нужно обновить его вручную:

   ```ts
   refresh() {
       this.cdr.detectChanges();
   }
   ```

   Если нужно вернуть обычное поведение:

   ```ts
   enableChecks() {
       this.cdr.reattach();
   }
   ```

   ***

   #### **Когда это нужно**

   Например, есть тяжелый readonly-компонент, который не должен обновляться на каждое событие приложения.

   Можно отключить его от общей проверки и обновлять вручную раз в несколько секунд или только по конкретному событию.

1. Что делает `runOutsideAngular()`?

   #### **Краткий ответ**

   `runOutsideAngular()` запускает код вне Angular zone, чтобы этот код не запускал Change Detection после каждого асинхронного события.

   ***

   Например:

   ```ts
   constructor(private ngZone: NgZone) {}

   ngOnInit() {
       this.ngZone.runOutsideAngular(() => {
           window.addEventListener('scroll', () => {
               this.calculateScrollPosition();
           });
       });
   }
   ```

   Если обработчик `scroll` остаётся внутри Angular zone, Change Detection может запускаться десятки раз в секунду.

   Это дорого.

   ***

   Если потом нужно вернуться обратно в Angular:

   ```ts
   this.ngZone.run(() => {
     this.isSticky = true;
   });
   ```

   `run()` снова запускает код внутри Angular zone, и Angular сможет обновить шаблон.

1. Почему таблица из 10000 строк может тормозить?

   #### **Краткий ответ**

   Потому что Angular должен проверить много компонентов, bindings и DOM-узлов.

   Проблема обычно не в самом Angular, а в количестве работы:

   ```ts
   10000 строк
   ↓
   несколько bindings в каждой строке
   ↓
   события, фильтры, сортировка
   ↓
   много проверок
   ↓
   тяжелый DOM
   ```

   ***

   #### **Что нужно предложить**

   **1. OnPush**

   ```ts
   changeDetection: ChangeDetectionStrategy.OnPush;
   ```

   Уменьшает количество проверок.

   ***

   **2. trackBy**

   ```html
   <tr *ngFor="let user of users; trackBy: trackByUserId"></tr>
   ```

   ```ts
   trackByUserId(index: number, user: User) {
       return user.id;
   }
   ```

   Angular сможет переиспользовать DOM-элементы, а не пересоздавать строки без необходимости.

   ***

   **3. Virtual Scroll**

   Показывать только видимую часть списка.

   ```ts
   10000 элементов в данных
   ↓
   30 элементов в DOM
   ```

   Это часто самое сильное улучшение для больших таблиц.

   ***

   **4. Immutable objects**

   Не мутировать данные:

   ```ts
   this.users[index].name = 'Mike';
   ```

   А создавать новую ссылку:

   ```ts
   this.users = this.users.map((user) => (user.id === id ? { ...user, name: 'Mike' } : user));
   ```

   ***

   **5. Signals**

   Signals помогают сделать состояние более точным и предсказуемым.

   Angular понимает, какие значения реально используются в шаблоне.

   Это уменьшает лишнюю реактивную работу, особенно вместе с `OnPush`.

   ***

   #### **Как ответить коротко**

   “Таблица тормозит из-за большого количества DOM-узлов и bindings. Я бы начал с `OnPush`, `trackBy`, виртуализации, immutable updates и проверки, нет ли тяжелых функций прямо в шаблоне.”

1. Почему нельзя вызывать тяжелые функции в шаблоне?

   Например:

   ```html
   {{ calculateTotal(user) }}
   ```

   Такая функция может вызываться при каждой проверке Change Detection.

   Если строк 10000, то функция может выполниться 10000 раз за один цикл проверки.

   Плохо:

   ```html
   <div *ngFor="let user of users">{{ calculateStatus(user) }}</div>
   ```

   Лучше заранее подготовить данные:

   ```ts
   usersWithStatus = users.map((user) => ({
     ...user,
     status: calculateStatus(user),
   }));
   ```

   Или использовать `computed()` для Signals, memoization, pipe или selector.

   ***

   #### **Главная мысль**

   Шаблон должен быть дешёвым.

   В шаблоне лучше читать готовое значение, а не запускать тяжёлую бизнес-логику.

---
