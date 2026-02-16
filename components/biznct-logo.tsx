export default function BiznctLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle/arrows - blue gradient */}
      <defs>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2F6EDB" />
          <stop offset="100%" stopColor="#1E4F91" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6DBE45" />
          <stop offset="100%" stopColor="#9EDB66" />
        </linearGradient>
      </defs>
      
      {/* Top curved arrow */}
      <path 
        d="M20 35 Q50 10 80 35" 
        stroke="url(#blueGrad)" 
        strokeWidth="6" 
        fill="none"
        strokeLinecap="round"
      />
      <path 
        d="M75 30 L80 35 L75 40" 
        stroke="url(#blueGrad)" 
        strokeWidth="6" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Bottom curved arrow */}
      <path 
        d="M80 65 Q50 90 20 65" 
        stroke="url(#blueGrad)" 
        strokeWidth="6" 
        fill="none"
        strokeLinecap="round"
      />
      <path 
        d="M25 70 L20 65 L25 60" 
        stroke="url(#blueGrad)" 
        strokeWidth="6" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Globe circle */}
      <circle cx="50" cy="50" r="22" fill="url(#blueGrad)" opacity="0.9" />
      
      {/* Globe grid lines */}
      <ellipse cx="50" cy="50" rx="10" ry="22" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
      <ellipse cx="50" cy="50" rx="22" ry="10" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
      <line x1="50" y1="28" x2="50" y2="72" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="28" y1="50" x2="72" y2="50" stroke="white" strokeWidth="1.5" opacity="0.6" />
      
      {/* Green accent */}
      <path 
        d="M35 50 Q50 35 65 50 Q50 65 35 50" 
        fill="url(#greenGrad)" 
        opacity="0.7"
      />
    </svg>
  )
}