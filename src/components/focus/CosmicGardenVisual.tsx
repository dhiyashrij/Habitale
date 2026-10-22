import React from 'react';
import { Sparkles } from 'lucide-react';
import type { CosmicStageInfo } from '../../types';

interface CosmicGardenVisualProps {
  currentStage: CosmicStageInfo;
  nextStage: CosmicStageInfo | null;
  progressPercent: number;
  isRunning: boolean;
  totalFocusSeconds?: number;
}

export const CosmicGardenVisual: React.FC<CosmicGardenVisualProps> = ({
  currentStage,
  nextStage,
  progressPercent,
  isRunning,
}) => {
  const stage = currentStage.stage;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px',
        borderRadius: 'var(--card-radius)',
        background: 'linear-gradient(180deg, rgba(23, 21, 59, 0.08) 0%, rgba(46, 35, 108, 0.14) 100%)',
        border: '1px solid rgba(201, 189, 231, 0.28)',
        boxShadow: '0 8px 32px rgba(46, 35, 108, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Background Starry Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(1.5px 1.5px at 15% 20%, rgba(255, 255, 255, 0.8), transparent),' +
            'radial-gradient(1.2px 1.2px at 80% 15%, rgba(217, 155, 170, 0.9), transparent),' +
            'radial-gradient(1.8px 1.8px at 70% 75%, rgba(201, 189, 231, 0.8), transparent),' +
            'radial-gradient(1.4px 1.4px at 25% 85%, rgba(168, 184, 159, 0.8), transparent),' +
            'radial-gradient(1px 1px at 50% 10%, rgba(255, 255, 255, 0.6), transparent)',
          opacity: isRunning ? 1 : 0.6,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Gentle Pulsing Cosmic Nebula Glow Behind Plant */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentStage.auraColor}33 0%, transparent 70%)`,
          filter: 'blur(20px)',
          animation: isRunning ? 'cosmicPulse 4s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }}
      />

      {/* SVG Celestial Garden Illustration */}
      <div
        style={{
          width: '100%',
          maxWidth: '260px',
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 260 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            {/* Asteroid Gradients */}
            <linearGradient id="asteroidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A4458" />
              <stop offset="50%" stopColor="#353040" />
              <stop offset="100%" stopColor="#25222E" />
            </linearGradient>

            {/* Glowing Stem Gradient */}
            <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#A8B89F" />
              <stop offset="100%" stopColor="#C9BDE7" />
            </linearGradient>

            {/* Radiant Petal/Bloom Gradient */}
            <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9D4DC" />
              <stop offset="50%" stopColor="#D99BAA" />
              <stop offset="100%" stopColor="#C9BDE7" />
            </linearGradient>

            {/* Cosmic Seed Gem Gradient */}
            <radialGradient id="seedGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#F9D4DC" />
              <stop offset="85%" stopColor="#D99BAA" />
              <stop offset="100%" stopColor="#6C4C54" />
            </radialGradient>

            {/* Glow Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Floating Asteroid / Celestial Base */}
          <g transform="translate(0, 15)">
            {/* Asteroid Shadow */}
            <ellipse cx="130" cy="180" rx="65" ry="14" fill="rgba(20, 18, 30, 0.45)" />

            {/* Asteroid Body */}
            <path
              d="M65 160 C75 145, 110 142, 130 142 C155 142, 190 147, 198 162 C204 175, 175 186, 130 186 C85 186, 58 174, 65 160 Z"
              fill="url(#asteroidGrad)"
              stroke="rgba(201, 189, 231, 0.35)"
              strokeWidth="1.5"
            />

            {/* Asteroid Craters & Stardust Deposits */}
            <circle cx="100" cy="160" r="5" fill="#2A2633" stroke="rgba(217,155,170,0.2)" />
            <circle cx="155" cy="164" r="6.5" fill="#2A2633" stroke="rgba(201,189,231,0.2)" />
            <circle cx="135" cy="172" r="3.5" fill="#2A2633" />
            <circle cx="82" cy="168" r="2.5" fill="#2A2633" />

            {/* Bioluminescent Stardust Moss on Asteroid */}
            <path
              d="M110 145 Q130 143 150 146 Q130 148 110 145 Z"
              fill={currentStage.auraColor}
              opacity="0.6"
              filter="url(#softGlow)"
            />
          </g>

          {/* STAGE 1: The Stardust Seed Crystal */}
          {stage === 1 && (
            <g transform="translate(130, 132)">
              {/* Pulsing Stardust Aura */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill="url(#seedGrad)"
                opacity="0.35"
                filter="url(#softGlow)"
              />
              {/* Geometric Crystal Seed */}
              <polygon
                points="0,-16 11,-4 0,14 -11,-4"
                fill="url(#seedGrad)"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
              <line x1="0" y1="-16" x2="0" y2="14" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
              <line x1="-11" y1="-4" x2="11" y2="-4" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />

              {/* Floating Sparkle Particles */}
              <circle cx="-16" cy="-12" r="1.5" fill="#FFFFFF" opacity="0.9" />
              <circle cx="18" cy="-8" r="1.2" fill="#F9D4DC" opacity="0.8" />
              <circle cx="-8" cy="-24" r="1" fill="#C9BDE7" opacity="0.9" />
              <circle cx="10" cy="-22" r="1.5" fill="#FFFFFF" opacity="0.8" />
            </g>
          )}

          {/* STAGE 2: The Lunar Sprout */}
          {stage === 2 && (
            <g transform="translate(130, 138)">
              {/* Sprout Stem */}
              <path
                d="M0 8 Q-4 -20 0 -45 Q4 -60 0 -72"
                stroke="url(#stemGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Left Leaf */}
              <path
                d="M-2 -35 C-20 -40 -26 -25 -22 -18 C-16 -12 -5 -25 -2 -35 Z"
                fill="#A8B89F"
                stroke="#D2E0CB"
                strokeWidth="1"
                filter="url(#softGlow)"
              />

              {/* Right Glowing Leaf */}
              <path
                d="M1 -50 C20 -58 28 -42 24 -34 C16 -26 3 -40 1 -50 Z"
                fill="#C9BDE7"
                stroke="#E5DCFA"
                strokeWidth="1"
                filter="url(#softGlow)"
              />

              {/* Terminal Celestial Bud */}
              <circle cx="0" cy="-74" r="6" fill="#F9D4DC" stroke="#FFFFFF" strokeWidth="1" filter="url(#softGlow)" />

              {/* Tiny Orbiting Crescent Moon */}
              <g transform="translate(38, -65)">
                <path
                  d="M0 -8 A8 8 0 0 0 6 6 A6 6 0 0 1 0 -8 Z"
                  fill="#FFF4E6"
                  opacity="0.85"
                />
                <circle cx="1" cy="-1" r="1.2" fill="#FFFFFF" opacity="0.9" />
              </g>

              {/* Gentle Floating Spores */}
              <circle cx="-24" cy="-55" r="1.5" fill="#C9BDE7" opacity="0.9" />
              <circle cx="28" cy="-22" r="1.8" fill="#A8B89F" opacity="0.8" />
            </g>
          )}

          {/* STAGE 3: The Astral Bloom */}
          {stage === 3 && (
            <g transform="translate(130, 138)">
              {/* Planetary Orbital Ring around Bloom */}
              <ellipse
                cx="0"
                cy="-70"
                rx="68"
                ry="18"
                fill="none"
                stroke="rgba(201, 189, 231, 0.45)"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                transform="rotate(-15, 0, -70)"
              />

              {/* Main Stem with dual curving branches */}
              <path
                d="M0 8 Q-6 -30 0 -60 Q4 -80 0 -95"
                stroke="url(#stemGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Lower Glowing Foliage */}
              <path
                d="M-3 -30 C-28 -40 -34 -15 -25 -5 C-12 2 -4 -18 -3 -30 Z"
                fill="#A8B89F"
                stroke="#DCE8D6"
                strokeWidth="1.2"
              />
              <path
                d="M3 -45 C28 -55 35 -30 26 -20 C14 -12 4 -32 3 -45 Z"
                fill="#B8A9DC"
                stroke="#E5DCFA"
                strokeWidth="1.2"
              />

              {/* Central Astral Flower Petals */}
              <g transform="translate(0, -96)">
                {/* 5 Radiant Star Petals */}
                <path d="M0 0 C-12 -22 12 -22 0 0" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="0.8" />
                <path d="M0 0 C-22 -12 -22 12 0 0" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="0.8" transform="rotate(72)" />
                <path d="M0 0 C-22 -12 -22 12 0 0" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="0.8" transform="rotate(144)" />
                <path d="M0 0 C-22 -12 -22 12 0 0" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="0.8" transform="rotate(216)" />
                <path d="M0 0 C-22 -12 -22 12 0 0" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="0.8" transform="rotate(288)" />

                {/* Starlit Center Core */}
                <circle cx="0" cy="0" r="8" fill="#FFF9E6" stroke="#D99BAA" strokeWidth="1.5" filter="url(#softGlow)" />
                <circle cx="0" cy="0" r="3" fill="#D99BAA" />
              </g>

              {/* Satellite Star Sparkles */}
              <circle cx="-42" cy="-90" r="2.2" fill="#FFFFFF" />
              <circle cx="45" cy="-80" r="2" fill="#F7EAEF" />
              <circle cx="-18" cy="-125" r="1.5" fill="#C9BDE7" />
              <circle cx="20" cy="-120" r="1.8" fill="#FFF4E6" />
            </g>
          )}

          {/* STAGE 4: The Celestial Sanctuary (Cosmic Tree / Miniature Galaxy) */}
          {stage === 4 && (
            <g transform="translate(130, 138)">
              {/* Outer Swirling Nebula Arms */}
              <ellipse
                cx="0"
                cy="-85"
                rx="85"
                ry="26"
                fill="none"
                stroke="url(#petalGrad)"
                strokeWidth="2"
                opacity="0.6"
                transform="rotate(-20, 0, -85)"
              />
              <ellipse
                cx="0"
                cy="-85"
                rx="98"
                ry="30"
                fill="none"
                stroke="rgba(122, 162, 227, 0.45)"
                strokeWidth="1.2"
                strokeDasharray="6 4"
                transform="rotate(15, 0, -85)"
              />

              {/* Robust Ancient Celestial Tree Trunk */}
              <path
                d="M-8 8 Q-12 -25 -6 -50 Q0 -65 -3 -80 Q-15 -95 -28 -105 Q-6 -88 0 -72 Q8 -90 26 -108 Q12 -92 2 -78 Q8 -55 8 8 Z"
                fill="url(#stemGrad)"
                stroke="#E5DCFA"
                strokeWidth="1.2"
              />

              {/* Canopy Clusters of Star Blossoms */}
              {/* Left Star Cluster */}
              <g transform="translate(-32, -108)">
                <circle cx="0" cy="0" r="16" fill="rgba(217, 155, 170, 0.35)" filter="url(#softGlow)" />
                <circle cx="0" cy="0" r="11" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                <circle cx="-12" cy="-8" r="2" fill="#FFF" />
                <circle cx="10" cy="6" r="1.8" fill="#C9BDE7" />
              </g>

              {/* Right Star Cluster */}
              <g transform="translate(32, -112)">
                <circle cx="0" cy="0" r="17" fill="rgba(201, 189, 231, 0.4)" filter="url(#softGlow)" />
                <circle cx="0" cy="0" r="12" fill="url(#petalGrad)" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" />
                <circle cx="12" cy="-6" r="2" fill="#FFF" />
                <circle cx="-8" cy="8" r="1.8" fill="#D99BAA" />
              </g>

              {/* Apex Galactic Core */}
              <g transform="translate(0, -125)">
                <circle cx="0" cy="0" r="22" fill="rgba(255, 244, 230, 0.3)" filter="url(#softGlow)" />
                <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#D99BAA" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="6" fill="#F7EAEF" />

                {/* Star Rays */}
                <line x1="0" y1="-20" x2="0" y2="20" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="-20" y1="0" x2="20" y2="0" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="-12" y1="-12" x2="12" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                <line x1="12" y1="-12" x2="-12" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
              </g>

              {/* Swirling Constellation Specks */}
              <circle cx="-55" cy="-80" r="2" fill="#FFFFFF" />
              <circle cx="62" cy="-70" r="2.2" fill="#7AA2E3" />
              <circle cx="-25" cy="-145" r="1.8" fill="#F9D4DC" />
              <circle cx="28" cy="-140" r="2" fill="#FFF" />
              <circle cx="0" cy="-155" r="1.5" fill="#FFF" />
            </g>
          )}
        </svg>
      </div>

      {/* Stage Badge & Name */}
      <div style={{ textAlign: 'center', marginTop: '10px', zIndex: 1, width: '100%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: `${currentStage.auraColor}22`,
            border: `1px solid ${currentStage.auraColor}55`,
            color: 'var(--text-main)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            marginBottom: '6px',
          }}
        >
          <Sparkles size={12} color={currentStage.auraColor} />
          <span>Stage {stage} &bull; {currentStage.title}</span>
        </div>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            maxWidth: '320px',
            margin: '0 auto 12px auto',
          }}
        >
          {currentStage.description}
        </p>

        {/* Progress to Next Stage */}
        <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginBottom: '5px',
              fontWeight: 500,
            }}
          >
            <span>
              {isRunning ? '✨ Universe is flourishing...' : 'Cosmic Growth'}
            </span>
            <span>
              {nextStage ? `${progressPercent}% to ${nextStage.title}` : 'Galaxy Mastered 🌌'}
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(53, 50, 56, 0.08)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, var(--primary) 0%, ${currentStage.auraColor} 100%)`,
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.5s ease',
                boxShadow: `0 0 8px ${currentStage.auraColor}88`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
