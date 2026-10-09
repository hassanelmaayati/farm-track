
# FarmTrack

[![Live Demo](https://img.shields.io/badge/Live_Demo-FarmTrack-brightgreen?style=for-the-badge&logo=render)](https://farmtrack-36ld.onrender.com/)


FarmTrack is a farm management web app that lets farmers organize their animals into structures (barns, stables, coops, etc.) and keep a history log for each animal, tracking health status, sales, and other events over time. Built as a MERN stack app: a React (Vite + Tailwind CSS) single-page frontend talking to an Express REST API backed by MongoDB, with JWT authentication in an HTTP-only cookie. Each user only has access to their own farm data.

> Version 2 migrated the original MEN/EJS app to MERN. The screenshots below show the original EJS interface.
## ScreenShots

<img width="1917" height="876" alt="Welcome page Screenshots" src="https://github.com/user-attachments/assets/d91c39d7-5063-4ede-b337-866037bc0891" />


<img width="1917" height="862" alt="In the site Screenshots" src="https://github.com/user-attachments/assets/46b71de6-2da2-47b7-ae9d-d41bc0e51301" />




## User Stories

### Auth
- As a guest, I can sign up for an account so I can manage my farm.
- As a guest, I can log in so I can access my saved data.
- As a user, I can log out to end my session.

### Structures
- As a user, I can view a list of all my structures (barns/stables/coops) so I can see my farm layout.
- As a user, I can create a new structure so I can organize my animals.
- As a user, I can view details of a single structure, including the animals inside it.
- As a user, I can edit a structure's info so I can keep it up to date.
- As a user, I can delete a structure so I can remove ones I no longer use.

### Animals
- As a user, I can add a new animal to a structure so I can track it.
- As a user, I can view a list of animals in a structure.
- As a user, I can view a single animal's details, including its log history.
- As a user, I can edit an animal's info (species, breed, status, etc.) so I can keep records accurate.
- As a user, I can delete an animal so I can remove it from my farm.

### Log Entries
- As a user, I can add a log entry to an animal (e.g. vet visit, sold, died) so I can track its history.
- As a user, I can view all log entries for an animal.
- As a user, I can edit a log entry so I can correct mistakes.
- As a user, I can delete a log entry so I can remove incorrect records.

### Authorization
- As a user, I cannot see or manage another user's structures, animals, or log entries.
- As a guest, I cannot create, edit, or delete any data.

### Analytics, search, bulk actions and export
- As a user, I can see herd population over time, health status and species breakdowns, and revenue vs expenses on a dashboard.
- As a user, I can instantly filter animals by text, health status, species, structure and birthdate range.
- As a user, I can select several animals and move them to another structure or update their health status in one action.
- As a user, I can export animals, history logs and a health report as CSV, or print a clean report.
- As a user, I can switch between light and dark mode.

## ERD

<img width="825" height="650" alt="erd" src="https://github.com/user-attachments/assets/7d3ca613-55fc-4381-a4bd-976f9454ee27" />



## Wireframes
<img width="1392" height="842" alt="wireframe" src="https://github.com/user-attachments/assets/c9ab9aee-aa12-4fc6-b9b9-8ec306570990" />


## Technologies

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, TanStack Query, Recharts, Lucide icons
- **Backend:** Node.js, Express 5, MongoDB / Mongoose, JSON Web Tokens (HTTP-only cookie), bcrypt, helmet, express-rate-limit
- **Tests:** `node:test` with an in-memory MongoDB

## Project structure

```
farm-track/
├── backend/
│   ├── src/
│   │   ├── config/        env + database connection
│   │   ├── models/        User, Structure, Animal, LogEntry
│   │   ├── middleware/    auth (JWT cookie), error handler, id validation, rate limit
│   │   ├── controllers/   auth, structures, animals (+ bulk), logs, analytics, exports
│   │   ├── routes/        one router per resource
│   │   ├── utils/         ownership checks, filters, CSV, helpers
│   │   ├── app.js         Express app
│   │   ├── server.js      entry point
│   │   └── seed.js        demo data
│   └── test/              API tests
└── frontend/
    └── src/
        ├── lib/           api client, constants, formatters
        ├── context/       auth, theme, toasts
        ├── hooks/         TanStack Query hooks, debounce
        ├── components/    ui kit, layout, animals, logs, structures, charts
        └── pages/         Dashboard, Structures, Animals, AnimalDetail, Reports, auth
```

## Getting started

```bash
npm run install:all
cp backend/.env.example backend/.env   # then set MONGODB_URI and JWT_SECRET
npm run seed                           # optional: demo / demo1234 with a year of data
npm run dev:api                        # API on http://localhost:3000
npm run dev:web                        # app on http://localhost:5173 (proxies /api)
npm test                               # backend API tests
```

## REST API

All routes except `/api/auth/signup|login|logout` require the auth cookie. Every query is scoped to the signed-in user, so another user's ids return 404.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup`, `/login`, `/logout` | Session lifecycle |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/structures` | List (with animal counts) / create |
| GET/PUT/DELETE | `/api/structures/:id` | Show with animals / update / delete with cascade |
| GET/POST | `/api/animals` | List with filters (`q`, `status`, `species`, `structure`, `from`, `to`, `dateField`, `sort`, `order`) / create |
| GET/PUT/DELETE | `/api/animals/:id` | Show / update / delete with logs |
| POST | `/api/animals/bulk/move`, `/bulk/status`, `/bulk/delete` | Batch operations on `{ ids, ... }` |
| GET/POST | `/api/animals/:animalId/logs` | An animal's history / add entry |
| GET | `/api/logs` | Recent activity across animals |
| PUT/DELETE | `/api/logs/:id` | Update / delete entry |
| GET | `/api/analytics/summary` | Dashboard totals, trends and distributions |
| GET | `/api/export/animals.csv`, `/logs.csv`, `/health-report.csv` | CSV downloads |

## Future plans

- **Alerts & Reminders:** Set up automated notifications for upcoming vaccinations, routine checkups, or expected births.
- **PDF export** of health reports, and photo attachments per animal.

## References

- Stock photography provided by [Valeria Reverdo](https://unsplash.com/photos/a-herd-of-sheep-grazing-on-a-lush-green-field-yB3YWgyQIk0) via Unsplash.
