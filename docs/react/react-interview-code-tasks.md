# React задачи по коду для собеседования

Ниже задачи уровня middle/senior в формате “вот код, что здесь не так, что выведется и как исправить”.

## Задача 1. Почему счетчик увеличивается только на 1

```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### Вопрос

- Почему после одного клика счетчик увеличивается только на `1`, а не на `3`?
- Как исправить?

### Ответ

Все три вызова используют одно и то же значение `count` из текущего рендера. Поэтому React видит три одинаковых обновления вида “поставь `1`”, а не цепочку `+1`.

Правильный вариант:

```tsx
const handleClick = () => {
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
};
```

### Что проверяют

- batched updates
- stale value из текущего рендера
- functional updates

## Задача 2. Почему `useEffect` вызывает бесконечный цикл

```tsx
import { useEffect, useState } from 'react';

export function Users() {
  const [users, setUsers] = useState<string[]>([]);

  const loadUsers = () => {
    setUsers(['Anna', 'Ivan']);
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <ul>
      {users.map((user) => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  );
}
```

### Вопрос

- Почему эффект может вызываться снова и снова?
- Как это исправить корректно?

### Ответ

`loadUsers` создается заново на каждом рендере. Значит зависимость `[loadUsers]` на каждом рендере новая, эффект снова запускается, внутри делает `setUsers`, это вызывает новый рендер, и цикл продолжается.

Вариант 1, если функция нужна только внутри эффекта:

```tsx
useEffect(() => {
  setUsers(['Anna', 'Ivan']);
}, []);
```

Вариант 2, если функция нужна отдельно:

```tsx
import { useCallback, useEffect, useState } from 'react';

const loadUsers = useCallback(() => {
  setUsers(['Anna', 'Ivan']);
}, []);
```

Но `useCallback` не нужно добавлять автоматически везде. Сначала стоит упростить структуру.

### Что проверяют

- зависимости `useEffect`
- identity функций
- причины бесконечных циклов в React

## Задача 3. Почему список “ломается” при `index` как `key`

```tsx
import { useState } from 'react';

export function TodoList() {
  const [items, setItems] = useState([
    { id: 1, text: 'A' },
    { id: 2, text: 'B' },
    { id: 3, text: 'C' },
  ]);

  const removeFirst = () => {
    setItems(items.slice(1));
  };

  return (
    <div>
      <button onClick={removeFirst}>Remove first</button>
      {items.map((item, index) => (
        <input key={index} defaultValue={item.text} />
      ))}
    </div>
  );
}
```

### Вопрос

- Почему после удаления первого элемента значения в input могут “съезжать”?
- Почему `index` здесь плохой `key`?
- Как исправить?

### Ответ

React использует `key` для сопоставления старых и новых элементов. Если использовать `index`, то после удаления первого элемента React считает, что второй элемент это тот же самый первый input, просто с новым props. Из-за этого DOM-узлы могут переиспользоваться не так, как ожидается.

Правильнее:

```tsx
{
  items.map((item) => <input key={item.id} defaultValue={item.text} />);
}
```

### Что проверяют

- reconciliation
- назначение `key`
- проблемы при переиспользовании DOM-узлов

## Задача 4. Почему дочерний компонент ререндерится каждый раз

```tsx
import { memo, useState } from 'react';

const Child = memo(function Child({ onClick }: { onClick: () => void }) {
  console.log('child render');
  return <button onClick={onClick}>Child button</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={() => console.log('child click')} />
    </div>
  );
}
```

### Вопрос

- Почему `Child` ререндерится, хотя он обернут в `memo`?
- Как это исправить?
- Всегда ли это вообще нужно исправлять?

### Ответ

Потому что на каждом рендере `Parent` создается новая функция:

```tsx
() => console.log('child click');
```

Для `memo` это уже новый prop по ссылке, поэтому `Child` ререндерится.

Если реально нужна стабильность пропа, можно вынести функцию:

```tsx
import { memo, useState } from 'react';

const Child = memo(function Child({ onClick }: { onClick: () => void }) {
  console.log('child render');
  return <button onClick={onClick}>Child button</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);

  const handleChildClick = () => {
    console.log('child click');
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleChildClick} />
    </div>
  );
}
```

Если нужна именно ссылка, стабильная между рендерами, можно использовать `useCallback`. Но на собеседовании хороший ответ: сначала понять, есть ли реальная проблема производительности, а не оптимизировать все подряд.

### Что проверяют

- referential equality
- `React.memo`
- осознанное отношение к оптимизациям

## Задача 5. Почему значение в `setTimeout` устаревшее

```tsx
import { useState } from 'react';

export function Demo() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      console.log(count);
    }, 1000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Log later</button>
    </div>
  );
}
```

### Вопрос

- Почему в `setTimeout` может логироваться “старое” значение `count`?
- Как получить актуальное значение?

### Ответ

Callback внутри `setTimeout` замыкается на `count` из конкретного рендера, в котором был вызван `handleClick`. Если потом состояние изменилось, callback этого уже не “узнает”, потому что он хранит старое lexical environment.

Варианты решения:

Вариант 1, если нужен актуальный `count` в async callback, использовать `useRef`:

```tsx
import { useEffect, useRef, useState } from 'react';

export function Demo() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const handleClick = () => {
    setTimeout(() => {
      console.log(countRef.current);
    }, 1000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleClick}>Log later</button>
    </div>
  );
}
```

Вариант 2, на интервью достаточно еще объяснить саму причину: stale closure.

### Что проверяют

- closures в React
- stale state
- различие между render-state и mutable ref

## Задача 6. Почему состояние не обновляется в UI

```tsx
import { useState } from 'react';

export function UserCard() {
  const [user, setUser] = useState({
    name: 'Anna',
    age: 30,
  });

  const updateAge = () => {
    user.age = 31;
    setUser(user);
  };

  return (
    <div>
      <p>{user.name}</p>
      <p>{user.age}</p>
      <button onClick={updateAge}>Update age</button>
    </div>
  );
}
```

### Вопрос

- Почему такой код считается неправильным, даже если иногда визуально “работает”?
- Как нужно обновлять состояние?

### Ответ

Проблема в мутации объекта состояния. React ожидает, что состояние обновляется иммутабельно. Здесь меняется тот же самый объект, и потом он же передается обратно в `setUser`.

Правильно:

```tsx
const updateAge = () => {
  setUser((prev) => ({
    ...prev,
    age: 31,
  }));
};
```

### Что проверяют

- иммутабельность
- обновление объектов в state
- понимание того, что React сравнивает значения по ссылке

## Задача 7. Почему запрос уходит дважды

```tsx
import { useEffect } from 'react';

export function Page() {
  useEffect(() => {
    fetch('/api/data');
  }, []);

  return <div>Page</div>;
}
```

### Вопрос

- Почему в dev-режиме запрос может уходить дважды?
- Это баг кода или особенность React?
- Как это правильно объяснить на собеседовании?

### Ответ

В React 18 в development при `StrictMode` некоторые эффекты намеренно вызываются дважды, чтобы подсветить небезопасные side effects. Это не production-поведение, а диагностическое поведение dev-сборки.

На собеседовании хороший ответ:

- объяснить, что это связано со `StrictMode`;
- показать, что ты понимаешь разницу между dev и production;
- сказать, что эффекты должны быть идемпотентными или безопасными к повторному вызову.

### Что проверяют

- `useEffect`
- React 18 `StrictMode`
- понимание dev/prod различий

---

---

# Отсюда

## Задача 8. Race condition при загрузке данных

```tsx
import { useEffect, useState } from 'react';

export function UserDetails({ userId }: { userId: number }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      });
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}
```

### Вопрос

- Что здесь может пойти не так, если `userId` быстро меняется?
- Почему UI может показать не того пользователя?
- Как это исправить?

### Ответ

Если `userId` меняется быстро, более старый запрос может завершиться позже нового и перезаписать состояние устаревшими данными. В итоге на экране окажется неактуальный пользователь.

Исправлять можно через `AbortController` или флаг актуальности:

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => {
      setUser(data);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        throw err;
      }
    });

  return () => controller.abort();
}, [userId]);
```

### Что проверяют

- race conditions
- cleanup в `useEffect`
- понимание актуальности асинхронных данных

## Задача 9. Derived state ломает ввод

```tsx
import { useEffect, useState } from 'react';

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### Вопрос

- Почему такой код может неожиданно затирать пользовательский ввод?
- Когда derived state из props оправдан, а когда это smell?

### Ответ

Если родитель часто ререндерится и передает новое `initialName`, эффект может снова записать prop в локальный state и перетереть уже начатое редактирование. Проблема в том, что локальный state и prop начинают конкурировать как два источника истины.

Derived state оправдан, когда это действительно отдельная временная копия с понятным lifecycle, например форма редактирования, которая должна сбрасываться только при смене сущности. Тогда лучше явно контролировать момент сброса, а не безусловно синхронизировать на каждый prop update.

### Что проверяют

- single source of truth
- derived state pitfalls
- понимание controlled inputs

## Задача 10. Почему `useMemo` не спасает от мутации

```tsx
import { useMemo, useState } from 'react';

export function Products() {
  const [items, setItems] = useState([
    { id: 1, price: 10 },
    { id: 2, price: 20 },
  ]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const updateFirst = () => {
    items[0].price = 100;
    setItems(items);
  };

  return (
    <div>
      <p>{total}</p>
      <button onClick={updateFirst}>Update</button>
    </div>
  );
}
```

### Вопрос

- Почему `total` может не обновиться?
- Почему `useMemo` тут не помогает?

### Ответ

Проблема в мутации массива и его элементов. Ссылка `items` остается той же, а зависимость `useMemo` сравнивается по ссылке, поэтому React может не пересчитать `total`.

Правильно обновлять иммутабельно:

```tsx
const updateFirst = () => {
  setItems((prev) => prev.map((item) => (item.id === 1 ? { ...item, price: 100 } : item)));
};
```

`useMemo` не исправляет неправильную модель данных. Он работает только если зависимости меняются корректно.

### Что проверяют

- иммутабельность
- зависимости `useMemo`
- понимание того, что мемоизация не лечит архитектурную ошибку

## Задача 11. Context и лишние ререндеры

```tsx
import { createContext, useContext, useState } from 'react';

const AppContext = createContext<any>(null);

function UserName() {
  const { user } = useContext(AppContext);
  console.log('UserName render');
  return <div>{user.name}</div>;
}

function ThemePreview() {
  const { theme } = useContext(AppContext);
  console.log('ThemePreview render');
  return <div>{theme}</div>;
}

export function App() {
  const [theme, setTheme] = useState('light');
  const [user] = useState({ name: 'Anna' });

  return (
    <AppContext.Provider value={{ user, theme }}>
      <UserName />
      <ThemePreview />
      <button onClick={() => setTheme('dark')}>Change theme</button>
    </AppContext.Provider>
  );
}
```

### Вопрос

- Почему при изменении `theme` ререндерится и `UserName`, хотя `user` не менялся?
- Как это улучшить?

### Ответ

Потому что меняется значение всего `Provider`, а `useContext` подписывает компонент на весь context value. Даже если `UserName` использует только `user`, он все равно получает новое значение контекста и ререндерится.

Способы улучшить:

- разделить контекст на более мелкие, например `UserContext` и `ThemeContext`;
- стабилизировать value, если это уместно;
- в критичных местах использовать более точечные подходы к state distribution.

### Что проверяют

- как работает `useContext`
- причины лишних ререндеров
- архитектуру state distribution

## Задача 12. Сброс локального состояния из-за `key`

```tsx
import { useState } from 'react';

function Form({ userId }: { userId: number }) {
  const [value, setValue] = useState('');

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

export function Page({ userId }: { userId: number }) {
  return <Form key={userId} userId={userId} />;
}
```

### Вопрос

- Почему при смене `userId` инпут полностью сбрасывается?
- Когда это полезно, а когда становится багом?

### Ответ

`key` говорит React, что это уже другой экземпляр компонента. Поэтому старый `Form` размонтируется, новый смонтируется заново, и локальный state сбросится.

Это полезно, когда действительно нужно полностью пересоздать форму для новой сущности. Но если пользователь ожидает сохранения промежуточного состояния, такой сброс станет багом.

### Что проверяют

- понимание `key` вне списков
- mount/unmount behavior
- lifecycle локального состояния

## Задача 13. Почему cleanup работает не так, как ожидают

```tsx
import { useEffect } from 'react';

export function Listener({ id }: { id: string }) {
  useEffect(() => {
    console.log('subscribe', id);

    return () => {
      console.log('unsubscribe', id);
    };
  }, [id]);

  return <div>{id}</div>;
}
```

### Вопрос

- Что произойдет при смене `id`?
- Почему `unsubscribe` логирует старый `id`, а не новый?

### Ответ

При смене `id` React сначала вызовет cleanup для прошлого эффекта, а потом запустит новый эффект. Cleanup замкнулся на старое значение `id`, потому что относится к предыдущему рендеру.

Это корректное поведение. Cleanup всегда очищает именно тот effect, который был создан раньше.

### Что проверяют

- lifecycle `useEffect`
- closures
- порядок cleanup и нового эффекта

## Задача 14. Почему `memo` не спасает с children

```tsx
import { memo, useState } from 'react';

const Panel = memo(function Panel({ children }: { children: React.ReactNode }) {
  console.log('Panel render');
  return <section>{children}</section>;
});

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <Panel>
        <strong>Static content</strong>
      </Panel>
    </div>
  );
}
```

### Вопрос

- Почему `Panel` может ререндериться, хотя он обернут в `memo` и контент выглядит статическим?

### Ответ

Потому что `children` тоже prop. На каждом рендере родителя создается новый React element `<strong>Static content</strong>`, и для `memo` это уже новое значение пропа по ссылке.

На интервью хороший ответ: `memo` работает только при стабильных props, а `children` не исключение.

### Что проверяют

- `React.memo`
- referential equality React elements
- границы мемоизации

## Задача 15. Почему reducer обновляет state “странно”

```tsx
type State = {
  items: string[];
};

type Action = { type: 'add'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      state.items.push(action.payload);
      return state;
    default:
      return state;
  }
}
```

### Вопрос

- Почему такой reducer считается неправильным?
- Какие проблемы он создает?

### Ответ

Reducer должен быть чистым и иммутабельным. Здесь state мутируется через `push`, а потом возвращается та же самая ссылка. Это ломает предсказуемость обновлений, дебаг и оптимизации, которые опираются на сравнение ссылок.

Правильнее:

```tsx
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    default:
      return state;
  }
}
```

### Что проверяют

- иммутабельность в reducer
- чистые функции
- предсказуемость state updates

## Задача 16. Почему зависимость в `useEffect` кажется “лишней”, но убирать ее опасно

```tsx
import { useEffect } from 'react';

export function Search({ query, fetchResults }: { query: string; fetchResults: (query: string) => void }) {
  useEffect(() => {
    fetchResults(query);
  }, [query]);

  return null;
}
```

### Вопрос

- Что здесь не так с зависимостями?
- Почему просто убрать warning линтера — плохая идея?

### Ответ

Проблема в том, что effect использует `fetchResults`, но dependency array его не содержит. Если ссылка на `fetchResults` меняется между рендерами, effect будет использовать неактуальную функцию.

Просто игнорировать lint warning опасно, потому что он указывает на возможный stale closure bug. Корректное решение зависит от архитектуры:

- либо сделать `fetchResults` стабильным в родителе;
- либо честно включить его в зависимости и упростить поток данных;
- либо перенести логику выше, если effect здесь вообще лишний.

### Что проверяют

- dependencies в `useEffect`
- stale closures
- умение не “воевать с линтером”, а понимать модель React

## Задача 17. Состояние инициализируется из props, но не обновляется

```tsx
import { useState } from 'react';

export function Counter({ initialCount }: { initialCount: number }) {
  const [count] = useState(initialCount);

  return <div>{count}</div>;
}
```

### Вопрос

- Почему при изменении `initialCount` снаружи UI не обновится?
- Это баг или ожидаемое поведение?

### Ответ

`useState(initialCount)` использует значение только на первом рендере. Дальнейшие изменения `initialCount` не переписывают локальный state автоматически. Это ожидаемое поведение React.

Если нужен всегда актуальный prop, не надо копировать его в state без причины. Если нужен именно локальный state с отдельным lifecycle, тогда надо явно решить, когда и как его синхронизировать.

### Что проверяют

- инициализацию state из props
- различие между prop и локальным state
- derived state reasoning

## Как отвечать на такие React-задачи

Хорошая схема ответа:

1. Сначала назвать симптом: что именно идет не так.
2. Потом объяснить, что в React-модели привело к этому: stale closure, referential equality, reconciliation, batched updates, мутация state.
3. После этого предложить исправление.
4. В конце коротко проговорить trade-off или когда проблема реально важна.
