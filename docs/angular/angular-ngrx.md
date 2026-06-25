---
title: NgRx
section: Angular
subsection: State Management
order: 90
description: NgRx.
source: Вопросы+для+собесов+aad0833b-ac31-4dfd-98c4-f5ea8050ab0e.md
---

## NgRx

NgRx выбирают, когда state становится application-level, и команде нужна строгая архитектура.

Подходит, если:

- состояние используют многие независимые feature;
- есть сложные side effects;
- нужна трассировка через actions;
- нужны devtools, replay/debug;
- команда договорилась хранить важные изменения состояния явно.

Пример уровня задачи для NgRx: корзина интернет-магазина, авторизация, permissions, entity cache, много экранов, которые зависят от одного источника состояния.

Для локального состояния одной страницы NgRx часто избыточен. Там проще начать с component state или feature-сервиса на signals.

# **Часть 8. NgRx**

Вопросы:

Store

Actions

Reducers

Effects

Selectors

Entity

Component Store

Signal Store

Когда вообще нужен Store?

---
