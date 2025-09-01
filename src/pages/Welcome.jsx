import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    budget: "",
    partnerEmail: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleDemoLogin = () => {
    // Set mock user data and navigate to home
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@example.com',
      user_metadata: { 
        full_name: 'Demo User',
        budget: 2000,
        partner_email: null
      }
    };
    
    // Manually set the auth state for demo
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    
    // Navigate to home
    navigate('/home', { replace: true });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in email and password");
      return;
    }

    try {
      console.log('Starting signup process...');
      const result = await signUp(
        formData.email, 
        formData.password,
        parseFloat(formData.budget) || 0,
        formData.partnerEmail || null
      );
      
      if (result.requiresConfirmation) {
        setSuccess(result.message);
      } else {
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.log('Sign up error:', error);
      setError(error.message || 'Failed to create account');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in email and password");
      return;
    }

    try {
      console.log('Starting signin process...');
      await signIn(formData.email, formData.password);
      navigate('/home', { replace: true });
    } catch (error) {
      console.log('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    }
  };

  const handleAccountTypeClick = (type) => {
    if (type === 'demo') {
      handleDemoLogin();
    } else {
      setShowLogin(true);
      setIsSignUp(type === 'solo'); // Default to signup for solo, signin for shared
    }
  };

  if (showLogin) {
    return (
      <div className="bg-gray-100 text-gray-900 min-h-screen">
        <div className="relative flex size-full min-h-screen flex-col justify-center group/design-root">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[#f9f9f9]">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_100px,#ffd9d9,transparent)]"></div>
          </div>
          
          <main className="flex flex-col items-center justify-center flex-1 px-6 pb-8">
            <div className="w-full max-w-md">
              <div className="relative flex flex-col justify-between group/design-root overflow-hidden rounded-3xl">
                <div className="absolute inset-0 z-0">
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--destructive-red)]/20 rounded-full blur-3xl opacity-50"></div>
                  <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#5D5FEF]/20 rounded-full blur-3xl opacity-50"></div>
                </div>
                
                <div className="relative z-10 p-6 space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome to Stitch</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account or create a new one</p>
                  </div>
                  
                  {error && (
                    <div className="text-center">
                      <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                        {error}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div className="text-center">
                      <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                        {success}
                      </p>
                    </div>
                  )}
                  
                  <form className="space-y-4">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                      <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                        placeholder="Email" 
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                      <input 
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                        placeholder="Password" 
                        required
                      />
                    </div>

                    {isSignUp && (
                      <>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">account_balance_wallet</span>
                          <input 
                            name="budget"
                            type="number"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                            placeholder="Monthly Budget (Optional)" 
                          />
                        </div>
                        
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">group</span>
                          <input 
                            name="partnerEmail"
                            type="email"
                            value={formData.partnerEmail}
                            onChange={handleInputChange}
                            className="form-input w-full pl-12 pr-4 py-4 glassmorphism rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--destructive-red)]/50 border-none h-14 placeholder:text-slate-400 text-base" 
                            placeholder="Partner's Email (Optional)" 
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="h-14 px-5 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 text-base font-semibold tracking-wide transform active:scale-95 transition-transform duration-150 ease-in-out"
                      >
                        {isSignUp ? "Sign In" : "Sign Up"}
                      </button>
                      <button 
                        type="button"
                        onClick={isSignUp ? handleSignUp : handleSignIn}
                        disabled={loading}
                        className="h-14 px-5 flex items-center justify-center rounded-full bg-[var(--destructive-red)] text-white text-base font-semibold tracking-wide shadow-lg shadow-[var(--destructive-red)]/30 transform active:scale-95 transition-transform duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "..." : (isSignUp ? "Create Account" : "Sign In")}
                      </button>
                    </div>
                  </form>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => setShowLogin(false)}
                      className="text-slate-500 text-sm font-medium hover:text-[var(--destructive-red)] transition-colors"
                    >
                      Back to account type selection
                    </button>
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={handleDemoLogin}
                      className="w-full text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors bg-blue-50 py-3 px-4 rounded-lg"
                    >
                      🚀 Continue with Demo Account (No Signup Required)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[#f9f9f9]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_100px,#ffd9d9,transparent)]"></div>
        </div>
        
        <header className="flex items-center justify-center p-4">
          <div className="w-10"></div>
          <h1 className="text-lg font-semibold text-gray-800">Welcome</h1>
          <div className="w-10"></div>
        </header>
        
        <main className="flex flex-col items-center justify-center flex-1 px-6 pb-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center animate-pulse">
              <svg fill="none" height="60" viewBox="0 0 24 24" width="60" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#paint0_linear_1_2)" stroke="var(--destructive-red)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_2" x1="12" x2="12" y1="2" y2="21.02">
                    <stop stopColor="var(--destructive-red)" stopOpacity="0.5"></stop>
                    <stop offset="1" stopColor="var(--destructive-red)"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="text-[32px] font-bold tracking-tight text-gray-900">Welcome to Stitch</h2>
          </div>
          
          <div className="mt-8 w-full max-w-sm space-y-8">
            <div className="space-y-4">
              <button 
                onClick={() => handleAccountTypeClick('solo')}
                className="w-full rounded-2xl p-4 text-left transition-transform duration-200 ease-in-out active:scale-[0.98] glassmorphism bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-500">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Solo Account</h3>
                    <p className="text-sm text-gray-600">For your personal budgeting.</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-gray-400">chevron_right</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleAccountTypeClick('shared')}
                className="w-full rounded-2xl p-4 text-left transition-transform duration-200 ease-in-out active:scale-[0.98] glassmorphism bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Shared Account</h3>
                    <p className="text-sm text-gray-600">For household & family budgets.</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-gray-400">chevron_right</span>
                </div>
              </button>

              <button 
                onClick={() => handleAccountTypeClick('demo')}
                className="w-full rounded-2xl p-4 text-left transition-transform duration-200 ease-in-out active:scale-[0.98] glassmorphism bg-blue-50/70 backdrop-blur-xl border border-blue-200/50 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                    <span className="material-symbols-outlined text-2xl">play_circle</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Try Demo</h3>
                    <p className="text-sm text-gray-600">Explore without signing up.</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-gray-400">chevron_right</span>
                </div>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              By continuing, you agree to Stitch's{" "}
              <a className="font-medium text-[var(--destructive-red)]" href="#">Terms of Service</a>
              {" "}and{" "}
              <a className="font-medium text-[var(--destructive-red)]" href="#">Privacy Policy</a>.
            </p>
          </div>
        </main>
        
        <div className="h-safe-area-bottom"></div>
      </div>
    </div>
  );
}