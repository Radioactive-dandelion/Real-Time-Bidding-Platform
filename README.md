# Real-Time Bidding Platform

A modern online auction platform where users can create auctions, place bids, and watch prices update live - just like eBay, but built from scratch.

## Try It Live

**Website:** https://real-time-bidding-platform-seven.vercel.app

Create an account, start an auction, and watch bids come in in real time.

---

## What Can You Do?

**As a buyer:**
- Browse active auctions
- Place bids - the price updates instantly for everyone watching
- See the full history of all bids on any auction
- Get notified when an auction ends and a winner is determined

**As a seller:**
- Create an auction with a title, description, starting price, and end time
- Set a reserve price - a minimum price you're willing to accept
- Edit or cancel your auction before it starts
- Archive ended auctions to keep your history clean

**Account security:**
- Protect your account with Two-Factor Authentication (2FA)
- Works with Google Authenticator or any TOTP app
- Every login requires both your password and a 6-digit code from your phone

---

## How Does the Live Bidding Work?

When someone places a bid, every person currently watching that auction sees the new price update immediately - without refreshing the page. This works through a technology called WebSockets, with Redis acting as the messaging layer underneath.

This is the same architecture used by platforms like eBay for their live bidding experience.

---

## What Happens When an Auction Ends?

The platform automatically closes auctions when their time runs out:

- If the highest bid meets or exceeds the **reserve price** → a winner is determined
- If the highest bid is below the reserve price → the auction fails and no sale happens
- All bid history is preserved for transparency

---

## Links

| | |
|--|--|
| Live website | https://real-time-bidding-platform-seven.vercel.app |
| API documentation | https://real-time-bidding-platform-jucm.onrender.com/docs |
| GitHub repository | https://github.com/Radioactive-dandelion/Real-Time-Bidding-Platform |

---

## Built With

| Technology | What it does |
|--|--|
| FastAPI (Python) | Powers the backend - handles all requests, business logic, and security |
| PostgreSQL | Stores all data - users, auctions, bids |
| Redis | Delivers live bid updates to all connected users instantly |
| React + TypeScript | The frontend - what you see in the browser |
| Docker | Packages everything so it runs the same anywhere |
| Render | Hosts the backend in the cloud |
| Vercel | Hosts the frontend in the cloud |

