# Family Travel Log Prototype

This repository outlines a full-stack prototype for a family travel logging and planning website. It provides a suggested folder structure, example backend and frontend code, and local development tooling using Docker Compose.

## Folder Structure

```
frontend/
  components/
    AddTripForm.jsx       # Client form to add new trips via the API proxy
    MapView.jsx           # Leaflet-powered interactive world map
    TripDetails.jsx       # Sidebar with trip, location, and photo details
    TripList.jsx          # Filterable list of trips
  pages/
    index.jsx             # Landing page that composes map, list, and form
    api/
      locations.js        # Next.js API route proxying location endpoints
      trips/
        [id].js           # API proxy for fetching a single trip with locations
        index.js          # API proxy for listing and creating trips
  package.json            # Next.js + Leaflet dependencies and scripts
  Dockerfile              # Development container definition for the web app
backend/
  package.json            # Express, Objection.js, Knex, and supporting dependencies
  Dockerfile              # Development container definition for the API service
  src/
    app.js                # Express app bootstrap registering routes and middleware
    container.js          # Simple dependency container wiring repositories to use cases
    application/
      use-cases/          # Application services orchestrating domain behavior
    domain/
      entities/           # Trip and Location aggregate roots/value objects
      repositories/       # Repository interfaces describing persistence contracts
    infrastructure/
      database/
        knex.js           # Knex configuration bound to environment variables
        migrations/       # Database schema definitions
      persistence/
        objection/        # Objection.js models and repository implementation
    interfaces/
      http/
        presenters/       # Maps domain entities to JSON responses
        routes/
          v1/             # Versioned Express routers for trips and locations
  seeds/
    seed-data.js          # Example seed script with Rome, Istanbul, and Barcelona trips
.env.example              # Sample environment variables for local development
docker-compose.yml        # Orchestrates PostgreSQL, Express API, and Next.js web containers
```

Refer to the inline comments in each file for guidance on customization and expansion.

## API Versioning

The Express backend exposes versioned REST endpoints beneath `/api/v1` so future breaking changes can ship behind new prefixes. The current surface area is:

- `GET /api/v1/trips` — list all trips with their associated locations ordered by visit date.
- `GET /api/v1/trips/:id` — fetch a single trip (including locations) by identifier.
- `POST /api/v1/trips` — create a new trip record.
- `POST /api/v1/locations` — attach a new location to an existing trip.

## Backend Architecture

The backend follows a lightweight Domain-Driven Design layout:

- **Domain layer** — Entities (`Trip`, `Location`) capture the ubiquitous language and repository interfaces describe the
  operations the domain expects from persistence.
- **Application layer** — Use cases orchestrate domain behavior (listing trips, creating a trip, adding a location) without
  being concerned with technical details.
- **Infrastructure layer** — Objection.js models, Knex configuration, and repository implementations fulfill the domain
  contracts against PostgreSQL.
- **Interfaces layer** — Express routes and presenters translate HTTP requests/responses to and from the domain model while
  exposing versioned REST resources.
- Legacy direct-model routes and Knex helpers have been removed so new features flow exclusively through the DDD
  use cases and repositories, keeping HTTP concerns decoupled from persistence.

## Local Development

The project can be run either entirely through Docker Compose or by starting the backend and frontend manually.

### 1. Configure environment variables

1. Duplicate the sample environment file and adjust any values if necessary:

   ```bash
   cp .env.example .env
   ```

2. When you run the stack with Docker Compose the defaults will work out of the box. If you are running services manually, update `DB_HOST` to point at your local PostgreSQL instance (for example `localhost`).

### 2. Run with Docker Compose (recommended)

1. Build and start the containers. The first startup runs `npm install` in each service to hydrate dependencies inside the containers.

   ```bash
   docker compose up --build
   ```

2. Once the services are up:
   - API: http://localhost:4000 (Express + Objection.js/Knex). Versioned REST base: `/api/v1`.
   - Web: http://localhost:3000 (Next.js frontend)

   The frontend container sends browser requests to `http://localhost:4000` but calls the API container internally via
   `API_BASE_URL=http://api:4000`, which is already configured in `docker-compose.yml`.

3. The API container automatically applies migrations and seed data on boot via the `seed-data.js` script. If you need to re-run them, enter the backend container and execute `npm run migrate` followed by `npm run seed`.

4. Stop the stack when finished:

   ```bash
   docker compose down
   ```

### 3. Run services manually

1. Ensure PostgreSQL is running locally and matches the credentials in your `.env` file. Create the database defined by `DB_NAME` if it does not already exist.

2. Install dependencies:

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Apply database migrations and seed data from the backend directory:

   ```bash
   npm run migrate
   npm run seed
   ```

4. Start the backend API (from `backend/`):

   ```bash
   npm run dev
   ```

5. In a separate terminal start the Next.js frontend (from `frontend/`):

   ```bash
   npm run dev
   ```

6. Visit http://localhost:3000 to use the app. Browser requests are sent to the backend using `NEXT_PUBLIC_API_BASE_URL`. Server-side
   API routes (used by the Add Trip/Location forms) fall back to the same value unless `API_BASE_URL` is defined, which is useful when
   running the frontend inside Docker.
