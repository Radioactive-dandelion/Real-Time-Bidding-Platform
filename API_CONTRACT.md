# API Contract - Real-Time Bidding Platform

## Base URL

```http
/api/v1
```

---

# Authentication

Authentication is handled using JWT Bearer Tokens.

---

# Auction Status Lifecycle

```text
scheduled → active → closed
```

---

# Authentication Endpoints

## Register User

### Endpoint

```http
POST /auth/register
```

### Request Body

```json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "StrongPassword123",
  "alias": "BidMaster"
}
```

### Response - 201 Created

```json
{
  "id": "uuid",
  "username": "alex",
  "email": "alex@example.com",
  "alias": "BidMaster",
  "created_at": "2026-05-11T12:00:00Z"
}
```

---

## Login

### Endpoint

```http
POST /auth/login
```

### Request Body

```json
{
  "email": "alex@example.com",
  "password": "StrongPassword123"
}
```

### Response - 200 OK

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

---

# Auction Endpoints

## Create Auction

### Endpoint

```http
POST /auctions
```

### Authentication Required?

Yes

### Request Body

```json
{
  "title": "RTX 4090",
  "description": "Brand new GPU",
  "starting_price": 500,
  "reserve_price": 800,
  "start_time": "2026-05-15T10:00:00Z",
  "end_time": "2026-05-15T18:00:00Z"
}
```

### Response - 201 Created

```json
{
  "id": "auction_uuid",
  "seller_id": "user_uuid",
  "status": "scheduled",
  "current_price": 500
}
```

---

## Get All Auctions

### Endpoint

```http
GET /auctions
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| status | string | active / scheduled / closed |
| limit | integer | pagination limit |
| offset | integer | pagination offset |

### Response - 200 OK

```json
[
  {
    "id": "auction_uuid",
    "title": "RTX 4090",
    "current_price": 750,
    "status": "active",
    "end_time": "2026-05-15T18:00:00Z"
  }
]
```

---

## Get Auction By ID

### Endpoint

```http
GET /auctions/{auction_id}
```

### Response - 200 OK

```json
{
  "id": "auction_uuid",
  "title": "RTX 4090",
  "description": "Brand new GPU",
  "starting_price": 500,
  "reserve_price": 800,
  "current_price": 750,
  "status": "active",
  "seller": {
    "id": "user_uuid",
    "alias": "Seller123"
  },
  "end_time": "2026-05-15T18:00:00Z"
}
```

---

# Bid Endpoints

## Place Bid

### Endpoint

```http
POST /auctions/{auction_id}/bids
```

### Authentication Required?

Yes

### Rate Limited?

Yes

### Request Body

```json
{
  "amount": 900
}
```

### Validation Rules

- Bid must be higher than current highest bid
- Auction must be active
- Auction must not be closed
- Seller cannot bid on own auction

### Response - 201 Created

```json
{
  "id": "bid_uuid",
  "auction_id": "auction_uuid",
  "bidder_alias": "BidMaster",
  "amount": 900,
  "created_at": "2026-05-15T12:00:00Z"
}
```

---

## Get Auction Bids

### Endpoint

```http
GET /auctions/{auction_id}/bids
```

### Response - 200 OK

```json
[
  {
    "bidder_alias": "BidMaster",
    "amount": 900,
    "created_at": "2026-05-15T12:00:00Z"
  }
]
```

---

# Leaderboard Endpoints

## Get Active Auction Leaderboard

### Endpoint

```http
GET /leaderboard
```

### Response - 200 OK

```json
[
  {
    "auction_id": "auction_uuid",
    "title": "RTX 4090",
    "current_price": 1200
  }
]
```

---

# WebSocket API

## WebSocket Connection

```text
ws://localhost:8000/ws/auctions/{auction_id}
```

---

## Event: NEW_BID

### Payload

```json
{
  "event": "NEW_BID",
  "auction_id": "auction_uuid",
  "highest_bid": 950,
  "bidder_alias": "Alex",
  "time_remaining": 320
}
```

---

## Event: AUCTION_CLOSED

### Payload

```json
{
  "event": "AUCTION_CLOSED",
  "auction_id": "auction_uuid",
  "winner_alias": "Alex",
  "winning_bid": 1200
}
```

---

# Error Responses

## 400 Bad Request

```json
{
  "detail": "Bid amount must be higher than current price"
}
```

---

## 401 Unauthorized

```json
{
  "detail": "Authentication required"
}
```

---

## 403 Forbidden

```json
{
  "detail": "You cannot bid on your own auction"
}
```

---

## 404 Not Found

```json
{
  "detail": "Auction not found"
}
```

---

## 429 Too Many Requests

```json
{
  "detail": "Rate limit exceeded"
}
```

---

# Redis Usage

## Redis Sorted Set

```text
auction_leaderboard
```

Used for:
- active auction leaderboard
- sorting auctions by highest bid

---

## Redis Pub/Sub Channels

```text
auction:{auction_id}
```

Used for:
- real-time bid broadcasting
- WebSocket synchronization across multiple server instances


# Update Auction

## Endpoint

```http
PATCH /auctions/{auction_id}
```

### Authentication Required?

Yes

---

## Description

Allows the seller to partially update an auction before it becomes active.

---

## Rules

- Only the seller can update the auction
- Only scheduled auctions can be updated
- Active or closed auctions cannot be modified

---

## Request Body

```json
{
  "title": "Updated RTX 4090",
  "description": "Like new condition",
  "reserve_price": 900,
  "end_time": "2026-05-15T20:00:00Z"
}
```

---

## Response - 200 OK

```json
{
  "id": "auction_uuid",
  "title": "Updated RTX 4090",
  "description": "Like new condition",
  "reserve_price": 900,
  "status": "scheduled",
  "updated_at": "2026-05-11T15:00:00Z"
}
```

---

# Cancel Auction

## Endpoint

```http
PATCH /auctions/{auction_id}/cancel
```

### Authentication Required?

Yes

---

## Description

Allows the seller to cancel an auction before it closes.

---

## Rules

- Only the seller can cancel the auction
- Closed auctions cannot be cancelled
- Auctions with active bids cannot be cancelled

---

## Response - 200 OK

```json
{
  "message": "Auction cancelled successfully"
}
```

---

## Response - 403 Forbidden

```json
{
  "detail": "You are not allowed to cancel this auction"
}
```

---

## Response - 409 Conflict

```json
{
  "detail": "Auction with active bids cannot be cancelled"
}
```