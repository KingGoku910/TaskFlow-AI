// @/components/landing/MeetingDetailSvg.tsx
'use client';

import React from 'react';

export function MeetingDetailSvg() {
  const colors = {
    bgWindow: 'hsl(0 0% 100%)',
    bgMuted: 'hsl(240 4.8% 95.9%)',
    borderLight: 'hsl(240 5.9% 90%)',
    textPrimary: 'hsl(180 100% 25%)', // Teal
    textDefault: 'hsl(240 10% 3.9%)',
    textMuted: 'hsl(240 3.8% 46.1%)',
    shadow: 'rgba(0,0,0,0.1)',
    accentRed: 'hsl(0 80% 65%)', // For recording dot
    accentBlue: 'hsl(210 90% 60%)',
    accentGreen: 'hsl(140 60% 55%)',
  };

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-lg mx-auto"
      aria-labelledby="meetingDetailSvgTitle"
      role="img"
    >
      <title id="meetingDetailSvgTitle">Illustration of meeting integration with recording, summarization, and task creation</title>
      <defs>
        <filter id="meetingShadow" x="-10%" y="-10%" width="120%" height="120%">
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
        <clipPath id="transcriptClip">
          <rect x="0" y="0" width="220" height="100"/>
        </clipPath>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="600" height="400" rx="10" fill={colors.bgMuted} />

      {/* Meeting Interface Panel */}
      <g transform="translate(40 50)" style={{ filter: 'url(#meetingShadow)' }}>
        <rect width="280" height="300" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} />
        {/* Header */}
        <rect x="0" y="0" width="280" height="40" rx="8" ry="8" fill={colors.textPrimary}/>
        <text x="15" y="25" fill="white" fontSize="14" fontWeight="bold">Meeting Recording</text>
        {/* Recording indicator */}
        <circle cx="250" cy="20" r="7" fill={colors.accentRed}>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>

        {/* Simplified waveform */}
        <g transform="translate(20 70)">
          <path
            d="M0 20 L20 10 L40 30 L60 5 L80 25 L100 15 L120 35 L140 10 L160 20 L180 5 L200 25 L220 15 L240 20"
            stroke={colors.accentBlue} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <rect x="0" y="0" width="240" height="40" fill="transparent"/>
        </g>
        {/* Controls */}
        <g transform="translate(70 130)">
            <circle cx="0" cy="0" r="15" fill={colors.bgMuted} stroke={colors.borderLight}/>
            <path d="M-4 -6 L6 0 L-4 6 Z" fill={colors.textDefault} transform="translate(1 0)"/> {/* Play */}
            <circle cx="50" cy="0" r="15" fill={colors.bgMuted} stroke={colors.borderLight}/>
            <rect x="44" y="-6" width="4" height="12" fill={colors.textDefault}/>
            <rect x="52" y="-6" width="4" height="12" fill={colors.textDefault}/> {/* Pause */}
            <circle cx="100" cy="0" r="15" fill={colors.bgMuted} stroke={colors.borderLight}/>
            <rect x="94" y="-6" width="12" height="12" fill={colors.textDefault}/> {/* Stop */}
        </g>

        {/* Timestamp/Duration */}
        <text x="20" y="180" fontSize="12" fill={colors.textMuted}>Duration: 45:17</text>
        <text x="20" y="200" fontSize="12" fill={colors.textMuted}>Recorded: Jul 26, 10:00 AM</text>

         {/* Action buttons */}
        <rect x="20" y="230" width="110" height="30" rx="4" fill={colors.accentGreen} fillOpacity="0.2" stroke={colors.accentGreen}/>
        <text x="75" y="250" textAnchor="middle" fontSize="11" fill={colors.accentGreen} fontWeight="500">Summarize</text>

        <rect x="150" y="230" width="110" height="30" rx="4" fill={colors.accentBlue} fillOpacity="0.2" stroke={colors.accentBlue}/>
        <text x="205" y="250" textAnchor="middle" fontSize="11" fill={colors.accentBlue} fontWeight="500">Get Tasks</text>
      </g>

      {/* Summary/Transcription Panel */}
      <g transform="translate(350 80)" style={{ filter: 'url(#meetingShadow)' }}>
        <rect width="220" height="120" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} />
        <text x="15" y="25" fontSize="13" fontWeight="bold" fill={colors.textDefault}>Summary</text>
        <g clipPath="url(#transcriptClip)" transform="translate(15 40)">
            <rect x="0" y="0" width="190" height="6" rx="2" fill={colors.textMuted} opacity="0.7"/>
            <rect x="0" y="12" width="170" height="6" rx="2" fill={colors.textMuted} opacity="0.7"/>
            <rect x="0" y="24" width="190" height="6" rx="2" fill={colors.textMuted} opacity="0.7"/>
            <rect x="0" y="36" width="150" height="6" rx="2" fill={colors.textMuted} opacity="0.7"/>
            <rect x="0" y="48" width="180" height="6" rx="2" fill={colors.textMuted} opacity="0.7"/>
        </g>
      </g>

      {/* Action Items/Tasks Panel */}
      <g transform="translate(350 230)" style={{ filter: 'url(#meetingShadow)' }}>
        <rect width="220" height="120" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} />
        <text x="15" y="25" fontSize="13" fontWeight="bold" fill={colors.textDefault}>Action Items</text>
        {[
          "Follow up with Design Team",
          "Update project timeline",
          "Schedule client demo"
        ].map((item, i) => (
          <g key={i} transform={`translate(15 ${45 + i * 22})`}>
            <rect x="0" y="0" width="8" height="8" rx="1" fill={colors.textPrimary} opacity="0.7"/>
            <text x="15" y="7" fontSize="11" fill={colors.textMuted}>{item}</text>
          </g>
        ))}
      </g>
      
      {/* Connecting arrow */}
      <path d="M320 180 Q335 180 335 195 L335 215 Q335 230 350 230" stroke={colors.textPrimary} strokeWidth="2" fill="none" strokeDasharray="4 4" opacity="0.6"/>

    </svg>
  );
}
