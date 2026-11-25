# Расписание намазов для приложения «Вақти намоз»

Приложение читает один файл — [`schedules.json`](schedules.json). Сервера нет: файл собирает
GitHub Action (`.github/workflows/namaz.yml`) из месяцев в [`months/`](months).

## Добавить новый месяц

1. Откройте папку [`inbox/`](inbox) на GitHub → **Add file → Upload files**.
2. Загрузите фото или скриншот таблицы (jpg, png, webp) → **Commit changes**.
3. Через 1–2 минуты во вкладке **Actions** появится зелёная галочка: таблица распознана,
   в `months/` появился файл `<первая дата>.json`, `schedules.json` обновлён, скриншот удалён.

Если распознать не удалось, Action станет красным, а скриншот останется в `inbox/` —
загрузите более чёткий и повторите.

## Исправить время вручную

Отредактируйте нужный файл в `months/` прямо на GitHub (иконка карандаша) → Commit.
Action сам пересоберёт `schedules.json`.

## Однократная настройка

Settings → Secrets and variables → Actions → **New repository secret**:
`ANTHROPIC_API_KEY` = ключ Anthropic API (нужен только для распознавания скриншотов).
