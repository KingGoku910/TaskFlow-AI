// @/components/landing/VoiceControlDetailSvg.tsx
'use client';

import React from 'react';

export function VoiceControlDetailSvg() {
  const colors = {
    bgWindow: 'hsl(0 0% 100%)',
    bgMutedLight: 'hsl(240 4.8% 97%)', // Lighter muted for depth
    borderLight: 'hsl(240 5.9% 90%)',
    textPrimary: 'hsl(180 100% 25%)', // Teal
    textDefault: 'hsl(240 10% 3.9%)',
    textMuted: 'hsl(240 3.8% 46.1%)',
    shadow: 'rgba(0,0,0,0.1)',
    micBody: 'hsl(240 5% 80%)',
    micAccent: 'hsl(240 10% 30%)',
    waveColor: 'hsl(180 100% 25%)', // Teal
    speechBubbleBg: 'hsl(0 0% 100%)',
    listeningIndicator: 'hsl(120 60% 50%)', // Green for listening
  };

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-lg mx-auto"
      aria-labelledby="voiceControlSvgTitle"
      role="img"
    >
      <title id="voiceControlSvgTitle">Illustration of voice control interface with microphone, sound waves, and speech command</title>
      <defs>
        <filter id="voiceShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="micHighlight" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="600" height="400" rx="10" fill={colors.bgMutedLight} />

      {/* Central Microphone Illustration */}
      <g transform="translate(300 200)" style={{ filter: 'url(#voiceShadow)' }}>
        {/* Mic Stand Base */}
        <ellipse cx="0" cy="80" rx="50" ry="15" fill={colors.micAccent} />
        {/* Mic Stand Pole */}
        <rect x="-5" y="20" width="10" height="60" fill={colors.micBody} />
        {/* Mic Body */}
        <rect x="-25" y="-50" width="50" height="80" rx="25" fill={colors.micBody} stroke={colors.micAccent} strokeWidth="2"/>
        <rect x="-25" y="-50" width="50" height="80" rx="25" fill="url(#micHighlight)" />
        {/* Mic Grill */}
        <circle cx="0" cy="-10" r="22" fill="none" stroke={colors.micAccent} strokeWidth="1.5" opacity="0.5"/>
        <line x1="-15" y1="-20" x2="15" y2="0" stroke={colors.micAccent} strokeWidth="1" opacity="0.5"/>
        <line x1="-15" y1="0" x2="15" y2="-20" stroke={colors.micAccent} strokeWidth="1" opacity="0.5"/>
        <line x1="-20" y1="-10" x2="20" y2="-10" stroke={colors.micAccent} strokeWidth="1" opacity="0.5"/>
        {/* Listening Indicator */}
        <circle cx="0" cy="20" r="4" fill={colors.listeningIndicator}>
            <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Sound Waves emanating from the speech bubble towards the mic */}
       {[1, 2, 3].map(i => (
        <path
          key={`wave-input-${i}`}
          d={`M180 130 C ${180 + i*15} ${130 - i*10}, ${250 - i*20} ${200 - i*25}, 270 ${200-i*5}`}
          stroke={colors.waveColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.8 - i*0.2}
        >
          <animate attributeName="stroke-dasharray" values="0, 200; 10, 10; 0, 200" dur="1.5s" repeatCount="indefinite" begin={`${i*0.1}s`}/>
          <animate attributeName="stroke-dashoffset" values="0; -20; -40" dur="1.5s" repeatCount="indefinite" begin={`${i*0.1}s`}/>
        </path>
      ))}


      {/* Speech Bubble for voice command */}
      <g transform="translate(50 80)" style={{ filter: 'url(#voiceShadow)' }}>
        <path d="M0 20 Q0 0 20 0 H160 Q180 0 180 20 V50 Q180 70 160 70 H40 L20 90 L25 70 H20 Q0 70 0 50 Z"
              fill={colors.speechBubbleBg} stroke={colors.borderLight} />
        <text x="15" y="30" fill={colors.textDefault} fontSize="13" fontWeight="500">Voice Command:</text>
        <text x="15" y="55" fill={colors.textMuted} fontSize="12">"Create task: Design new logo"</text>
      </g>


      {/* Abstract UI element for AI processing/feedback */}
      <g transform="translate(370 290)" style={{ filter: 'url(#voiceShadow)' }}>
        <rect width="180" height="60" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} />
         <circle cx="25" cy="30" r="7" fill={colors.textPrimary} opacity="0.7">
            <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="45" y="28" fill={colors.textDefault} fontSize="12" fontWeight="500">Processing...</text>
        <text x="45" y="48" fill={colors.textMuted} fontSize="11">Task created!</text>
      </g>
       {/* Connecting line from mic to processing feedback */}
      <path d="M330 210 Q350 250 370 280" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" strokeDasharray="4,4" opacity="0.6"/>

    </svg>
  );
}
