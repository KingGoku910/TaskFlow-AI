// @/components/landing/TaskManagementDetailSvg.tsx
'use client';

import React from 'react';

export function TaskManagementDetailSvg() {
  const colors = {
    bgWindow: 'hsl(0 0% 100%)',
    bgMuted: 'hsl(240 4.8% 95.9%)',
    borderLight: 'hsl(240 5.9% 90%)',
    textPrimary: 'hsl(180 100% 25%)',
    textDefault: 'hsl(240 10% 3.9%)',
    textMuted: 'hsl(240 3.8% 46.1%)',
    shadow: 'rgba(0,0,0,0.1)',
    priorityHigh: 'hsl(0 70% 60%)',
    priorityMedium: 'hsl(35 80% 60%)',
    priorityLow: 'hsl(100 50% 60%)',
    calendarAccent: 'hsl(210 90% 60%)',
  };

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-lg mx-auto"
      aria-labelledby="taskManagementSvgTitle"
      role="img"
    >
      <title id="taskManagementSvgTitle">Illustration of comprehensive task management features</title>
      <defs>
        <filter id="detailShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="1" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="600" height="400" rx="10" fill={colors.bgMuted} />

      {/* Main Task Card Element */}
      <g transform="translate(100 70)" style={{ filter: 'url(#detailShadow)' }}>
        <rect width="400" height="260" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} />

        {/* Card Header */}
        <rect x="0" y="0" width="400" height="50" fill={colors.textPrimary} rx="8" ry="8"/>
        <text x="20" y="30" fill="white" fontSize="16" fontWeight="bold">Plan Q3 Marketing Campaign</text>
        <circle cx="370" cy="25" r="8" fill={colors.priorityHigh} />
        <text x="370" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">H</text>

        {/* Card Body */}
        <g transform="translate(20 70)">
          {/* Description */}
          <text x="0" y="0" fill={colors.textDefault} fontSize="13" fontWeight="500">Description:</text>
          <rect x="0" y="15" width="360" height="8" rx="2" fill={colors.textMuted} opacity="0.5"/>
          <rect x="0" y="28" width="320" height="8" rx="2" fill={colors.textMuted} opacity="0.5"/>

          {/* Checklist */}
          <text x="0" y="60" fill={colors.textDefault} fontSize="13" fontWeight="500">Checklist:</text>
          {[
            { text: "Define target audience", checked: true, y: 75 },
            { text: "Draft ad copy", checked: true, y: 95 },
            { text: "Design visuals", checked: false, y: 115 },
            { text: "Schedule posts", checked: false, y: 135 },
          ].map((item, i) => (
            <g key={i} transform={`translate(0 ${item.y})`}>
              <rect x="0" y="0" width="12" height="12" rx="2" fill={item.checked ? colors.textPrimary : colors.borderLight} stroke={colors.borderLight}/>
              {item.checked && <path d="M2 6 L5 9 L10 4" stroke="white" strokeWidth="1.5" fill="none" transform="translate(0.5 0.5)"/>}
              <text x="20" y="10" fill={item.checked ? colors.textMuted : colors.textDefault} fontSize="12" className={item.checked ? 'line-through' : ''}>{item.text}</text>
            </g>
          ))}

          {/* Deadline */}
          <g transform="translate(230 60)">
             <path d="M5 0 V-3 M15 0 V-3 M0 5 H20" stroke={colors.calendarAccent} strokeWidth="1" transform="translate(0 10)"/>
             <rect width="20" height="20" rx="3" fill="none" stroke={colors.calendarAccent} strokeWidth="1.5" transform="translate(0 10)"/>
             <text x="10" y="21" textAnchor="middle" fill={colors.calendarAccent} fontSize="10" fontWeight="bold">28</text>
            <text x="30" y="23" fill={colors.textDefault} fontSize="12" fontWeight="bold">Deadline: Aug 28</text>
          </g>
        </g>
      </g>

      {/* Floating "Add Task" button */}
      <g transform="translate(480 320)" style={{ cursor: 'pointer', filter: 'url(#detailShadow)' }}>
        <circle cx="0" cy="0" r="25" fill={colors.textPrimary} />
        <path d="M-10 0 H10 M0 -10 V10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <title>Add New Task Button</title>
      </g>

      {/* Small decorative elements */}
      <rect x="30" y="30" width="50" height="50" rx="5" fill={colors.priorityMedium} opacity="0.2" transform="rotate(-10 55 55)" />
      <circle cx="550" cy="50" r="15" fill={colors.priorityLow} opacity="0.3" />

    </svg>
  );
}
