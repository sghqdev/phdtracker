import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Lines */}
      <div className="absolute bottom-0 left-0 w-full h-96 z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <path
            fill="url(#grad)"
            fillOpacity="1"
            d="M0,256L48,240C96,224,192,192,288,186.7C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 z-10 w-full flex justify-between items-center py-4 px-8">
        <h1 className="text-xl font-bold">PhDTracker</h1>
        {/* Optional social icons */}
      </header>

      {/* Main Content */}
      <main className="z-10 flex flex-col items-center text-center mt-20">
        <h2 className="text-7xl font-bold mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            PhDTracker
          </span>
        </h2>
        <h3 className="text-3xl font-light mb-4">Milestone and Career</h3>
        <p className="max-w-xl text-sm italic text-gray-300 mb-10">
          Platform designed to help PhD students manage their academic milestones and career development goals with clarity and confidence
        </p>

        <div className="flex gap-4">
        <Link
            to="/auth"
            state={{ mode: 'login' }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-medium py-2 px-6 rounded shadow"
          > 
            Login
          </Link>
          <Link
            to="/auth"
            state={{ mode: 'signup' }}
            className="bg-gradient-to-r from-gray-200 to-gray-400 text-black font-medium py-2 px-6 rounded shadow"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
