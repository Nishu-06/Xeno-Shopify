import React from 'react';

export default function SyncProgressModal({ isOpen, progress }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: `linear-gradient(135deg, ${
                ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)]
              } 0%, transparent 100%)`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
              transform: 'translateZ(0)',
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-75 blur-xl animate-gradient-rotate"></div>
        </div>
        
        {/* Content Background */}
        <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
          {/* Spinner */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            {/* Glow effect behind spinner */}
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-r-indigo-600 dark:border-r-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Syncing Data
          </h3>

          {/* Progress Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Syncing products, customers, and orders... please wait.
          </p>

          {/* Progress Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Syncing Products</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Syncing Customers</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Syncing Orders</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out animate-pulse"
              style={{ 
                width: progress ? `${progress}%` : '60%',
                animation: 'progress 2s ease-in-out infinite'
              }}
            ></div>
          </div>

            {/* Note */}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              This may take a few minutes depending on your data size
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

