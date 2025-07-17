// @/components/landing/AnalyticsDetailSvg.tsx
'use client';

import React from 'react';

export function AnalyticsDetailSvg() {
  const colors = {
    bgWindow: 'hsl(0 0% 100%)',
    bgMuted: 'hsl(240 4.8% 95.9%)',
    borderLight: 'hsl(240 5.9% 90%)',
    textPrimary: 'hsl(180 100% 25%)',
    textDefault: 'hsl(240 10% 3.9%)',
    textMuted: 'hsl(240 3.8% 46.1%)',
    chart1: 'hsl(180 70% 50%)', // Teal
    chart2: 'hsl(210 80% 60%)', // Blue
    chart3: 'hsl(35 90% 65%)', // Yellow
    chartGrid: 'hsl(240 5.9% 85%)',
    shadow: 'rgba(0,0,0,0.1)'
  };

  const barData = [60, 80, 50, 90, 70];
  const lineData = [
    { x: 0, y: 50 }, { x: 1, y: 60 }, { x: 2, y: 40 }, { x: 3, y: 70 }, { x: 4, y: 65 },
    { x: 5, y: 80 }, { x: 6, y: 75 }
  ];

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-lg mx-auto"
      aria-labelledby="analyticsSvgTitle"
      role="img"
    >
      <title id="analyticsSvgTitle">Illustration of productivity analytics dashboard with charts and graphs</title>
      <defs>
         <filter id="chartShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
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

      {/* Main Dashboard Panel */}
      <rect x="30" y="30" width="540" height="340" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} style={{filter: 'url(#chartShadow)'}}/>
      <text x="50" y="60" fontSize="18" fontWeight="bold" fill={colors.textDefault}>Productivity Dashboard</text>

      {/* Bar Chart */}
      <g transform="translate(70 100)">
        <text x="0" y="-10" fontSize="12" fill={colors.textMuted}>Tasks Completed / Week</text>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(val => (
          <line key={`bar-grid-${val}`} x1="0" y1={120 - val * 100} x2="200" y2={120 - val * 100} stroke={colors.chartGrid} strokeWidth="0.5" />
        ))}
        <line x1="0" y1="120" x2="200" y2="120" stroke={colors.textMuted} strokeWidth="1" /> {/* X-axis */}
        <line x1="0" y1="20" x2="0" y2="120" stroke={colors.textMuted} strokeWidth="1" /> {/* Y-axis */}

        {barData.map((val, index) => (
          <rect
            key={`bar-${index}`}
            x={index * 40 + 5}
            y={120 - val}
            width="30"
            height={val}
            fill={colors.chart1}
            rx="2"
          >
            <animate attributeName="height" from="0" to={val} dur="0.5s" fill="freeze" begin={`${index*0.1}s`} />
            <animate attributeName="y" from="120" to={120-val} dur="0.5s" fill="freeze" begin={`${index*0.1}s`} />
          </rect>
        ))}
      </g>

      {/* Line Chart */}
      <g transform="translate(330 100)">
        <text x="0" y="-10" fontSize="12" fill={colors.textMuted}>Focus Hours / Day</text>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(val => (
          <line key={`line-grid-${val}`} x1="0" y1={120 - val * 100} x2="200" y2={120 - val * 100} stroke={colors.chartGrid} strokeWidth="0.5" />
        ))}
        <line x1="0" y1="120" x2="200" y2="120" stroke={colors.textMuted} strokeWidth="1" /> {/* X-axis */}
        <line x1="0" y1="20" x2="0" y2="120" stroke={colors.textMuted} strokeWidth="1" /> {/* Y-axis */}

        <polyline
          points={lineData.map(p => `${p.x * (200/6)} ${120 - p.y * (100/100)}`).join(' ')}
          fill="none"
          stroke={colors.chart2}
          strokeWidth="2"
        >
            <animate attributeName="points" from={lineData.map(p => `${p.x * (200/6)} 120`).join(' ')} to={lineData.map(p => `${p.x * (200/6)} ${120 - p.y * (100/100)}`).join(' ')} dur="1s" fill="freeze" />
        </polyline>
        {lineData.map((p, index) => (
          <circle key={`dot-${index}`} cx={p.x * (200/6)} cy={120 - p.y * (100/100)} r="3" fill={colors.chart2}>
             <animate attributeName="cy" from="120" to={120 - p.y * (100/100)} dur="1s" fill="freeze" />
          </circle>
        ))}
      </g>

      {/* Pie Chart (Simplified) */}
      <g transform="translate(170 290)">
        <text x="0" y="-10" fontSize="12" fill={colors.textMuted}>Project Time Allocation</text>
        <circle cx="50" cy="50" r="40" fill={colors.chart1} />
        <path d="M50 50 L50 10 A40 40 0 0 1 84.6 27.6 Z" fill={colors.chart2} />
        <path d="M50 50 L84.6 27.6 A40 40 0 0 1 78 76 Z" fill={colors.chart3} />
        <circle cx="50" cy="50" r="20" fill={colors.bgWindow} />
      </g>

      {/* Key Metrics / KPIs */}
      <g transform="translate(330 260)">
        {[{label: "Completion Rate", value: "85%", y:0, color: colors.textPrimary},
          {label: "Avg. Task Time", value: "3.2h", y:35, color: colors.textDefault},
          {label: "Overdue Tasks", value: "3", y:70, color: "hsl(0 70% 60%)"}].map((kpi, index) => (
            <g key={kpi.label} transform={`translate(0, ${kpi.y})`}>
                 <rect x="0" y="0" width="200" height="25" rx="4" fill={colors.bgMuted} />
                 <text x="10" y="17" fontSize="11" fill={colors.textMuted}>{kpi.label}</text>
                 <text x="190" y="17" fontSize="12" fontWeight="bold" textAnchor="end" fill={kpi.color}>{kpi.value}</text>
            </g>
        ))}
      </g>
    </svg>
  );
}
