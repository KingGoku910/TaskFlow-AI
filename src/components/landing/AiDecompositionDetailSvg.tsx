// @/components/landing/AiDecompositionDetailSvg.tsx
'use client';

import React from 'react';

export function AiDecompositionDetailSvg() {
  const colors = {
    bgWindow: 'hsl(0 0% 100%)',
    bgSidebar: 'hsl(240 4.8% 95.9%)',
    borderLight: 'hsl(240 5.9% 90%)',
    textPrimary: 'hsl(180 100% 25%)',
    textDefault: 'hsl(240 10% 3.9%)',
    textMuted: 'hsl(240 3.8% 46.1%)',
    shadow: 'rgba(0,0,0,0.1)',
    accentBlue: 'hsl(210 90% 60%)',
    accentGreen: 'hsl(140 60% 55%)',
    accentPurple: 'hsl(270 70% 70%)',
  };

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-lg mx-auto"
      aria-labelledby="aiDecompositionSvgTitle"
      role="img"
    >
      <title id="aiDecompositionSvgTitle">Illustration of AI breaking a large task into smaller subtasks</title>
      <defs>
        <filter id="detailDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="1" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.accentPurple} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={colors.accentBlue} stopOpacity="0.7"/>
        </linearGradient>
      </defs>

      {/* Background Rect */}
      <rect x="0" y="0" width="600" height="400" rx="10" fill={colors.bgSidebar} />

      {/* Central "Brain" or "AI Core" element */}
      <circle cx="300" cy="200" r="60" fill="url(#brainGradient)" style={{ filter: 'url(#detailDropShadow)' }} />
      <path d="M270 180 Q300 150 330 180 M275 195 Q300 170 325 195 M270 210 Q300 230 330 210 M275 225 Q300 245 325 225" stroke="white" strokeWidth="2" fill="none" opacity="0.6"/>
      <circle cx="300" cy="200" r="50" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeDasharray="5 5" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite"/>
      </circle>


      {/* Large Task Input */}
      <g transform="translate(50 80)">
        <rect width="200" height="50" rx="5" fill={colors.bgWindow} stroke={colors.borderLight} style={{ filter: 'url(#detailDropShadow)' }} />
        <text x="100" y="30" textAnchor="middle" fill={colors.textDefault} fontSize="14" fontWeight="bold">Large Objective</text>
         <path d="M100 50 v 30" stroke={colors.textMuted} strokeWidth="2" strokeDasharray="4 2"/>
      </g>

      {/* Connecting line from Brain to Large Task */}
      <path d="M250 170 Q150 150 150 130" stroke={colors.accentBlue} strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.8"/>


      {/* Subtasks Output */}
      {[
        { x: 380, y: 60, text: "Subtask 1", icon: "M10 10 L15 15 M10 15 L15 10", color: colors.accentGreen },
        { x: 420, y: 130, text: "Subtask 2", icon: "M10 12 H20 M10 18 H20", color: colors.accentGreen },
        { x: 380, y: 200, text: "Subtask 3", icon: "M15 10 A5 5 0 1 1 14.9 20", color: colors.accentGreen },
        { x: 420, y: 270, text: "Subtask 4", icon: "M10 10 L20 10 L15 20 Z", color: colors.accentGreen },
      ].map((task, index) => (
        <g key={index} transform={`translate(${task.x} ${task.y})`}>
          <rect width="150" height="40" rx="5" fill={colors.bgWindow} stroke={colors.borderLight} style={{ filter: 'url(#detailDropShadow)' }}/>
          <rect x="5" y="13" width="14" height="14" rx="2" fill={task.color} fillOpacity="0.3" />
          <path d={task.icon} stroke={task.color} strokeWidth="1.5" fill="none" transform="translate(7 15) scale(0.6)" />
          <text x="30" y="25" fill={colors.textMuted} fontSize="12">{task.text}</text>
          {/* Connecting lines from AI Core to subtasks */}
          <path d={`M${300-task.x} ${200-task.y+20} Q${(300-task.x)/2} ${(200-task.y+20)/2+Math.sin(index)*30} 0 0`} stroke={colors.accentBlue} strokeWidth="1.5" fill="none" strokeDasharray="3,3" opacity="0.7"/>
        </g>
      ))}

      {/* Decorative elements */}
      <circle cx="50" cy="350" r="15" fill={colors.textPrimary} opacity="0.2" />
      <rect x="530" y="30" width="30" height="30" rx="5" fill={colors.accentGreen} opacity="0.2" transform="rotate(15 545 45)" />
    </svg>
  );
}
