<div align="center">

# 🌱 LifeOS

**Автономная персональная операционная система на принципах Offline-First для задач, знаний, телеметрии и рефлексии.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20(idb)-10B981?style=flat-square)](#-архитектура-и-приватность)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?style=flat-square&logo=storybook&logoColor=white)](https://storybook.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../LICENSE)

[Модули](#-ключевые-модули) • [Архитектура](#-архитектура-и-приватность) • [Быстрый старт](#-быстрый-старт) • [Документация кода](CODE_DOCUMENTATION.md) • [English Version](README_EN.md)

</div>

---

## 📌 Обзор

**LifeOS** — это персональный центр управления продуктивностью и данными, работающий полностью на стороне клиента. Приложение объединяет задачи, граф заметок, спортивную телеметрию, бюджет и социальные связи в единую систему с **нулевой передачей данных во внешние облака**.

---

## ✨ Ключевые модули

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>🎛️ Хаб и Матрица Эйзенхауэра</h4>
      <ul>
        <li>4 квадранта приоритизации по срочности и важности.</li>
        <li>Индикатор текущей когнитивной нагрузки и быстрые действия.</li>
        <li>Теги, дедлайны, фильтры и удобный трекер выполнения.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>🧠 Zettelkasten Граф Знаний</h4>
      <ul>
        <li>Интерактивная 2D-визуализация связей между заметками.</li>
        <li>Кластеризация по тегам, зум, панорамирование и превью заметок.</li>
        <li>Экспорт базы заметок в чистый Markdown (Obsidian / Notion ready).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>🚴 Велоспорт и Гараж</h4>
      <ul>
        <li>Учет пробега и сервисной истории для каждого велосипеда.</li>
        <li>Контроль износа компонентов (цепь, кассета, покрышки, колодки).</li>
        <li>Журнал заездов (дистанция, набор высоты, мощность, пульс, RPE).</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>💳 Капитал и Бюджетирование</h4>
      <ul>
        <li>Учет расходов по категориям с динамическими индикаторами лимитов.</li>
        <li>Цели накопления с визуальным прогрессом и сроками.</li>
        <li>Календарь регулярных подписок и локальный экспорт в CSV.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>🤝 Социальный Граф (CRM)</h4>
      <ul>
        <li>2D-физика связей окружения, работающая в фоновом Web Worker.</li>
        <li>Диагностика угасания контактов на основе интервалов общения.</li>
        <li>Оценка взаимности инициативы и круги общения.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>📈 Привычки и Рефлексия</h4>
      <ul>
        <li>Учет стриков привычек с нормализацией часовых поясов.</li>
        <li>Дневник рефлексии с оценкой настроения (1–5).</li>
        <li>Цифровой музей: памятные цитаты, мысли и вехи.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🔒 Архитектура и Приватность

- **100% Client-Side:** Все данные хранятся локально в браузере в **IndexedDB** (`idb`).
- **Строгая валидация:** Контроль целостности данных на границах хранилища через **Zod схемы**.
- **Фоновые вычисления:** Расчет физики графа вынесен в **Web Worker**, исключая фризы интерфейса.
- **Нулевая телеметрия:** Отсутствие трекеров, аналитики и облачных логов.

---

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- npm 10+

```bash
# Клонировать репозиторий
git clone https://github.com/m0rvey/lifeos.git
cd lifeos

# Установить зависимости
npm install

# Запустить сервер разработки
npm run dev
```

Приложение откроется по адресу `http://localhost:5173`.

---

## 🧪 Тестирование и Сборка

```bash
# Запуск unit-тестов
npm run test

# Проверка типов
npm run typecheck

# Проверка линтером
npm run lint

# Запуск каталога компонентов Storybook
npm run storybook
```

---

## 📄 Лицензия

Распространяется под лицензией **MIT**. Подробнее см. [LICENSE](../LICENSE).  
Автор: [m0rvey](https://github.com/m0rvey).
