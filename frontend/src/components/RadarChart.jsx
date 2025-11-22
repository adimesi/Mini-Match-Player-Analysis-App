import React from 'react';

// Simple SVG radar chart
const RadarChart = ({ labels = [], values = [], size = 260, maxValue = 100, levels = 4, stroke = '#1b5e20', fill = 'rgba(27,94,32,0.12)' }) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4; 
    const angleSlice = (Math.PI * 2) / labels.length;

    const levelPolygons = [];
    for (let lvl = levels; lvl >= 1; lvl--) {
        const r = (radius * lvl) / levels;
        const points = labels.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        levelPolygons.push(points);
    }

    const dataPoints = values.map((val, i) => {
        const v = Math.max(0, Math.min(val || 0, maxValue));
        const r = (v / maxValue) * radius;
        const angle = angleSlice * i - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g>
                {levelPolygons.map((pts, idx) => (
                    <polygon key={idx} points={pts} fill="none" stroke="#e6e6e6" strokeWidth={1} />
                ))}

                {/* Axes */}
                {labels.map((label, i) => {
                    const angle = angleSlice * i - Math.PI / 2;
                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);
                    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#f0f0f0" strokeWidth={1} />;
                })}

                {/* Data polygon */}
                <polygon points={dataPoints} fill={fill} stroke={stroke} strokeWidth={2} />

                {/* Data points */}
                {values.map((val, i) => {
                    const v = Math.max(0, Math.min(val || 0, maxValue));
                    const r = (v / maxValue) * radius;
                    const angle = angleSlice * i - Math.PI / 2;
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
                })}

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = angleSlice * i - Math.PI / 2;
                    const x = cx + (radius + 14) * Math.cos(angle);
                    const y = cy + (radius + 14) * Math.sin(angle);
                    const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end');
                    return (
                        <text key={i} x={x} y={y} fontSize="11" fill="#374151" textAnchor={anchor} dominantBaseline="middle">
                            {label}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
};

export default RadarChart;
