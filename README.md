# Real-Time Notification System (Spring Boot + RabbitMQ + Redis + PostgreSQL)

## What it does
A REST API accepts events, RabbitMQ buffers them, a consumer persists one notification per event ID, and Redis Pub/Sub broadcasts the saved notification to WebSocket gateway instances. Browser clients receive real-time messages and can reload their last 50 notifications.

## Requirements
Java 17+, Maven 3.9+, Docker with Compose.

## Run
1. `docker compose up -d`
2. `mvn spring-boot:run`
3. Open `http://localhost:8080` and click **Connect** (user `alice`).
4. Click **Send notification** and see a message appear.
5. Open RabbitMQ management at `http://localhost:15672` (guest/guest).

## API
`POST /api/events` with:
```json
{"eventId":"e91c38d2-a01c-4b9c-93b2-b79d46d7cb8b","userId":"alice","type":"ORDER_UPDATE","message":"Your order is ready","attempt":0}
```
Returns HTTP 202 (queued, **not** delivered). Re-send the same `eventId` to test deduplication.

`GET /api/users/alice/notifications` returns the most recent 50 records.

`ws://localhost:8080/ws?userId=alice` subscribes to live notifications.

## Event flow
REST -> RabbitMQ topic exchange -> main queue -> consumer -> PostgreSQL unique event_id -> Redis cache -> Redis Pub/Sub -> all gateway instances -> local WebSocket sessions.

## Retries
On worker exceptions, publish a new message to retry exchange. Retry queues have TTLs of 5, 30, 120 seconds, then dead-letter back to main. After three retry attempts, send to `notify.dead.queue`. View queue depths in RabbitMQ UI.

## Multi-node demo
Run a second app with `PORT=8081 mvn spring-boot:run` in another terminal. Connect browser to 8080 and 8081. Both nodes subscribe to the same Redis Pub/Sub channel; each sends only to its locally connected sessions. For real deployments, add a load balancer and shared authentication.

## Important limitations / production hardening
- **This is a learning/demo project, not production-secure.** The REST endpoints and WebSocket `userId` query are unauthenticated; anyone can impersonate a user. Implement Spring Security + JWT, derive identity from the verified principal, enforce authorization and CORS/origin restrictions.
- `rabbit.convertAndSend` does not by itself confirm broker acceptance. Implement correlated publisher confirms, returns, and an outbox for durable business-event publication.
- Failure republishing and acknowledging the original are not atomic. A crash between them can lose an event. Use publisher confirms + manual acknowledgement or a transactional outbox/inbox strategy.
- DB insert and Redis publish are not atomic. A crash after DB commit before Redis publish may prevent live push. Persist an outbox entry in the DB transaction and dispatch separately; clients can still recover using history API.
- Redis `hasKey` then DB insert is not an atomic lock; database unique constraint is the true deduplication safeguard. Cache TTL is an optimization.
- Retry delay queues are shared and TTL-based; use appropriately configured RabbitMQ delayed messaging for richer scheduling.
- `ddl-auto: update` is for development only; use Flyway/Liquibase migrations.
- Add pagination, rate limiting, metrics/tracing, alerting, retention policy, consumer concurrency tuning, integration tests with Testcontainers, and TLS.
- RabbitMQ durable queues alone are insufficient to promise end-to-end at-least-once guarantees. Durable publish confirmation, failure-safe consumer acknowledgements, and durable recovery mechanisms are necessary.

