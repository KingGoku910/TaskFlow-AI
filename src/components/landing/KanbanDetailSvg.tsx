// @/components/landing/KanbanDetailSvg.tsx
'use client';

import React from 'react';

export function KanbanDetailSvg() {
  const colors = {
    bgWindow: 'hsl(0 0% 100%)',
    bgColumn: 'hsl(240 4.8% 95.9%)', // Muted
    borderLight: 'hsl(240 5.9% 90%)',
    textPrimary: 'hsl(180 100% 25%)',
    textDefault: 'hsl(240 10% 3.9%)',
    textMuted: 'hsl(240 3.8% 46.1%)',
    shadow: 'rgba(0,0,0,0.1)',
    cardBlue: 'hsl(210 90% 70%)',
    cardGreen: 'hsl(140 60% 70%)',
    cardYellow: 'hsl(45 90% 70%)',
  };

  const columnData = [
    { title: 'Pending', x: 50, cards: [{ y: 60, h: 70, color: colors.cardYellow }, { y: 140, h: 50, color: colors.cardBlue }] },
    { title: 'In Progress', x: 220, cards: [{ y: 60, h: 90, color: colors.cardBlue }] },
    { title: 'Completed', x: 390, cards: [{ y: 60, h: 60, color: colors.cardGreen }, { y: 130, h: 70, color: colors.cardGreen }] },
  ];

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-lg mx-auto"
      aria-labelledby="kanbanDetailSvgTitle"
      role="img"
    >
      <title id="kanbanDetailSvgTitle">Illustration of an interactive Kanban board with columns and task cards</title>
      <defs>
        <filter id="kanbanShadow" x="-10%" y="-10%" width="120%" height="120%">
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
      <rect x="0" y="0" width="600" height="400" rx="10" fill={colors.bgWindow} />

      {/* Board Container */}
      <rect x="20" y="20" width="560" height="360" rx="8" fill={colors.bgWindow} stroke={colors.borderLight} strokeWidth="1" style={{filter: 'url(#kanbanShadow)'}}/>

      {columnData.map((col, colIndex) => (
        <g key={col.title}>
          {/* Column Background */}
          <rect x={col.x} y="30" width="160" height="330" rx="6" fill={colors.bgColumn} />
          {/* Column Title */}
          <text x={col.x + 80} y="55" textAnchor="middle" fontSize="14" fontWeight="500" fill={colors.textDefault}>
            {col.title}
          </text>

          {col.cards.map((card, cardIndex) => {
            const cardTitleText = `Task card: ${col.title} - Example ${cardIndex + 1}`;
            return (
            <rect
              key={`card-${colIndex}-${cardIndex}`}
              x={col.x + 10}
              y={card.y + 30} // Offset for title
              width="140"
              height={card.h}
              rx="4"
              fill={colors.bgWindow}
              stroke={colors.borderLight}
              strokeWidth="0.5"
              style={{ filter: 'url(#kanbanShadow)', cursor: 'grab' }}
            >
              <title>{cardTitleText}</title>
            </rect>
            );
          })}
          {/* Example content on first card of first column */}
          {colIndex === 0 && col.cards.length > 0 && (
            <>
              <rect x={col.x + 20} y={col.cards[0].y + 40} width="100" height="8" rx="2" fill={colors.textMuted} />
              <rect x={col.x + 20} y={col.cards[0].y + 55} width="120" height="6" rx="2" fill={colors.textMuted} opacity="0.7" />
              <rect x={col.x + 128} y={col.cards[0].y + 35} width="12" height="12" rx="3" fill={col.cards[0].color} />
            </>
          )}
           {/* Highlight one card as if being dragged */}
           {colIndex === 1 && col.cards.length > 0 && (
             <g transform="translate(5 5)">
                <rect
                    x={col.x + 10}
                    y={col.cards[0].y + 30}
                    width="140"
                    height={col.cards[0].h}
                    rx="4"
                    fill={colors.cardBlue}
                    fillOpacity="0.3"
                    stroke={colors.textPrimary}
                    strokeWidth="1.5"
                    style={{filter: 'url(#kanbanShadow)', cursor: 'grabbing', transform: 'rotate(-2deg)'}}
                />
             </g>
           )}
        </g>
      ))}

      {/* Decorative elements: Plus icon for adding task */}
      <circle cx="550" cy="50" r="12" fill={colors.textPrimary} opacity="0.8"/>
      <path d="M546 50h8M550 46v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>

    </svg>
  );
}
