import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await axios.post(`${API}/waitlist/subscribe`, {
        email: email,
        source: "coming_soon_page",
        timestamp: new Date().toISOString()
      });
      
      setSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Email subscription error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-12">
            <img
              src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
              alt="TourSmile"
              className="h-24 md:h-32 mx-auto"
            />
          </div>

          {/* Success Message */}
          <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-8 mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">You're In!</h2>
            <p className="text-green-300 text-lg">
              We'll send you early access when we launch the simplest travel planning experience.
            </p>
          </div>

          <button
            onClick={() => {setSubmitted(false); setEmail("");}}
            className="text-blue-400 hover:text-blue-300 transition-colors underline"
          >
            Add another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-orange-500/10"></div>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" className="text-gray-300" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-16">
            <img
              src="https://customer-assets.emergentagent.com/job_travelgenius/artifacts/ojpqneqb_FINAL%20LOGO.png"
              alt="TourSmile"
              className="h-32 md:h-40 mx-auto mb-8"
            />
            
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
              <span className="animate-pulse mr-2">●</span>
              Coming Soon
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Travel planning made
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              simple
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Find what you need, book with confidence, travel with ease.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
            {[
              { icon: "✈️", title: "Flights", subtitle: "that make sense" },
              { icon: "🏨", title: "Hotels", subtitle: "without hidden fees" },
              { icon: "🎯", title: "Activities", subtitle: "you'll actually enjoy" },
              { icon: "⚡", title: "Planning", subtitle: "in minutes, not hours" }
            ].map((item, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-white font-semibold mb-1">{item.title}</div>
                <div className="text-gray-400 text-sm">{item.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Email Signup Form */}
          <div className="max-w-xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Be the first to experience stress-free travel planning
            </h3>
            <p className="text-gray-400 mb-8">
              Get early access and exclusive launch updates
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    "Get Early Access"
                  )}
                </button>
              </div>
              
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}
            </form>

            <p className="text-gray-500 text-sm mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>

          {/* Features Preview */}
          <div className="mt-20">
            <div className="text-gray-400 text-sm mb-8 uppercase tracking-wider">
              What makes us different
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  title: "Save Hours",
                  description: "Plan entire trips in minutes, not hours of research",
                  icon: "⏱️"
                },
                {
                  title: "Transparent Pricing",
                  description: "See real costs upfront with no hidden surprises",
                  icon: "💰"
                },
                {
                  title: "Smart Suggestions",
                  description: "Curated recommendations based on what you actually want",
                  icon: "🎯"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 bg-gray-900/30 border border-gray-800 rounded-2xl">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h4 className="text-white font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              © 2025 TourSmile. Crafting the future of travel planning.
              <br />
              <span className="text-xs">Coming soon to toursmile.in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;