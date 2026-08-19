<<<<<<< HEAD
<div align="center">

# 🇮🇳 FormSahay

### AI-Powered Assistant for Government Forms, Scholarships & Welfare Schemes

Transforming complex government paperwork into a simple, intelligent and guided experience.

<br>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)
![OCR](https://img.shields.io/badge/PaddleOCR-Fast-red?style=for-the-badge)

<br>

![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-v1.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

</div>

---

## 🚀 Why FormSahay?

Every year millions of citizens lose opportunities because government forms are difficult to understand.

FormSahay acts as an intelligent AI assistant that helps users:

✅ Understand government notices

✅ Check scheme eligibility

✅ Verify required documents

✅ Detect missing certificates

✅ Track important deadlines

✅ Discover welfare opportunities

---

## ✨ Core Features

| Feature | Description |
|----------|------------|
| 📄 AI Notice Analysis | Extract eligibility, deadlines and required documents |
| 🎯 Eligibility Engine | Check scholarship and scheme eligibility |
| 📂 Document Validator | Verify uploaded certificates |
| 🧠 AI Explanation Engine | Convert complex government language into simple English |
| ⏰ Deadline Tracking | Never miss applications and renewals |
| 🔍 Scheme Discovery | Discover matching schemes automatically |

---

## 📸 Preview

### Landing Page

<p align="center">
<img src="./screenshots/homepage.png" width="100%">
</p>

### AI Analysis Dashboard

<p align="center">
<img src="./screenshots/dashboard.png" width="100%">
</p>

---

## 🏗 Architecture

```text
User Upload
    │
    ▼
PaddleOCR
    │
    ▼
Groq AI Engine
    │
    ▼
Eligibility Analyzer
    │
    ▼
Document Validator
    │
    ▼
Scheme Recommendation Engine
    │
    ▼
Citizen Dashboard
=======
# FormSahay Portal

FormSahay Portal is a full-stack, AI-powered government form and scholarship helper. It assists citizens in analyzing official welfare schemes, verifying their eligibility, and validating their documents (like Aadhaar, Domicile, and Income Certificates) using OCR and Large Language Models.

---

## 📂 Repository Structure

The project is structured as a monorepo with completely independent frontend and backend services:

```text
FormSahay_Portal/
├── frontend/             # React (Vite) Single Page Application
├── backend/              # Node.js Express API Server
├── README.md             # Root documentation (this file)
└── .gitignore            # Root Git ignore configuration
>>>>>>> fixed vercel deploy issue
```

---

<<<<<<< HEAD
## ⚡ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express.js

### AI

- Groq API
- DeepSeek R1
- Llama Models

### OCR

- PaddleOCR

### Database

- MongoDB Atlas

### Deployment

- Vercel
- Render

---

## 🔄 User Workflow

```mermaid
flowchart LR

A[Upload Notice] --> B[OCR Extraction]
B --> C[AI Analysis]
C --> D[Eligibility Check]
D --> E[Document Validation]
E --> F[Scheme Discovery]
F --> G[Results Dashboard]
```

---

## 🌟 Future Roadmap

- Multi-language support
- Aadhaar based verification
- Real-time government scheme updates
- WhatsApp integration
- Mobile application
- Voice assistant for rural users

---

## 🤝 Contributing

Contributions are welcome.

```bash
git clone https://github.com/B2Aryan/FormSahay_Portal.git
cd FormSahay_Portal
npm install
=======
## 🛠️ Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS & Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM (V7)
- **Build Tool**: Vite

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB (via Mongoose) with a local JSON Database fallback (`db_fallback.json`) for seamless offline development
- **AI Integration**: Groq SDK (DeepSeek R1 / LLaMA models)
- **OCR Engine**: Tesseract.js
- **PDF Parser**: pdf-parse

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

Clone the repository and install dependencies in the root, frontend, and backend folders:

```bash
# Install root boot dependencies (concurrently)
npm install

# Install frontend dependencies
npm install --prefix frontend

# Install backend dependencies
npm install --prefix backend
```

### Running Locally

#### 1. Concurrent Mode (Recommended for development)
To run both the frontend and backend concurrently with a single command from the root:
```bash
npm run dev
```
- Frontend will be available at: [http://localhost:5173](http://localhost:5173)
- Backend API will run at: [http://localhost:5000](http://localhost:5000)

#### 2. Running Independently
If you want to run the services separately:

**Start Backend Server:**
```bash
cd backend
npm run dev   # Runs with nodemon
# or
npm start     # Runs with node
```

**Start Frontend Server:**
```bash
cd frontend
>>>>>>> fixed vercel deploy issue
npm run dev
```

---

<<<<<<< HEAD
## 📜 License

MIT License

---

<div align="center">

### 🇮🇳 Building a Smarter Bridge Between Citizens and Government Services

### FormSahay — Understand • Verify • Apply

⭐ Star the repository if you find it useful

</div>
=======
## ⚙️ Environment Variables

Copy or create `.env` files inside the respective service folders:

### Backend (`backend/.env`)
Create a `backend/.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri # Leave empty to activate JSON Fallback Mode
GROQ_API_KEY=your_groq_api_key          # Leave empty to activate Smart AI Simulator
ALLOWED_ORIGINS=http://localhost:5173   # Comma-separated list of allowed frontend origins (CORS)
NODE_ENV=development
```

### Frontend (`frontend/.env`)
Create a `frontend/.env` file with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Production Deployment
 
### Frontend (Vercel)
The frontend is optimized for deployment on Vercel:
1. Set the **Root Directory** to `frontend`.
2. Vercel will automatically detect **Vite** as the framework.
3. The default build command (`npm run build`) and output directory (`dist`) are pre-configured.
4. Client-side routing is handled via `frontend/vercel.json` to prevent 404 errors on deep routes.
5. Set `VITE_API_URL` to point to your deployed backend URL.

### Backend
The backend can be deployed to any Node.js hosting provider (such as Render, Railway, or Heroku):
1. The start script is pre-configured to run `node src/index.js`.
2. Configure your environment variables (`MONGODB_URI`, `GROQ_API_KEY`, etc.) in your host's dashboard.
3. Set `ALLOWED_ORIGINS` to your deployed Vercel frontend URL to permit CORS requests.
>>>>>>> fixed vercel deploy issue
