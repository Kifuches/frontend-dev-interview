# JavaScript задачи по коду для собеседования

Ниже задачи в формате, близком к собеседованию: есть кусок кода, вопрос и разбор с ответом.

## Задача 1. `var` в цикле и `setTimeout`

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}
```

### Вопрос
- Что выведется в консоль?
- Почему?
- Как исправить код, чтобы вывелось `0 1 2`?

### Ответ
Выведется:

```js
3
3
3
```

### Почему так
`var` имеет function scope, а не block scope. Все три callback внутри `setTimeout` замыкаются на одну и ту же переменную `i`. К моменту выполнения таймера цикл уже завершен, и `i === 3`.

### Как исправить
Вариант 1, самый простой:

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}
```

Вариант 2, через IIFE:

```js
for (var i = 0; i < 3; i++) {
  ((value) => {
    setTimeout(() => {
      console.log(value);
    }, 100);
  })(i);
}
```

Что проверяют:
- область видимости `var` и `let`
- closures
- понимание асинхронного выполнения

## Задача 2. `this` теряется в callback

```js
const user = {
  name: 'Anna',
  sayHi() {
    console.log('Hi, ' + this.name);
  },
  delayedHi() {
    setTimeout(this.sayHi, 100);
  }
};

user.delayedHi();
```

### Вопрос
- Что выведется?
- Почему `name` не берется из объекта `user`?
- Как починить?

### Ответ
Скорее всего выведется:

```js
Hi, undefined
```

В strict mode `this` внутри `sayHi` в таком вызове может быть `undefined`, а в нестрогом режиме может указывать на глобальный объект. В любом случае это уже не `user`.

### Почему так
Проблема не в методе `sayHi`, а в том, как он передается в `setTimeout`. Мы передаем функцию отдельно от объекта, и контекст вызова теряется.

### Как исправить
Вариант 1, через стрелку:

```js
delayedHi() {
  setTimeout(() => this.sayHi(), 100);
}
```

Вариант 2, через `bind`:

```js
delayedHi() {
  setTimeout(this.sayHi.bind(this), 100);
}
```

Что проверяют:
- понимание `this`
- разницу между методом и обычным вызовом функции
- стрелочные функции и `bind`

## Задача 3. Event loop: что выведется и в каком порядке

```js
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');
```

### Вопрос
- В каком порядке будут логи?
- Почему именно так?

### Ответ
Порядок будет такой:

```js
1
4
3
2
```

### Почему так
- `console.log('1')` выполняется сразу.
- `setTimeout(..., 0)` отправляет callback в macrotask queue.
- `Promise.then(...)` отправляет callback в microtask queue.
- `console.log('4')` выполняется сразу.
- После завершения синхронного кода сначала выполняются microtasks, потом macrotasks.

Что проверяют:
- event loop
- разницу между microtasks и macrotasks
- понимание порядка выполнения асинхронного кода

## Задача 4. `map` с `async` не делает массив результатов

```js
const ids = [1, 2, 3];

async function getUser(id) {
  return { id, name: 'User ' + id };
}

async function run() {
  const users = ids.map(async (id) => {
    return await getUser(id);
  });

  console.log(users);
}

run();
```

### Вопрос
- Что попадет в `users`?
- Почему это не массив готовых пользователей?
- Как правильно получить массив объектов?

### Ответ
В `users` попадет массив промисов:

```js
[Promise, Promise, Promise]
```

### Почему так
`async`-функция всегда возвращает `Promise`. Метод `map` не умеет сам дожидаться выполнения асинхронных callback.

### Как исправить

```js
async function run() {
  const users = await Promise.all(
    ids.map((id) => getUser(id))
  );

  console.log(users);
}
```

Что проверяют:
- `async/await`
- работу `Promise.all`
- понимание того, что `map` не “await-ит” автоматически

## Задача 5. Мутация массива и неожиданный побочный эффект

```js
const original = [{ id: 1 }, { id: 2 }];
const copy = [...original];

copy[0].id = 100;

console.log(original[0].id);
console.log(copy[0].id);
```

### Вопрос
- Что выведется?
- Почему изменение `copy` повлияло на `original`?
- Как сделать независимую копию?

### Ответ
Выведется:

```js
100
100
```

### Почему так
Оператор spread для массива делает поверхностную копию. Новый массив создается, но объекты внутри остаются теми же самыми по ссылке.

### Как исправить
Если нужен новый массив и новые объекты внутри:

```js
const deepEnoughCopy = original.map(item => ({ ...item }));
```

Если структура вложенная и сложная, нужен более осознанный deep copy подход, например `structuredClone`, если он подходит для конкретного типа данных:

```js
const deepCopy = structuredClone(original);
```

Что проверяют:
- ссылочные типы
- поверхностное и глубокое копирование
- понимание мутабельности данных

## Как тренироваться по этим задачам

Хороший формат ответа на собеседовании:
1. Сначала сказать, что выведется или где баг.
2. Потом объяснить причину.
3. После этого предложить 1-2 корректных способа исправления.
4. В конце коротко назвать, какую тему проверяет задача.

## Задача 6. `typeof` и странности JavaScript

```js
console.log(typeof null);
console.log(typeof []);
console.log(typeof function () {});
console.log(typeof NaN);
console.log(typeof undefined);
```

### Вопрос
- Что выведется?
- Почему `typeof null` дает неожиданный результат?
- Как корректно проверять массивы и `null`?

### Ответ
Выведется:

```js
object
object
function
number
undefined
```

### Почему так
- `typeof null === 'object'` это историческая ошибка JavaScript.
- Массивы технически тоже объекты, поэтому `typeof [] === 'object'`.
- Функции имеют специальный результат `function`.
- `NaN` имеет тип `number`, хотя по смыслу это “не число”.

### Как правильно проверять
Для `null`:

```js
value === null
```

Для массива:

```js
Array.isArray(value)
```

### Что проверяют
- знание edge cases JavaScript
- понимание различия между типом и смыслом значения
- аккуратные проверки типов

## Задача 7. Сложная конкатенация и приведение типов

```js
console.log('5' + 3 - 2);
console.log('5' - 3 + 2);
console.log(1 + '2' + 3);
console.log(1 + +'2' + 3);
console.log('10' + (2 - '1'));
```

### Вопрос
- Что выведется в каждом случае?
- Почему результат в похожих выражениях разный?
- В каких местах срабатывает конкатенация, а в каких числовое приведение?

### Ответ
Результаты:

```js
51
4
123
6
101
```

### Разбор
`'5' + 3` дает строку `'53'`, потом `'53' - 2` превращает строку в число, получаем `51`.

`'5' - 3` это уже числовая операция, результат `2`, потом `2 + 2 = 4`.

`1 + '2'` дает строку `'12'`, потом `'12' + 3` дает `'123'`.

`+'2'` это унарный плюс, он приводит строку к числу, поэтому `1 + 2 + 3 = 6`.

`2 - '1'` дает `1`, а потом `'10' + 1` дает строку `'101'`.

### Что проверяют
- implicit coercion
- порядок вычисления выражений
- разницу между `+` как конкатенацией и как числовым сложением

## Задача 8. `isNaN` vs `Number.isNaN`

```js
console.log(isNaN('hello'));
console.log(isNaN('123'));
console.log(isNaN(undefined));
console.log(Number.isNaN('hello'));
console.log(Number.isNaN(NaN));
console.log(Number.isNaN(undefined));
```

### Вопрос
- Что выведется?
- Почему `isNaN` и `Number.isNaN` ведут себя по-разному?
- Какой вариант безопаснее в прикладном коде?

### Ответ
Результаты:

```js
true
false
true
false
true
false
```

### Почему так
`isNaN` сначала пытается привести значение к числу, а потом уже проверяет, является ли результат `NaN`.

Примеры:
- `isNaN('hello')` -> строка не превращается в корректное число, значит `true`
- `isNaN('123')` -> превращается в `123`, значит `false`
- `isNaN(undefined)` -> превращается в `NaN`, значит `true`

`Number.isNaN` ничего не приводит и возвращает `true` только для настоящего значения `NaN`.

### Что безопаснее
В обычном коде чаще безопаснее `Number.isNaN`, потому что он не делает скрытых преобразований типов и ведет себя предсказуемо.

### Что проверяют
- знание coercion
- внимательность к встроенным функциям
- понимание “настоящего” `NaN`

## Задача 9. Комбинированная задача: `typeof`, `NaN`, конкатенация

```js
const value = '5px';

console.log(typeof value);
console.log(Number(value));
console.log(isNaN(value));
console.log(Number.isNaN(value));
console.log(parseInt(value, 10) + 1);
console.log(value + 1);
console.log(+value + 1);
```

### Вопрос
- Что выведется?
- Почему `parseInt(value, 10) + 1` работает, а `+value + 1` нет?
- Чем `isNaN(value)` отличается от `Number.isNaN(value)` в этом примере?

### Ответ
Результаты:

```js
string
NaN
true
false
6
5px1
NaN
```

### Разбор
`value` это строка, поэтому `typeof value === 'string'`.

`Number('5px')` возвращает `NaN`, потому что вся строка не может быть преобразована в число.

`isNaN('5px')` возвращает `true`, потому что сначала пытается привести строку к числу и получает `NaN`.

`Number.isNaN('5px')` возвращает `false`, потому что сама строка `'5px'` не является значением `NaN`.

`parseInt('5px', 10)` читает число с начала строки и останавливается на первом неподходящем символе, поэтому получается `5`.

`value + 1` это строковая конкатенация, результат `'5px1'`.

`+value` пытается преобразовать всю строку `'5px'` в число, получает `NaN`, и дальше `NaN + 1` остается `NaN`.

### Что проверяют
- глубокое понимание приведения типов
- разницу между `Number`, `parseInt`, `isNaN`, `Number.isNaN`
- умение не путаться в похожих, но разных механиках JavaScript

## Блок: Closures и Prototype

## Задача 10. Closure и “живая” переменная

```js
function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getValue() {
      return count;
    }
  };
}

const counterA = createCounter();
const counterB = createCounter();

console.log(counterA.increment());
console.log(counterA.increment());
console.log(counterB.increment());
console.log(counterA.getValue());
```

### Вопрос
- Что выведется?
- Почему `counterA` и `counterB` не мешают друг другу?
- Что именно здесь хранит closure?

### Ответ
Результаты:

```js
1
2
1
2
```

### Почему так
Каждый вызов `createCounter()` создает новую lexical environment со своей переменной `count`. Методы `increment`, `decrement` и `getValue` замыкаются именно на эту переменную, а не на ее копию.

`counterA` и `counterB` созданы разными вызовами функции, поэтому у каждого свой независимый `count`.

### Что важно проговорить
- closure хранит доступ к окружению, в котором функция была создана;
- замыкается не “значение на момент создания”, а сама переменная;
- именно поэтому состояние может жить между вызовами функции.

### Что проверяют
- closures
- lexical scope
- понимание приватного состояния через функции

## Задача 11. Closure в цикле, но посложнее

```js
function createHandlers() {
  const handlers = [];

  for (let i = 0; i < 3; i++) {
    handlers.push(function () {
      return i;
    });
  }

  return handlers;
}

const handlers = createHandlers();

console.log(handlers[0]());
console.log(handlers[1]());
console.log(handlers[2]());
```

### Вопрос
- Что выведется?
- Почему здесь поведение отличается от похожего примера с `var`?
- Что именно создает `let` внутри цикла?

### Ответ
Результаты:

```js
0
1
2
```

### Почему так
В `for` с `let` на каждой итерации создается новое блочное binding для `i`. Поэтому каждая функция замыкается не на одну общую переменную, а на отдельную переменную своей итерации.

С `var` было бы иначе: все функции ссылались бы на одну и ту же переменную, которая после завершения цикла стала бы равна `3`.

### Что проверяют
- разницу между `var` и `let`
- более глубокое понимание closures в цикле
- block scope

## Задача 12. Prototype и shadowing свойств

```js
function User(name) {
  this.name = name;
}

User.prototype.role = 'guest';

const user1 = new User('Anna');
const user2 = new User('Ivan');

user1.role = 'admin';

console.log(user1.role);
console.log(user2.role);
console.log(User.prototype.role);
```

### Вопрос
- Что выведется?
- Почему изменение `user1.role` не повлияло на `user2.role`?
- Что происходит при чтении свойства у объекта?

### Ответ
Результаты:

```js
admin
guest
guest
```

### Почему так
`user1.role = 'admin'` не меняет свойство в прототипе, а создает собственное свойство `role` у `user1`. Это называется shadowing: собственное свойство перекрывает одноименное свойство из prototype chain.

При чтении свойства JavaScript сначала ищет его в самом объекте. Если не находит, поднимается вверх по prototype chain.

### Что проверяют
- prototype chain
- различие между own properties и inherited properties
- shadowing

## Задача 13. Изменение prototype после создания объектов

```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function () {
  return 'Hi, ' + this.name;
};

const p1 = new Person('Anna');

Person.prototype.sayBye = function () {
  return 'Bye, ' + this.name;
};

console.log(p1.sayHi());
console.log(p1.sayBye());
```

### Вопрос
- Что выведется?
- Почему `p1` видит метод, который добавили в prototype уже после его создания?
- В каком случае старые объекты не увидели бы изменения?

### Ответ
Результаты:

```js
Hi, Anna
Bye, Anna
```

### Почему так
Объект хранит ссылку на prototype, а не копию всех его свойств. Поэтому если в существующий `Person.prototype` позже добавить новый метод, уже созданные объекты тоже его увидят через prototype chain.

### Когда это не сработает
Если не дополнять старый prototype, а полностью заменить его:

```js
Person.prototype = {
  anotherMethod() {}
};
```

Тогда старые объекты останутся связаны со старым prototype, а новые будут создаваться уже с новым.

### Что проверяют
- живую связь с prototype
- понимание того, как объекты находят методы
- разницу между изменением объекта-прототипа и полной заменой ссылки на prototype
