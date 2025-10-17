'use client'

import { useEffect, useRef, useState } from 'react'

class Star {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true)
  }

  reset(canvasWidth, canvasHeight, initial = false) {
    this.x = Math.random() * canvasWidth - canvasWidth / 2
    this.y = Math.random() * canvasHeight - canvasHeight / 2
    this.z = initial ? Math.random() * canvasWidth : canvasWidth
    this.prevZ = this.z
  }

  update(speed, canvasWidth, canvasHeight) {
    this.prevZ = this.z
    this.z -= speed
    
    if (this.z <= 0) {
      this.reset(canvasWidth, canvasHeight)
    }
  }

  draw(ctx, canvasWidth, canvasHeight, centerX, centerY, trailOpacity) {
    const sx = (this.x / this.z) * centerX + centerX
    const sy = (this.y / this.z) * centerY + centerY
    
    const prevSx = (this.x / this.prevZ) * centerX + centerX
    const prevSy = (this.y / this.prevZ) * centerY + centerY
    
    const size = (1 - this.z / canvasWidth) * 2
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - this.z / canvasWidth) * trailOpacity})`
    ctx.lineWidth = size
    ctx.beginPath()
    ctx.moveTo(prevSx, prevSy)
    ctx.lineTo(sx, sy)
    ctx.stroke()
    
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function StarWarpEffect() {
  const canvasRef = useRef(null)
  const crawlRef = useRef(null)
  const starsRef = useRef([])
  const speedRef = useRef(0)
  const targetSpeedRef = useRef(0)
  const animationFrameRef = useRef(null)
  const lastScrollRef = useRef(0)
  
  const [speedMultiplier, setSpeedMultiplier] = useState(0.5)
  const [trailAmount, setTrailAmount] = useState(0.3)
  const [starCount, setStarCount] = useState(400)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showCrawl, setShowCrawl] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let canvasWidth = window.innerWidth
    let canvasHeight = window.innerHeight
    
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const handleResize = () => {
      canvasWidth = window.innerWidth
      canvasHeight = window.innerHeight
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    const handleScroll = () => {
      const currentScroll = window.scrollY
      const delta = Math.abs(currentScroll - lastScrollRef.current)
      lastScrollRef.current = currentScroll
      
      targetSpeedRef.current = Math.min(delta * speedMultiplier, 50)
      
      if (crawlRef.current && showCrawl) {
        const scrollProgress = currentScroll * 0.5
        crawlRef.current.style.transform = `
          perspective(400px) 
          rotateX(25deg) 
          translateY(${100 - scrollProgress}vh)
        `
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [speedMultiplier, showCrawl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    starsRef.current = Array.from({ length: starCount }, () => 
      new Star(canvas.width, canvas.height)
    )
  }, [starCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const animate = () => {
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.1
      targetSpeedRef.current *= 0.92
      
      ctx.fillStyle = `rgba(0, 0, 0, ${trailAmount})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      starsRef.current.forEach(star => {
        star.update(speedRef.current, canvas.width, canvas.height)
        star.draw(ctx, canvas.width, canvas.height, centerX, centerY, 1)
      })
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [trailAmount])

  return (
    <div className="relative min-h-[500vh] bg-black">
      {/* Fixed Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
      />
      
      {/* Star Wars Crawl Text */}
      {showCrawl && (
        <div className="fixed inset-0 z-5 flex items-end justify-center overflow-hidden pointer-events-none">
          <div
            ref={crawlRef}
            className="w-full max-w-5xl px-12 text-center text-yellow-300 transition-transform duration-100"
            style={{
              transform: 'perspective(400px) rotateX(25deg) translateY(100vh)',
              transformOrigin: 'center bottom',
              fontFamily: 'sans-serif',
              lineHeight: '2',
            }}
          >
            <div className="space-y-12 text-5xl font-bold leading-relaxed">
              <p className="text-7xl tracking-widest mb-16">
                GALACTIC CONFLICT
              </p>
              
              <p className="text-4xl leading-loose">
                It is a period of civil wars in the galaxy. A brave alliance of 
                underground freedom fighters has challenged the tyranny and 
                oppression of the awesome GALACTIC EMPIRE.
              </p>
              
              <p className="text-4xl leading-loose">
                Striking from a fortress hidden among the billion stars of the 
                galaxy, rebel spaceships have won their first victory in a battle 
                with the powerful Imperial Starfleet. The EMPIRE fears that 
                another defeat could bring a thousand more solar systems into 
                the rebellion, and Imperial control over the galaxy would be 
                lost forever.
              </p>
              
              <p className="text-4xl leading-loose">
                To crush the rebellion once and for all, the EMPIRE is 
                constructing a sinister new battle station. Powerful enough to 
                destroy an entire planet, its completion spells certain doom for 
                the champions of freedom.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
            <div className="mt-1 text-3xl font-bold text-blue-400">
              {Math.round(speedRef.current * 10) / 10}
            </div>
          </div>
        </div>
      </div>

      {/* Invisible content for endless scroll */}
      <div className="relative z-10 pointer-events-none" />
    </div>
  )
}
