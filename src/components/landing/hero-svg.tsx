
// @/components/landing/hero-svg.tsx
'use client';

import React from 'react';

export function HeroSvg() {
  // Using HSL values from globals.css (light theme context of landing page)
  const colors = {
    bgWindow: 'hsl(0 0% 100%)', // card background
    bgSidebar: 'hsl(240 4.8% 95.9%)', // muted
    bgHeader: 'hsl(0 0% 100%)',
    borderLight: 'hsl(240 5.9% 90%)', // border
    borderDark: 'hsl(240 3.7% 80%)',
    textPrimary: 'hsl(180 100% 25%)', // primary
    textDefault: 'hsl(240 10% 3.9%)', // foreground
    textMuted: 'hsl(240 3.8% 46.1%)', // muted-foreground
    shadow: 'rgba(0,0,0,0.1)',
    green: 'hsl(140 60% 60%)',
    yellow: 'hsl(45 90% 60%)',
    blue: 'hsl(210 90% 60%)',
    purple: 'hsl(270 70% 70%)',
  };

  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-xl shadow-2xl"
      aria-labelledby="heroSvgTitle"
      role="img"
    >
      <title id="heroSvgTitle">Illustration of a task management application interface</title>
      <defs>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background elements */}
      <circle cx="100" cy="500" r="30" fill={colors.blue} opacity="0.3" />
      <rect x="700" y="80" width="50" height="50" rx="10" fill={colors.purple} opacity="0.3" transform="rotate(30 725 105)" />
      <path d="M50 50 Q 80 20 110 50 T 170 50" stroke={colors.green} strokeWidth="3" fill="none" opacity="0.2" />


      {/* Main application window */}
      <rect x="50" y="50" width="700" height="500" rx="20" fill={colors.bgWindow} stroke={colors.borderLight} strokeWidth="1" style={{ filter: 'url(#dropShadow)' }} />

      {/* Sidebar */}
      <rect x="50" y="50" width="180" height="500" rx="20" ry="20" fill={colors.bgSidebar} clipPath="url(#sidebarClip)" />
       <clipPath id="sidebarClip">
        <rect x="50" y="50" width="180" height="500" rx="20" ry="20"/>
      </clipPath>

      {/* Sidebar Header/Logo */}
      <circle cx="85" cy="85" r="12" fill={colors.textPrimary} />
      <rect x="105" y="78" width="90" height="14" rx="3" fill={colors.textDefault} opacity="0.8" />

      {/* Sidebar Menu Items */}
      {[120, 150, 180, 210, 240, 270].map((y, i) => (
        <React.Fragment key={`sidebar-item-${i}`}>
          <rect x="70" y={y} width="20" height="20" rx="4" fill={colors.textDefault} opacity="0.3" />
          <rect x="100" y={y + 3} width="100" height="14" rx="3" fill={colors.textDefault} opacity={i === 0 ? 0.7 : 0.4} />
        </React.Fragment>
      ))}
      <rect x="65" y="118" width="150" height="24" rx="5" fill={colors.textPrimary} fillOpacity="0.1" stroke={colors.textPrimary} strokeWidth="1" />

      {/* Main Content Area */}
      {/* Header */}
      <rect x="240" y="60" width="490" height="50" fill={colors.bgHeader} />
      <rect x="260" y="75" width="150" height="20" rx="4" fill={colors.textDefault} opacity="0.8" />
      <circle cx="690" cy="85" r="12" fill={colors.textMuted} />
      <circle cx="660" cy="85" r="12" fill={colors.textMuted} />

      {/* Kanban Columns */}
      {[{ x: 250, title: "Pending" }, { x: 430, title: "In Progress" }, { x: 610, title: "Completed" }].map((col, i) => (
        <React.Fragment key={`col-${i}`}>
          <text x={col.x} y="145" fontSize="14" fontWeight="500" fill={colors.textDefault}>{col.title}</text>
          <rect x={col.x} y="160" width="150" height="360" rx="8" fill={colors.bgSidebar} opacity="0.5" />
          {/* Task Cards */}
          {[
            { y: 170, h: 60, tagColor: colors.blue },
            { y: 240, h: 80, tagColor: colors.yellow },
            { y: 330, h: 50, tagColor: colors.green }
          ].map((card, j) => {
            const cardTitleText = `Task card for ${col.title}`;
            return (
              <rect key={`card-${i}-${j}`} x={col.x + 10} y={card.y} width="130" height={card.h} rx="6" fill={colors.bgWindow} stroke={colors.borderLight} strokeWidth="0.5">
                <title>{cardTitleText}</title>
              </rect>
            );
          })}
           {/* Example content on first card of first column */}
           { i === 0 && (
            <>
              <rect x={col.x + 20} y="180" width="90" height="8" rx="2" fill={colors.textMuted} />
              <rect x={col.x + 20} y="195" width="110" height="6" rx="2" fill={colors.textMuted} opacity="0.7" />
              <rect x={col.x + 20} y="205" width="70" height="6" rx="2" fill={colors.textMuted} opacity="0.7" />
              <rect x={col.x + 118} y="175" width="12" height="12" rx="3" fill={colors.blue} />
            </>
           )}
           { i === 1 && (
            <>
              <rect x={col.x + 20} y="250" width="90" height="8" rx="2" fill={colors.textMuted} />
              <rect x={col.x + 20} y="265" width="100" height="6" rx="2" fill={colors.textMuted} opacity="0.7" />
              <rect x={col.x + 118} y="245" width="12" height="12" rx="3" fill={colors.yellow} />
            </>
           )}
        </React.Fragment>
      ))}


      {/* Floating card element example */}
      <g style={{ filter: 'url(#dropShadow)' }} opacity="0.9">
        <rect x="300" y="380" width="220" height="120" rx="10" fill={colors.bgWindow} stroke={colors.borderDark} strokeWidth="0.5" />
        <text x="315" y="405" fontSize="13" fontWeight="bold" fill={colors.textPrimary}>Project Summary</text>
        <rect x="315" y="420" width="80" height="8" rx="2" fill={colors.textMuted} />
        <rect x="315" y="435" width="180" height="6" rx="2" fill={colors.textMuted} opacity="0.7" />
        <rect x="315" y="448" width="180" height="6" rx="2" fill={colors.textMuted} opacity="0.7" />
        <rect x="315" y="465" width="40" height="20" rx="4" fill={colors.textPrimary} fillOpacity="0.8" />
        <text x="320" y="479" fontSize="10" fill="white">View</text>
      </g>

      {/* Small decorative elements */}
      <circle cx="255" cy="70" r="3" fill={colors.green} />
      <circle cx="720" cy="530" r="4" fill={colors.yellow} />
      <path d="M600 500 L610 510 L600 520" stroke={colors.blue} strokeWidth="2" fill="none" opacity="0.5" />

    </svg>
  );
}
