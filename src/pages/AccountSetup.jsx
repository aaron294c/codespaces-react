// src/pages/AccountSetup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountSetup() {
  const navigate = useNavigate();
  const { signUp, signIn, loading } = useAuth();
  const [isSignIn, setIsSignIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    budget: "",
    partnerEmail: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignIn) {
        // Sign in existing user
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
          return;
        }
      } else {
        // Sign up new user
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          {
            budget: formData.budget,
            partner_email: formData.partnerEmail
          }
        );
        if (error) {
          setError(error.message);
          return;
        }
      }
      
      // Navigate to home on success
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="relative flex flex-col justify-between group/design-root overflow-hidden rounded-3xl">
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--destructive-red)]/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#5D5FEF]/20 rounded-full blur-3xl opacity-50"></div>
          </div>
          
          <div className="relative z-10 p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {isSignIn ? 'Sign In' : 'Create Account'}
              </h1>
              <p className="text-slate-500 mt-2">
                {isSignIn ? 'Welcome back!' : "Let's get your budget set up."}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                  placeholder="Email" 
                  type="email"
                  required
                />
              </div>
              
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                  placeholder="Password" 
                  type="password"
                  required
                  minLength="6"
                />
              </div>
              
              {!isSignIn && (
                <>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">account_balance_wallet</span>
                    <input 
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                      placeholder="Monthly Budget" 
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">group</span>
                    <input 
                      name="partnerEmail"
                      value={formData.partnerEmail}
                      onChange={handleChange}
                      className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                      placeholder="Partner's Email (Optional)" 
                      type="email"
                    />
                  </div>
                </>
              )}
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 px-5 flex items-center justify-center rounded-full bg-[var(--destructive-red)] text-white text-lg font-bold tracking-wide shadow-lg shadow-[var(--destructive-red)]/30 transform active:scale-95 transition-transform duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {loading ? 'Please wait...' : (isSignIn ? 'Sign In' : 'Create Account')}
                  </span>
                </button>
              </div>
            </form>
            
            <div className="text-center space-y-2">
              <button 
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-slate-500 text-sm font-medium hover:text-[var(--destructive-red)] transition-colors"
              >
                {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="block w-full text-slate-500 text-sm font-medium hover:text-[var(--destructive-red)] transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}