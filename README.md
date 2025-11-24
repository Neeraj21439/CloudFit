# AI-Based Clothing Recommendation System

An intelligent fashion assistant that recommends outfits based on live weather, body shape, and personal style, featuring AI-generated virtual try-on capabilities.

## Features
- **Live Weather Integration**: Fetches real-time weather data using OpenWeatherMap.
- **Smart Recommendations**: Suggests outfits based on 7+ parameters (Weather, Body Shape, Occasion, etc.).
- **Virtual Try-On**: Generates AI images of models wearing the recommended outfits using generative AI.
- **Responsive Design**: Modern, premium UI built with React and Vanilla CSS.

## Tech Stack
- **Frontend**: React, Vite, Vanilla CSS
- **Backend**: Node.js, Express
- **APIs**: OpenWeatherMap (Weather), Pollinations.ai (Image Generation)

## Prerequisites
- Node.js (v14 or higher)
- npm

## Installation & Setup

### 1. Clone/Navigate to the project
```bash
cd clothing-recommendation-system
```

### 2. Setup Backend
```bash
cd server
npm install
# Start the server (runs on port 5000)
node index.js
```

### 3. Setup Frontend
Open a new terminal:
```bash
cd clothing-recommendation-system/client
npm install
# Start the development server
npm run dev
```

### 4. Usage
- Open your browser to the URL shown in the frontend terminal (usually `http://localhost:5173`).
- Enter your location (e.g., "London", "Mumbai").
- Select your body shape, occasion, and preferences.
- Click **Get Recommendations**.
- Click on any recommended outfit card to see the **Virtual Try-On**.

## API Endpoints

### `POST /api/recommend`
Returns outfit recommendations based on user input.
- **Body**: `{ location, body_shape, occasion, ... }`

### `POST /api/render-image`
Generates a virtual try-on image.
- **Body**: `{ outfit_description, body_shape }`

## License
MIT
