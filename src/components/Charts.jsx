import React, { useState } from 'react';

// Reusable SVG Bar Chart
export const BarChart = ({ data = [], height = 180, color = 'var(--primary)' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (data.length === 0) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>;

  const maxVal = Math.max(...data.map(d => d.value)) || 1;
  const padding = 30;
  const chartHeight = height - padding * 2;
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* Draw horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={i}>
              <line x1="40" y1={y} x2="100%" y2={y} stroke="var(--surface-border)" strokeWidth="1" strokeDasharray="3,3" />
              <text x="5" y={y + 4} fill="var(--text-muted)" fontSize="10">{gridVal}</text>
            </g>
          );
        })}

        {/* Draw bars */}
        {data.map((item, idx) => {
          const barWidthPercent = 70 / data.length; // width of each bar in percentage
          const spacingPercent = 30 / (data.length + 1); // gap percentage
          
          const xPercent = spacingPercent + idx * (barWidthPercent + spacingPercent);
          const barHeight = (item.value / maxVal) * chartHeight;
          const y = padding + chartHeight - barHeight;

          return (
            <g key={idx}>
              <rect
                x={`${xPercent}%`}
                y={y}
                width={`${barWidthPercent}%`}
                height={barHeight}
                fill={hoveredIdx === idx ? 'var(--primary-hover)' : color}
                rx="4"
                style={{ cursor: 'pointer', transition: 'height 0.3s ease, y 0.3s ease, fill 0.2s' }}
                onMouseEnter={(e) => {
                  setHoveredIdx(idx);
                  const bounds = e.target.getBoundingClientRect();
                  const container = e.target.ownerSVGElement.parentNode.getBoundingClientRect();
                  setTooltipPos({
                    x: bounds.left - container.left + bounds.width / 2,
                    y: bounds.top - container.top - 35
                  });
                }}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text
                x={`${xPercent + barWidthPercent / 2}%`}
                y={height - 5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="10"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10
          }}
        >
          <strong>{data[hoveredIdx].label}</strong>: {data[hoveredIdx].value}
        </div>
      )}
    </div>
  );
};

// Reusable SVG Line Chart
export const LineChart = ({ data = [], height = 180, color = 'var(--primary)' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (data.length === 0) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>;

  const maxVal = Math.max(...data.map(d => d.value)) || 1;
  const padding = 30;
  const chartHeight = height - padding * 2;
  
  // Calculate points
  const points = data.map((item, idx) => {
    const xPercent = (idx / (data.length - 1)) * 85 + 10; // offset left and right
    const y = padding + chartHeight * (1 - (item.value / maxVal));
    return { xPercent, y, item, idx };
  });

  // Generate SVG path string
  const pathD = points.reduce((acc, pt, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${pt.xPercent}% ${pt.y}`;
  }, '');

  // Generate Area path string
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].xPercent}% ${padding + chartHeight} L ${points[0].xPercent}% ${padding + chartHeight} Z`
    : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={i}>
              <line x1="30" y1={y} x2="95%" y2={y} stroke="var(--surface-border)" strokeWidth="1" strokeDasharray="3,3" />
              <text x="5" y={y + 4} fill="var(--text-muted)" fontSize="10">{gridVal}</text>
            </g>
          );
        })}

        {/* Fill Area below line */}
        <path d={areaD} fill={`${color}15`} style={{ transition: 'd 0.3s' }} />

        {/* Draw main line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'd 0.3s' }} />

        {/* Draw interactive hover points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={`${pt.xPercent}%`}
              cy={pt.y}
              r={hoveredIdx === idx ? 6 : 4}
              fill={hoveredIdx === idx ? color : 'var(--surface)'}
              stroke={color}
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.15s, fill 0.15s' }}
              onMouseEnter={(e) => {
                setHoveredIdx(idx);
                const bounds = e.target.getBoundingClientRect();
                const container = e.target.ownerSVGElement.parentNode.getBoundingClientRect();
                setTooltipPos({
                  x: bounds.left - container.left + bounds.width / 2,
                  y: bounds.top - container.top - 35
                });
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {idx % Math.ceil(data.length / 5) === 0 && (
              <text
                x={`${pt.xPercent}%`}
                y={height - 5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="10"
              >
                {pt.item.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10
          }}
        >
          <strong>{data[hoveredIdx].label}</strong>: {data[hoveredIdx].value}
        </div>
      )}
    </div>
  );
};

// Reusable SVG Donut / Pie Chart
export const DonutChart = ({ data = [], height = 180, title = 'Total' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height }}>
      <div style={{ position: 'relative', width: height, height }}>
        <svg width={height} height={height} viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const strokeDash = (percentage / 100) * circumference;
            const offset = currentOffset;
            currentOffset += strokeDash;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={item.color || 'var(--primary)'}
                strokeWidth={isHovered ? 14 : 10}
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={-offset}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
        {/* Centered text in donut hole */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            {hoveredIdx !== null ? data[hoveredIdx].label : title}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            {hoveredIdx !== null ? `${data[hoveredIdx].value}` : `${total}`}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '50%' }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: hoveredIdx === idx ? 700 : 'normal',
              color: hoveredIdx === idx ? 'var(--text-main)' : 'var(--text-muted)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {item.label}: {item.value} ({((item.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mini sparkline for KPI cards
export const Sparkline = ({ data = [], width = 72, height = 28, color = 'var(--primary)' }) => {
  if (!data.length) return null;

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;
  const pad = 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((val, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = pad + innerH - ((val - minVal) / range) * innerH;
    return `${x},${y}`;
  }).join(' ');

  const last = data[data.length - 1];
  const first = data[0];
  const trendUp = last >= first;

  return (
    <svg width={width} height={height} className="kpi-sparkline" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={trendUp ? 1 : 0.7}
      />
    </svg>
  );
};
