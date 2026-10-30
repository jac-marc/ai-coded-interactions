import React from 'react';

export function WarpControls({
  sidebarOpen,
  setSidebarOpen,
  showCrawl,
  setShowCrawl,
  speedMultiplier,
  setSpeedMultiplier,
  trailAmount,
  setTrailAmount,
  starCount,
  setStarCount,
  speedDisplayRef,
}) {
  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20"
      >
        <svg 
          className="h-6 w-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Control Sidebar */}
      <div
        className={`fixed left-0 top-0 z-20 h-full w-80 overflow-y-auto bg-gray-900/95 p-6 backdrop-blur-md transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h2 className="mb-8 mt-12 text-2xl font-bold text-white">
          Warp Controls
        </h2>
        
        <div className="space-y-8">
          {/* Show Crawl Text Toggle */}
          <div className="rounded-lg bg-yellow-500/10 p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-yellow-300">
                Show Opening Crawl
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showCrawl}
                  onChange={(e) => setShowCrawl(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </div>
            </label>
            <p className="mt-2 text-xs text-gray-400">
              Display Star Wars-style scrolling text
            </p>
          </div>

          {/* Scroll Speed Control */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Scroll Speed Sensitivity
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {speedMultiplier.toFixed(1)}x
            </div>
          </div>

          {/* Trail Amount Control */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Trail Persistence
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={trailAmount}
              onChange={(e) => setTrailAmount(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {Math.round((1 - trailAmount) * 100)}%
            </div>
          </div>

          {/* Star Count Control */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Number of Stars
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={starCount}
              onChange={(e) => setStarCount(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {starCount} stars
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 rounded-lg bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-white">
              How to Use
            </h3>
            <p className="text-xs leading-relaxed text-gray-400">
              Scroll up or down to trigger the warp effect and advance the opening 
              crawl. The faster you scroll, the faster the stars move. Toggle the 
              crawl text on/off to focus on the star field.
            </p>
          </div>

          {/* Current Speed Display */}
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="text-xs text-gray-400">Current Warp Speed</div>
            <div 
              ref={speedDisplayRef}
              className="mt-1 text-3xl font-bold text-blue-400"
            >
              0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

