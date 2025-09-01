import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

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
                onClick={() => navigate('/setup')}
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
                onClick={() => navigate('/setup')}
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