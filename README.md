# Fintellix — Intelligent Financial Operating System

Fintellix is a modern, high-performance financial management platform that combines real-time expense tracking with AI-powered fraud detection and advanced stock market analysis. Built for the modern web with Next.js 16, it provides a seamless, secure, and intelligent experience for managing your personal finances.

## ✨ Key Features

### 🛡️ AI-Powered Fraud Detection
- **Real-Time Analysis**: Every transaction is instantly analyzed by an XGBoost machine learning model.
- **Predictive Scoring**: Detects suspicious patterns using 30+ transaction features.
- **Instant Alerts**: WebSocket-powered (Pusher) notifications when fraud is detected.

### 📈 Stock Studio
- **Portfolio Management**: Track your stock holdings with live market values.
- **Interactive Charts**: Beautiful, responsive price and volume charts powered by Recharts.
- **Stock Deep Dive**: In-depth analysis of individual tickers with historical performance and current metrics.

### 🔮 AI Stock Forecast
- **Predictive Modeling**: 7-day price forecasts using dynamic XGBoost training on historical data.
- **Deep Insights**: Combines technical indicators with ML to help inform investment decisions.

### 💸 Financial Hub
- **Expense Tracking**: Categorize spending with merchant and location metadata.
- **Live Dashboard**: A unified view of your net worth, recent activity, and market status.
- **Multi-Device Sync**: Instant updates across all devices via real-time data streaming.

## 🛠️ Technology Stack

### Frontend & Core
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend & Database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [Neon DB](https://neon.tech/) (PostgreSQL)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Real-Time**: [Pusher](https://pusher.com/)
- **Rate Limiting**: [Upstash Redis](https://upstash.com/)
- **Emails**: [Resend](https://resend.com/)

### Data APIs
- **Finance**: [Alpha Vantage](https://www.alphavantage.co/) & ML Proxy (yfinance)
- **AI**: [Google Gemini AI SDK](https://sdk.vercel.ai/)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- A Neon PostgreSQL database
- API Keys: Alpha Vantage, Pusher, Upstash Redis, Resend, Google Gemini

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL=your_neon_url

# Auth
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000

# APIs
ALPHA_VANTAGE_API_KEY=your_key
GOOGLE_GENERATIVE_AI_API_KEY=your_key

# Real-time
NEXT_PUBLIC_PUSHER_APP_KEY=your_key
PUSHER_APP_ID=your_id
PUSHER_SECRET=your_secret

# ML Model
ML_API_URL=http://localhost:8000 # Local or Render URL
```

### 4. Development
```bash
npm run dev
```

## 🏗 Architecture
Fintellix follows a hybrid architecture where the **Next.js Client** handles the UI, Auth, and Database operations, while a dedicated **Python ML Service** handles heavy computational tasks like fraud detection and stock forecasting. This separation ensures high performance and scalability.
