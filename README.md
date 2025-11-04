# F1DB - Formula 1 Dashboard Application

F1Db is a full-stack web application for managing and visualizing Formula 1 data with a React frontend and Go backend API service.

![Live Timing Dashboard](/frontend/src/assets/livetiming.png)

## Features

### 🏁 Overview
Quick preview of the next Grand Prix including:

- Race weekend schedule (Practice, Qualifying, Race)
- Circuit information and layout
- Key statistics and records

### ⚡ Live Timing
Real-time race information during live sessions:

- Sector times and speed traps
- Lap times and gaps
- Tire strategy and pit stops
- Real-time leaderboard updates via Server-Sent Events (SSE)

### 📈 Telemetry
Advanced driver telemetry data comparison:

- Lap time distribution and consistency
- Speed traces across track segments
- Throttle and brake application
- Gear shifts and DRS usage
- Side-by-side driver comparisons

### 📊 Analytics
Post-race driver performance analysis:

- Race results with podium finishers and championship points
- Line graph tracking driver positions 
- Driver's tire compound choices and pit stop timing
- Official FIA race control messages, penalties, and incident reports

### 🏆 Standings
Annual championship standings and comparisons:

- Driver championship rankings
- Constructor championship rankings
- Driver finish position plots

### 📅 Schedule
Complete annual Grand Prix calendar:

- Full race weekend timetables
- Circuit details and history
- Track maps and statistics
- Session timings in your local timezone
- Past race results at each circuit

## Quick Start

### Prerequisites

#### For Docker Deployment (Recommended):

- Docker
- Docker Compose
- Make (optional, for using Makefile commands)

#### For Local Development:

- Node.js (v20 or higher)
- npm
- Go (v1.24.5 or higher)
- Docker & Docker Compose (optional, for containerized services)

### Starting the Application

```bash
# Clone the repository
git clone <repo-url>
cd F1Db

# Build all services
make compose-build

# Start all services
make compose-up

# Stop all services
make compose-stop

# Stop and remove containers
make compose-down

# Development Servies ( Local server )
make qs
```

### Using Docker Compose Directly
```bash
# Clone the repository
git clone <repo-url>
cd F1Db

# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

## Accessing the Application
Once the application is running, you can access it via:

```
Frontend:       http://localhost/
Backend API:    http://localhost:8080/
```

## Project Structure

```
F1Db/
├── LICENSE
├── MAKEFILE
├── README
├── docker-compose.yml     # Docker Compose configuration
├── frontend/              # Frontend application
│   ├── Dockerfile
│   ├── nginx.conf         # Nginx configuration
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   └── package.json
└── backend/               # Backend application
    ├── Dockerfile
    ├── cmd/
    │   └── main.go        # Main entry point
    ├── internal/
    ├── go.mod
    └── go.sum
```

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- Nginx (Production)

### Backend

- Go
- REST API

## Contributing

1. Fork the repo and create your branch
2. Commit your changes
3. Open a pull request

## License

This project is licensed under the MIT License.