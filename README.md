# ✈️ AI Travel Planner Smart Guide

A full-stack AI-powered travel planning application that generates personalized, day-wise itineraries using **NVIDIA NIM API** (Llama 3.1 405B), with real-time weather data, smart recommendations, and a beautiful React frontend.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb&logoColor=white)
![NVIDIA](https://img.shields.io/badge/NVIDIA_NIM-LLM-76B900?logo=nvidia&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Features

- 🤖 **AI Itinerary Generation** — NVIDIA NIM API creates detailed day-wise plans with activities, costs, meals & tips
- 🌤️ **Live Weather** — Real-time weather data & smart travel advice via OpenWeatherMap
- 🔐 **JWT Authentication** — Secure user registration, login & admin roles
- 🗺️ **Destination Explorer** — Search, filter by tags/budget, paginated browsing
- ⭐ **Review System** — Rate & review destinations with image uploads
- 📄 **PDF Export** — Download your itinerary as a formatted PDF
- 🎯 **Smart Recommendations** — Similar destinations based on tags & budget
- 📊 **Admin Dashboard** — Destination CRUD, review moderation, analytics
- 💰 **Budget Warnings** — AI alerts when plans exceed budget
- 🖼️ **GridFS Image Storage** — All images stored directly in MongoDB

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Python Flask, REST API |
| Database | MongoDB + GridFS |
| AI | NVIDIA NIM API (Llama 3.1 405B) |
| Auth | JWT + bcrypt |
| Weather | OpenWeatherMap API |
| PDF | ReportLab |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **MongoDB** running on `localhost:27017`
- [NVIDIA NIM API Key](https://build.nvidia.com/meta/llama-3_1-405b/api)
- [OpenWeatherMap API Key](https://openweathermap.org/api)

### 1. Clone the Repository

```bash
git clone https://github.com/ShoyebChaudhari45/Ai-travel-planner-.git
cd Ai-travel-planner-
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
python app.py
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 5. Default Admin Login

```
Email: admin@travelplanner.com
Password: admin123
```

---

## 📁 Project Structure

```
├── backend/
│   ├── app.py              # Flask entry point
│   ├── config.py           # Environment config
│   ├── models/             # MongoDB models (user, destination, review, itinerary, analytics)
│   ├── routes/             # API routes (auth, destinations, reviews, itinerary, weather, admin)
│   ├── services/           # NVIDIA NIM / Gemini AI, Weather, GridFS, Recommendation
│   └── utils/              # JWT auth, validators
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, DestinationCard, WeatherWidget, etc.
│   │   ├── pages/          # Home, Explore, PlanTrip, ItineraryView, Admin, etc.
│   │   ├── services/       # Axios API service
│   │   └── context/        # Auth state management
│   └── index.html
└── documentation/
    └── report.html         # Full project documentation
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `NVIDIA_API_KEY` | NVIDIA NIM API key |
| `GEMINI_API_KEY` | Google Gemini API key (optional fallback) |
| `WEATHER_API_KEY` | OpenWeatherMap API key |
| `MONGO_URI` | MongoDB connection string |
| `SECRET_KEY` | Flask secret key |
| `JWT_SECRET_KEY` | JWT signing secret |

---

## 📸 Pages

| Page | Description |
|------|-------------|
| **Home** | Hero section, features, featured destinations, CTA |
| **Explore** | Search, tag/budget filters, paginated destination grid |
| **Destination Detail** | Hero image, weather, reviews, gallery, similar destinations |
| **Plan Trip** | AI planner form with interests, budget, preferences |
| **Itinerary View** | Day-wise timeline with activities, meals, costs, PDF download |
| **Admin Dashboard** | Stats, destination CRUD, review moderation, analytics |

---

## 📜 License

This project is for educational purposes.

---

<p align="center">Built with ❤️ using React, Flask, MongoDB & NVIDIA NIM API</p>
