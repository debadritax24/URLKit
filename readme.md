# URL Shortener

A simple URL Shortener built using Node.js, Express, HTML, CSS and JavaScript.

## Features

- Shorten the  long URLs
- Redirect using the newly generated short URL
- URL Validation
- Copy to Clipboard
- Click Counter (Backend)

## Installation

Install dependencies

```bash
npm install
```

Run the project

```bash
npm start
```

Open

```
http://localhost:3000
```

## API

### POST /api/shorten

```json
{
  "url":"https://example.com"
}
```

Response

```json
{
  "shortUrl":"http://localhost:3000/Ab12Cd"
}
```

### GET /:shortCode

Redirects to the original URL.

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
