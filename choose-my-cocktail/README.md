# 🍹 ChooseMyCocktail v2.0

> **Unified Food & Beverage Pairing Platform**

Welcome to the modernized version of ChooseMyCocktail! This project has evolved from a simple cocktail recipe app into a comprehensive ecosystem for discovering, pairing, and enjoying both food and beverages.

---

## 📋 Overview

**ChooseMyCocktail v2.0** introduces a robust, data-driven approach to culinary pairings. Whether you're looking for the perfect cocktail to match your spicy pasta or just want to browse a curated collection of recipes, this platform has you covered.

### ✨ Key Features

- **🍷 Intelligent Pairing Engine**: Rule-based algorithm that suggests beverages based on food flavor profiles (e.g., "Spicy" → "Refreshing", "Rich" → "Acidic").
- **🗄️ Unified Database**: A single, normalized SQLite database managing both Food and Beverage items with shared ingredients and tags.
- **🔍 Advanced Filtering**: Search by ingredients, type (Cocktail/Mocktail), or dietary preferences.
- **📱 Modern UI**: A responsive React frontend with a dedicated Pairing interface.
- **🔐 Admin Tools**: Secure endpoints for managing recipes and ingredients.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+)
- **npm** (v8+)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/nicoco23/ChooseMyCocktail.git
    cd ChooseMyCocktail/choose-my-cocktail
    ```

2.  **Install Dependencies**
    ```bash
    # Install Frontend dependencies
    npm install

    # Install Backend dependencies
    cd server
    npm install
    cd ..
    ```

### Running the Application

You need to run both the Backend (API) and Frontend (UI).

**1. Start the Backend (Port 3001)**
```bash
cd server
node index.js
```
*The API will be available at `http://localhost:3001`*

**2. Start the Frontend (Port 3000)**
```bash
# In a new terminal window
cd choose-my-cocktail
npm start
```
*The App will open at `http://localhost:3000`*

---

## 🏗️ Architecture

The application follows a **Client-Server** architecture:

- **Frontend**: React.js (SPA) with React Router and Context API.
- **Backend**: Node.js with Express.
- **Database**: SQLite (Relational Schema).
- **Pattern**: Repository Pattern for clean data access.

For a deep dive, see [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md).

---

## 🔌 API Reference

The backend provides a RESTful API for accessing recipes, ingredients, and pairings.

**Base URL**: `http://localhost:3001`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check server status |
| `GET` | `/api/recipes` | Get all items (supports filters) |
| `GET` | `/api/recipes/:id` | Get details for a specific item |
| `POST` | `/api/pairings` | Get beverage recommendations for a food item |
| `GET` | `/api/ingredients` | Get list of normalized ingredients |

> **Note**: Admin endpoints (Create/Update/Delete) require the `x-admin-token` header.

For full documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## 🧪 Testing

We provide a comprehensive guide to testing the API and Pairing Engine.

**Quick Health Check:**
```bash
curl http://localhost:3001/health
```

For detailed test scenarios, see [TESTING_GUIDE.md](TESTING_GUIDE.md).

---

## 🗺️ Roadmap

We have exciting plans for the future!

- **🤖 Machine Learning**: Transition from rule-based to ML-powered pairings.
- **🌍 Multi-language**: Support for FR, EN, ES, IT.
- **📊 Analytics**: Dashboard for user preferences and trends.

See the full [ROADMAP.md](ROADMAP.md).

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License.
