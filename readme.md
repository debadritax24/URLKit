# URLKit

Production-grade URL shortener built with Node.js, Express, and MongoDB Atlas.

## Quick Start

```bash
npm install
cp .env.example .env   # add your MongoDB Atlas URI
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run check` | Lint + validate |

## API

### `POST /api/shorten`

```json
{ "url": "https://example.com" }
```

Response:

```json
{
  "shortUrl": "http://localhost:3000/Ab12Cd",
  "shortCode": "Ab12Cd",
  "originalUrl": "https://example.com"
}
```

### `GET /api/stats/:shortCode`

Returns click count and metadata for a short URL.

### `GET /:shortCode`

302 redirect to the original URL.

### `GET /health`

Returns `{ "status": "ok" }`.

## Project Structure

```
src/
  config/         - App config, DB connection
  middleware/      - Error handling, validation, rate limiting
  models/          - Mongoose schemas
  routes/          - Express route handlers
  utils/           - Logger, helpers
  app.js           - Express app setup
  server.js        - Entry point, graceful shutdown
public/            - Static frontend assets
```

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `MONGODB_URI` | Yes | - |
| `PORT` | No | 3000 |
| `NODE_ENV` | No | development |
