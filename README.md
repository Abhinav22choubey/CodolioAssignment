# Interactive Question Management Sheet

An interactive, single-page question management application inspired by the
[Codolio Striver SDE Sheet](https://codolio.com/question-tracker/sheet/striver-sde-sheet?category=popular).
Questions are organized as topics and sub-topics and can be created, edited,
deleted, filtered, and reordered with drag and drop.

## Project overview

The project is split into two applications:

- **Frontend** - React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query,
  Axios, and `dnd-kit`.
- **Backend** - Node.js, Express, and MongoDB through Mongoose.
- **Data model** - Topics contain sub-topics, and sub-topics contain questions.
- **API** - The backend serves REST endpoints under `http://localhost:5000/api`.

The application supports:

1. Creating, editing, and deleting topics.
2. Creating, editing, and deleting sub-topics under a topic.
3. Creating, editing, and deleting questions under a sub-topic.
4. Reordering topics, sub-topics, and questions by dragging and dropping.
5. Viewing question metadata such as difficulty, platform, and problem links.

## Prerequisites

- Node.js 18 or newer
- npm
- A running MongoDB instance, either local MongoDB or MongoDB Atlas

## Backend setup

Open a terminal in the backend directory:

```bash
cd Backend
npm install
```

Create `Backend/.env` and add the MongoDB connection string:

```env
MONGO_URI=mongodb://127.0.0.1:27017/question-book
PORT=5000
```

For MongoDB Atlas, replace `MONGO_URI` with the Atlas connection string. Do
not commit `.env` or expose the connection string publicly.

Start the backend:

```bash
node src/server.js
```

The API will be available at `http://localhost:5000`. Verify that the backend
is running by opening `http://localhost:5000/api/health`.

## Populate the database

The intended first seed node is:

```text
Backend/src/utils/seedStriver.js
```

After setting `MONGO_URI`, run the seed script from the backend directory when
`seedStriver.js` is present:

```bash
cd Backend
node src/utils/seedStriver.js
```

The seed script should connect to the database configured in `Backend/.env` and
populate it with the initial Striver sheet data. Run it after starting MongoDB
and before opening the frontend. If the seed script is changed or the database
is reset, run the command again to repopulate the initial data.

> **Current repository note:** `Backend/src/utils/seedStriver.js` is not
> included in this checkout yet. The available source-data conversion utility
> is shown below; use it to generate the sheet JSON, or add/open the seed node
> at the path above before running the seed command.

## Frontend setup

Open a second terminal in the frontend directory:

```bash
cd Frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally
`http://localhost:5173`. The frontend is configured to call the backend at
`http://localhost:5000/api`.

Start both applications in this order:

1. Start MongoDB.
2. Configure `Backend/.env`.
3. Run the seed script.
4. Start the backend with `node src/server.js`.
5. Start the frontend with `npm run dev`.

## Useful commands

### Backend

```bash
cd Backend
npm install
node src/server.js
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Repository structure

```text
.
├── Backend
│   └── src
│       ├── config          # MongoDB connection
│       ├── controllers     # Topic, sub-topic, and question operations
│       ├── data            # Source/sample sheet data
│       ├── models          # Mongoose models
│       ├── routes          # REST API routes
│       └── utils           # Seed and data conversion utilities
└── Frontend
    └── src
        ├── api             # Axios API clients
        ├── components      # Layout, sheet, topic, and question UI
        ├── hooks           # React Query data hooks
        ├── store            # UI state
        └── types           # TypeScript domain types
```

## API route groups

- `/api/topics` - list and manage topics
- `/api/topics/:topicId/subtopics` - manage sub-topics
- `/api/subtopics/:subTopicId/questions` - manage questions
- `/api/health` - backend health check

## Sample data

The backend includes the source data in `Backend/src/data` for the initial
sheet. The conversion utility can transform the Codolio response into the
sheet structure used by the application:

```bash
cd Backend
node src/utils/convertCodolioData.js
```

## Assignment context

This project implements the Interactive Question Management Sheet assignment:
a clean single-page experience for hierarchical question management with API
integration, persistent MongoDB storage, and drag-and-drop ordering. The UI
design is intentionally independent while using the Codolio sheet as a
functional reference.
