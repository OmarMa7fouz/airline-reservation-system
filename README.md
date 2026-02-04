# Airline Reservation System

A comprehensive full-stack airline reservation system featuring booking management, payment processing, multi-modal travel packages (Flight + Hotel + Car), and price alerts.

## 📋 Features

- **Flight Booking**: Search and book flights with ease.
- **Seat Selection**: Interactive seat map for choosing your preferred spot.
- **Travel Packages**: Book complete vacation packages including hotels and car rentals.
- **Price Alerts**: Set alerts for flight prices and track history.
- **Payment Processing**: Secure mock payment integration.
- **User Dashboard**: Manage trips, preferences, and loyalty points.

## 🛠️ Technology Stack

- **Frontend**: React.js, Context API, CSS3
- **Backend**: Node.js, Express.js, SQLite (with `sqlite3`)
- **Other**: RESTful API design

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v14.0.0 or higher
- **npm**: (comes with Node.js)

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/airline-reservation-system.git
   cd airline-reservation-system
   ```

### ⚙️ Backend Setup & Database Migration

The backend manages the SQLite database. You need to install dependencies and seed the database with initial data (like travel packages) for the app to function correctly.

1. **Navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **🌱 Seed the Database (Important!)**
   Run this command to populate the database with travel packages, flights, and other essential data. **This step is crucial for seeing content on the website.**

   ```bash
   npm run seed
   ```

   _This command runs the `scripts/seed_packages.js` script to insert 20 high-quality travel packages with images._

4. **Start the backend server**
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`.

### 💻 Frontend Setup

1. **Open a new terminal** and navigate to the frontend directory

   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Start the React application**
   ```bash
   npm start
   ```
   The app will open automatically at `http://localhost:3000`.

## 🗃️ Database

The project uses a local SQLite database (`backend/airline.db`).

- The `migrations` folder contains scripts to create tables.
- The `scripts` folder contains utilities to seed and check data.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
