
---

# 📓 Journo – Trading Journal & Analytics App

Journo is a trading journal application that helps traders log trades, track performance, and analyze trading behavior.
It supports **realized P\&L tracking, win rate calculation, risk management insights, and wallet management**, giving traders the tools they need to improve consistency.

---

## 🚀 Features

* 📊 **Trade Analytics**

  * Total trades, win rate, P\&L breakdown, net profit.
  * Average win/loss & R\:R ratios (configurable).

* 💰 **Wallet Management**

  * Multiple trading wallets.
  * Tracks balance in different currencies.

* 📝 **Trade Logging**

  * Record entry, stop loss, take profit, lot size, and asset.
  * Tracks both open and closed trades.

* 🔍 **Performance Tracking**

  * Tracks trade outcomes (`won`, `loss`, `breakeven`).
  * Monitors realized returns (`performance.totalReturn`).

* 🔒 **Authentication & Security**

  * User-based trade history.
  * JWT authentication for secure API access.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM)
* **Frontend**: React for Web App and  React Native for mobile Apps
* **Authentication**: JWT
* **Other**: TailwindCSS, Redux Toolkit, Axios

---

## 📂 Project Structure

```bash
journo-app/
│── backend/               # Express + MongoDB backend
│   ├── models/            # Trade, Wallet, User schemas
│   ├── routes/            # API endpoints
│   ├── controllers/       # Trade & analytics logic
│   └── services/          # Provider
│
│── frontend/              # React frontend
│   ├── src/components/    # Reusable UI components
│   ├── src/pages/         # Dashboard, Analytics, Trade Form
│   └── src/store/         # Redux slices
│
│── README.md
│── package.json
│── .env.example
```

---

## ⚡ Installation

1. **Clone the repo**

```bash
git clone https://github.com/vulpes231/fs-journo-server.git
cd journo-app
```

2. **Setup backend**

```bash
cd backend
npm install
cp .env.example .env   # add MongoDB URI, JWT secret, etc.
npm run dev
```

3. **Setup frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## 📌 API Endpoints (Examples)

### `GET /api/trades/:userId`

Fetch all trades for a user.

### `POST /api/trades`

Create a new trade.

### `PUT /api/trades/:tradeId`

Edit an existing trade (update SL/TP, etc).

### `GET /api/analytics/:userId`

Fetch trade analytics (P\&L, win rate, etc).

---

## 📊 Example Analytics Response

```json
{
  "totalTrades": 12,
  "totalOpen": 3,
  "totalClosed": 9,
  "totalWins": 6,
  "winRate": 50,
  "totalProfit": 340.25,
  "totalLoss": -120.5,
  "netProfit": 219.75
}
```

---

## 🤝 Contributing

Contributions are welcome!

* Fork the repo
* Create a new branch (`feature/new-feature`)
* Commit your changes
* Open a PR 🚀

---

## 📜 License

MIT License © 2025 – \[Adebayo Olayinka]

---
