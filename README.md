# VoteAI 🗳️

**Vote Smart. Vote Right.**

VoteAI is a modern, production-grade Election Assistant Web Application designed to empower Indian voters. Built with cutting-edge web technologies, it simplifies the democratic process by providing personalized guidance, dynamic booth tracking, and intelligent AI chat.

---

## 🌟 Features

- **Personalized Voter Journey**: A gamified, step-by-step onboarding process (Eligibility → Documents → Polling Booth → EVM Education). 
- **Dynamic Polling Booth Locator**: Immersive, interactive Google Maps integration that automatically detects your constituency and state, and dynamically generates the nearest polling booths based on your exact location.
- **Smart AI Election Assistant**: Direct integration with the **Google Generative AI (Gemini 1.5 Flash)** to answer complex questions about voting eligibility, candidate info, EVM usage, and democratic rights.
- **Multilingual Support**: Supports English, Hindi, and Tamil out of the box.
- **Cloud State Synchronization**: A "Local-First" architecture using Zustand and Firebase Firestore that seamlessly synchronizes user profiles and journey progress in real-time across devices.
- **Accessibility (a11y) First**: Fully keyboard navigable, screen-reader friendly (ARIA labels), and optimized with high-contrast `:focus-visible` elements.

## 🛠️ Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Routing**: React Router DOM (v6)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, Glassmorphism, Dark/Light Mode)
- **Mapping**: `@react-google-maps/api`, Google Maps Geocoding API
- **AI & ML**: `@google/generative-ai` (Gemini API)
- **Backend/BaaS**: Firebase Auth, Firebase Firestore
- **Testing**: Vitest, React Testing Library (78 Passing Tests for Unit & E2E)

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Firebase Project (Auth and Firestore enabled)
- Google Cloud Console Project (Maps JavaScript API & Geocoding API enabled)
- Gemini API Key

### 2. Clone the repository
```bash
git clone https://github.com/devbysatyam/VoteAi.git
cd VoteAi
```

### 3. Install dependencies
```bash
npm install
```

### 4. Environment Setup
Create a `.env` file in the root directory and configure your keys (use `.env.example` as a template):
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` to view the app in your browser!

### 6. Run Tests
```bash
npm run test
```

## 🔐 Firebase Security Rules
To ensure data security, configure your Firestore Rules as follows:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /journey/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📜 License
This project is licensed under the MIT License.
