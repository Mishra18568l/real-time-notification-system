# Pulse — Real-Time Notification Dashboard

React + Vite + Tailwind frontend for the existing Spring Boot notification system.

## Run

1. Keep Docker Compose services and Spring Boot running on port 8080.
2. Stop the old `http-server` running on port 5173 (Ctrl+C).
3. From `frontend`, run `npm install` then `npm run dev`.
4. Open http://127.0.0.1:5173 and sign in using an existing account.

Vite proxies `/api` to Spring Boot, so no backend CORS changes are required. WebSockets connect directly to `ws://localhost:8080/ws` using one-time tickets. Backend must allow the frontend origin `http://127.0.0.1:5173` for WebSocket handshake (already configured during earlier tests).

## Notes

- JWT stored in sessionStorage for this local demo. Never commit secrets.
- Read/unread markers are **browser-local only**, not synchronized with the backend.
- The backend returns the latest 50 notifications; the UI does not claim to provide complete pagination.
- Only the backend can publish events; the frontend has no publish control.
- The frontend never connects to RabbitMQ, PostgreSQL, or Redis directly.
- For production, prefer an HttpOnly-cookie or appropriate BFF auth design and HTTPS/WSS; add persistent read-status APIs, reliable outbox delivery, pagination, and operational monitoring.
