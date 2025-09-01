import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccountSetup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    budget: "",
    partnerEmail: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock authentication
    login('token');
    navigate('/home', { replace: true });
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
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Account Setup</h1>
              <p className="text-slate-500 mt-2">Let's get your budget set up.</p>
            </div>
            
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
                />
              </div>
              
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">account_balance_wallet</span>
                <input 
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                  placeholder="Monthly Budget" 
                  type="number"
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
              
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full h-14 px-5 flex items-center justify-center rounded-full bg-[var(--destructive-red)] text-white text-lg font-bold tracking-wide shadow-lg shadow-[var(--destructive-red)]/30 transform active:scale-95 transition-transform duration-150 ease-in-out"
                >
                  <span className="truncate">Send Invitation</span>
                </button>
              </div>
            </form>
            
            <div className="text-center">
              <button 
                onClick={() => navigate('/')}
                className="text-slate-500 text-sm font-medium hover:text-[var(--destructive-red)] transition-colors"
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