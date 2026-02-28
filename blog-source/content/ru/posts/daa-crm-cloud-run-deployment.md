---
title: "Запуск регистрации в Detroit Automation Academy: от нуля до Cloud Run за одну сессию"
date: 2026-02-28T05:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["Detroit Automation Academy", "Engineering"]
tags: ["gcp", "cloud-run", "react", "golang", "crm", "devops"]
description: "Как мы создали и развернули полнофункциональную многопользовательскую CRM для Detroit Automation Academy — от исправления строковых литералов в Go до запуска портала регистрации на React в Google Cloud Run."
---

Сегодня мы перевели систему регистрации Detroit Automation Academy из состояния сломанной сборки в полностью развернутую и доступную систему всего за одну инженерную сессию. Вот как это происходило.

## Начальная точка: пять сбоев сборки подряд

Скрипт `deploy.sh` был. Образы Docker были. Чего не было, так это работающей сборки.

Первой ошибкой была синтаксическая ошибка Go в `backend/main.go` — символ новой строки внутри строкового литерала:

```go
// Ошибка
fmt.Printf("Detroit Automation Academy Registration Backend starting on port %s...
", port)

// Исправлено
fmt.Printf("Detroit Automation Academy Registration Backend starting on port %s...
", port)
```

Go не допускает неэкранированных переносов строк внутри строковых литералов. Исправление заняло один символ.

## Каскад разрешений IAM

Когда бэкенд собрался, возникла ошибка при отправке в GCR:

```
denied: gcr.io repo does not exist. Creating on push requires the
artifactregistry.repositories.createOnPush permission
```

У сервисного аккаунта Compute были права `artifactregistry.admin`, но у сервисного аккаунта Cloud Build не было `roles/editor`. Мы предоставили права обоим аккаунтам, и сборка прошла.

## Отсутствующая структура фронтенда

У фронтенда на React были `App.tsx` и `EnrollmentForm.tsx`, но не было `public/index.html`, `src/index.tsx` и валидного `tsconfig.json`. Для `react-scripts build` необходимы все три компонента.

Мы также обнаружили ошибку TypeScript: внутри блока раннего возврата `if (view === 'enroll')` TypeScript ограничил тип `view` литералом `'enroll'`, что сделало сравнение `view === 'admin'` бессмысленным (TS2367). Это было исправлено рефакторингом в единый блок `return` с условным рендерингом.

## Замена Terraform прямым развертыванием

Скрипт `deploy.sh` заканчивался командами `terraform init && terraform apply`, но Terraform не был установлен, а директории инфраструктуры не существовало. Чтобы не блокировать процесс, мы заменили это прямыми вызовами `gcloud run deploy`. И бэкенд, и фронтенд были запущены за 60 секунд.

## Хранение данных в Firestore

Изначально бэкенд хранил данные студентов в памяти, что приводило к их удалению при каждом холодном старте. Мы переписали `handlers/students.go` для использования Firestore с возможностью отката к хранению в памяти:

- Коллекции разделены по арендаторам: `students_DAA-CORE`, `students_BGC-METRO`.
- Если Firestore недоступен, обработчик переходит на потокобезопасное хранение в памяти.
- Эндпоинт `/health` теперь сообщает `"storage":"firestore"` или `"storage":"memory"`, что позволяет мгновенно понять текущий режим работы.

## Что работает сейчас

| Сервис | URL |
|---------|-----|
| Backend API (Go + Firestore) | `daa-crm-backend-87748455115.us-central1.run.app` |
| Registration Portal (React) | `enroll.detroitautomationacademy.com` |

Панель администратора теперь защищена PIN-кодом — сотрудники вводят пароль один раз за сессию, он сохраняется в `sessionStorage`. Форма регистрации остается полностью публичной.

---

*Обучение группы Detroit Automation Academy начинается 8 марта 2026 года в Youth STEM Lab, The Station @ Michigan Central.*
