# InterviewCopilot

AI-powered mock interview platform built to help students and job seekers practice interviews, receive structured question sets, and track progress through analytics.

Live Demo: [Add Vercel URL]
Backend API: [Add Render URL]

---

## Overview

InterviewCopilot simulates technical and behavioral interview sessions in a clean web interface.

Users can:

* Create an account
* Log in securely
* Start interview sessions
* Generate interview questions using AI
* Answer questions interactively
* View analytics and performance insights
* Track interview history

Designed as a full-stack deployment project using MERN architecture and external AI integration.

---

## Features

### Authentication

* JWT-based authentication
* Register / Login / Logout
* Protected routes
* Persistent sessions

### Interview Engine

* AI-generated interview questions
* Configurable interview sessions
* Multiple question generation
* Structured interview flow

### Analytics Dashboard

* Session tracking
* Interview history
* Performance summaries
* Progress visibility

### Production Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* MongoDB Atlas cloud database
* Environment-based configuration

---

## Tech Stack

### Frontend

* React
* Vite
* Axios
* React Router

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose

### AI Integration

* Google Gemini API
* Fallback-ready architecture

### Deployment

* Vercel
* Render

---

## Architecture

Frontend (React + Vite)

↓

Backend API (Express)

↓

MongoDB Atlas

↓

AI Question Generation Service

---

## Screenshots

Add screenshots here.

### Landing Page

Insert image

### Dashboard

Insert image

### Interview Session

Insert image

### Analytics

Insert image

---

## Local Setup

Clone repository

```bash
git clone <repo-url>
cd InterviewCopilot
```

Install dependencies

```bash
npm install
cd frontend
npm install
cd ../backend
npm install
```

Create environment files.

Frontend:

```env
VITE_API_URL=
```

Backend:

```env
PORT=
NODE_ENV=
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
CLIENT_ORIGIN=
```

Run locally

```bash
npm run dev
```

---

## Deployment

Frontend:

Vercel

Backend:

Render

Database:

MongoDB Atlas

---

## Future Improvements

* AI feedback scoring
* Resume-based interviews
* Speech input
* Interview recording
* Adaptive question difficulty
* Leaderboards
* Export reports

---

## Challenges Solved

* Frontend ↔ Backend integration
* Production CORS handling
* Environment separation
* SPA deployment routing
* AI response parsing
* Cloud deployment configuration

---

## Author

Anikait Nair

GitHub: https://github.com/nairanikait

LinkedIn: https://www.linkedin.com/in/anikait-nair-4b4487331/
