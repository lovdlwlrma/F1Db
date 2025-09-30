# F1Db

F1Db is a full-stack web application for managing and visualizing Formula 1 data. It features a Go backend and a modern React (Vite + TypeScript + Tailwind CSS) frontend, supporting analytics, telemetry, and race schedule management.

## Features

- **Backend (Go):**
  - RESTful API for F1 data (races, schedules, analytics, telemetry, etc.)
  - Database support: PostgreSQL, Cassandra
  - Pub/Sub, logging, middleware, and service layers
  - Dockerized for easy deployment
  - Swagger/OpenAPI documentation

- **Frontend (React + Vite):**
  - Modern UI with Tailwind CSS
  - Analytics dashboards and telemetry visualization
  - Authentication and registration flows
  - Responsive layouts and reusable components

## Project Structure

```
F1Db/
├── backend/         # Go backend (API, services, configs, docs, migrations)
├── frontend/        # React frontend (src, public, components, pages, styles)
├── note/            # Project notes and documentation
├── LICENSE
├── Makefile
└── README           # Project overview and instructions
```

## Getting Started

### Prerequisites
- Go 1.20+
- Node.js 18+
- Docker (optional, for containerized deployment)
- PostgreSQL and/or Cassandra (for database)

### Quick Start

1. `cd F1Db`
2. Start the Server
    ```
    make qs
    ```

### Backend Setup
1. `cd backend`
2. Copy `config.yaml.example` to `config.yaml` and edit as needed
3. Run database migrations:
   ```sh
   make migrate
   ```
4. Start the server:
   ```sh
   make run
   ```
   Or with Docker:
   ```sh
   docker-compose up --build
   ```

### Frontend Setup
1. `cd frontend`
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## API Documentation
- Swagger UI: [backend/docs/swagger.yaml](backend/docs/swagger.yaml)
- See `backend/docs/` for more details

## Contributing
1. Fork the repo and create your branch
2. Commit your changes
3. Open a pull request

## License
This project is licensed under the MIT License.

## Acknowledgements
- Go, React, Vite, Tailwind CSS
- PostgreSQL, Cassandra
- Docker, Swagger
