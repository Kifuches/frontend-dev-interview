---
title: Задачи
section: Angular
subsection: Change Detection
order: 100
description: ''
source: ''
---

1. Почему таблица из 10000 строк может тормозить?

   #### Краткий ответ

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

   **Что нужно предложить**

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

   ### Как ответить коротко

   “Таблица тормозит из-за большого количества DOM-узлов и bindings. Я бы начал с `OnPush`, `trackBy`, виртуализации, immutable updates и проверки, нет ли тяжелых функций прямо в шаблоне.”

---

2. Почему нельзя вызывать тяжелые функции в шаблоне?

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

   #### **Главная мысль**

   Шаблон должен быть дешёвым.

   В шаблоне лучше читать готовое значение, а не запускать тяжёлую бизнес-логику.
