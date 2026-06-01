# DECISIONS.md

# Architectural Decisions — Real-Time Bidding Platform

This document explains the key architectural and engineering decisions made during the design of the Real-Time Bidding Platform backend.

---

# 1. Why PostgreSQL Was Chosen

PostgreSQL is used as the primary database because the platform requires:

- transactional consistency
- relational integrity
- reliable bid history
- strong support for concurrent writes

Auction systems are highly transactional. Every bid must be stored reliably and consistently.

PostgreSQL provides:
- ACID compliance
- foreign key constraints
- indexing support
- strong concurrency handling

This makes it suitable for storing:
- users
- auctions
- bids
- auction state

---

# 2. Why Redis Was Added

Redis is used as a high-performance realtime layer on top of PostgreSQL.

PostgreSQL remains the source of truth, while Redis is responsible for:
- realtime leaderboard updates
- pub/sub event broadcasting
- fast in-memory operations

Redis was chosen because auction systems require extremely low-latency updates during active bidding.

---

# 3. Why Redis Sorted Sets Were Used for the Leaderboard

Redis Sorted Sets (`ZSET`) are used to maintain the active auction leaderboard.

Example:

```text
ZADD auction_leaderboard 1200 auction_123
```

Where:
- `1200` is the current highest bid
- `auction_123` is the auction identifier

---

## Benefits of Sorted Sets

### Fast Ranking Operations

Redis Sorted Sets provide:
- O(log N) insertion
- O(log N) updates
- efficient top-N retrieval

This allows the system to quickly display:
- highest bidding auctions
- trending auctions
- realtime ranking updates

---

## Efficient Realtime Reads

Leaderboard reads happen much more frequently than writes.

Using Redis prevents expensive SQL aggregation queries such as:

```sql
SELECT MAX(amount)
FROM bids
GROUP BY auction_id;
```

This improves performance during heavy bidding activity.

---

# 4. Why Current Price Is Stored in the Auctions Table

The current highest bid is denormalized into:

```text
auctions.current_price
```

instead of calculating it from the bids table every time.

This decision was made because:
- auction pages require frequent realtime reads
- calculating MAX(bid.amount) repeatedly is expensive
- realtime systems prioritize read performance

The bids table still stores the complete bidding history.

---

# 5. Why Bids Are Immutable

Bids cannot be edited or deleted after creation.

This decision was made because auction systems require:
- auditability
- fairness
- historical integrity
- fraud prevention

Each bid becomes part of the permanent auction history.

Because of this:
- PUT/PATCH endpoints for bids are not supported
- DELETE endpoints for bids are not supported

---

# 6. Why PATCH Was Used Instead of PUT

PATCH is used for auction updates because auctions only support partial modifications.

Examples:
- updating title
- changing reserve price
- extending end time

Using PUT would require full resource replacement, which is unnecessary and potentially unsafe for auction systems.

PATCH also better supports:
- state-dependent business rules
- partial updates
- controlled modifications

---

# 7. Why Auctions Are Cancelled Instead of Deleted

Auctions are not physically deleted from the database.

Instead, auctions use a lifecycle status:

```text
scheduled → active → closed → cancelled
```

This preserves:
- bidding history
- audit trails
- historical analytics

Deleting auction records would break transactional history and reduce system integrity.

---

# 8. Why WebSockets Were Chosen

WebSockets are used to provide realtime bid updates to connected clients.

Auction platforms require:
- live bid updates
- countdown timers
- instant outbid notifications

Traditional HTTP polling would create:
- unnecessary server load
- increased latency
- delayed updates

WebSockets allow persistent bidirectional communication between the client and server.

---

# 9. Why Redis Pub/Sub Was Used with WebSockets

Redis Pub/Sub is used as the messaging layer underneath WebSocket connections.

Each auction has its own Redis channel:

```text
auction:{auction_id}
```

When a new bid is placed:
1. the bid is stored in PostgreSQL
2. Redis publishes a NEW_BID event
3. all WebSocket subscribers receive the event instantly

---

## Why Pub/Sub Is Necessary

Without Redis Pub/Sub:
- websocket connections would only exist inside a single server instance
- multiple backend instances would not share realtime events

Redis acts as a centralized event bus between all application instances.

This architecture enables horizontal scalability and mirrors the design used in realtime auction systems such as eBay.

---

# 10. Why Rate Limiting Is Applied to Bid Placement

Rate limiting is applied specifically to the bid placement endpoint.

Purpose:
- prevent spam bidding
- reduce abuse
- avoid accidental rapid-fire requests
- protect the system during high traffic

Auction systems are particularly sensitive to bid flooding attacks.

---

# 11. Why JWT Authentication Was Chosen

JWT authentication is used because it is:
- stateless
- scalable
- easy to integrate with frontend clients
- widely used in modern APIs

JWT allows secure authentication without storing session state on the backend server.

---

# 12. Why FastAPI Was Chosen

FastAPI was selected because it provides:
- high performance
- automatic OpenAPI documentation
- native async support
- strong Pydantic validation
- excellent WebSocket support

These features make it well-suited for realtime backend systems.

---

# 13. Two-Factor Authentication

## Why is TOTP preferred over SMS-based OTP for your application?

SMS-based OTP was rejected for three reasons:

- **Cost**: The sending of the SMS involves the use of an additional paid service from a third party such as Twilio or AWS SNS. With TOTP, there is no need for any additional services.
- **SIM swapping**: An attacker is capable of contacting the cellular network, impersonating the target individual, and getting their phone number assigned to another SIM card. In effect, this will render SMS 2FA useless.
- **Phone number not needed**: TOTP does not necessitate the use of a phone number, just an authenticator application on the user's smartphone.

TOTP does not need to pay any fees; it is more secure and needs no infrastructure other than the shared secret that is stored in the database.

## How do you store the user's TOTP secret in the database? Is it encrypted? Why or why not?

The TOTP secret is stored in the `two_factor_secret` field of the `users` table in Base32 format.

When running this system in production, the TOTP secret would have to be stored in an encrypted way in the database using a key different from the database (such as with AES-256 with a key from the environment or AWS Secrets Manager/HashiCorp Vault). Currently, the secret is stored unencrypted, which is okay in the development phase but will need to be solved before production use.

## What happens if a user loses their phone/uninstalls the authenticator app? What recovery mechanism would you implement in a production version?
Currently, in case a person cannot use the authenticator application for any reason, he/she will not be able to log into the system. In the real world scenario, the following recovery options should be available:

- **Recovery codes** - one-time recovery codes provided only during the initial set up of two-factor authentication and viewed by a user once. These codes may be used in place of the TOTP code.
- **Admin recovery** - a helpdesk mechanism involving confirmation of the user’s identity via e-mail or identification documents and subsequent disabling of 2FA by an admin.

## What is valid_window=1 in pyotp and why is it necessary?

`valid_window=1` means that the server considers the code sent from the current 30 seconds window along with the code from one window in the past and one in the future (tolerance period of ±30 seconds).

Such an approach is essential due to the fact that the clocks in the user's device and in the server cannot be synchronized perfectly. The system would refuse to accept codes sent by users with slightly delayed or ahead clocks in case if the check was conducted in a strict way.

