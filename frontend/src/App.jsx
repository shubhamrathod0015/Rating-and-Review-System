// src/App.jsx
import React from "react";
import HomePage from "./pages/HomePage";
import "./index.css";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-8 sm:py-10 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center px-2 sm:px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            ⭐ Product Reviews & Ratings
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90">
            Share your experience with our best products
          </p>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <HomePage />
      </main>

      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs sm:text-sm">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">Product Reviews</span>. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
