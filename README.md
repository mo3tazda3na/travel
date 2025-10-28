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
  package.json            # Express, Knex, and supporting dependencies
  Dockerfile              # Development container definition for the API service
  src/
    app.js                # Express app bootstrap registering routes and middleware
    db/
      knex.js             # Knex configuration bound to environment variables
      migrations/
        202405041200_create_tables.js  # PostgreSQL schema for trips & locations
    models/
      trip.js             # Trip data-access helpers
      location.js         # Location data-access helpers
    routes/
      trips.js            # REST endpoints for listing and creating trips
      locations.js        # REST endpoints for listing and adding locations
  seeds/
    seed-data.js          # Example seed script with Rome, Istanbul, and Barcelona trips
.env.example              # Sample environment variables for local development
docker-compose.yml        # Orchestrates PostgreSQL, Express API, and Next.js web containers
```

Refer to the inline comments in each file for guidance on customization and expansion.
