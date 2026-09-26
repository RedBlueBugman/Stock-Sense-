import React from 'react';

interface QRCodeDisplayProps {
  sku: string;
  className?: string;
  size?: number;
}

// Generate realistic deterministic QR matrix patterns based on SKU string
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ sku, className = '', size = 100 }) => {
  // Simple deterministic hash to build a crisp 21x21 QR code matrix
  const matrixSize = 21;
  const grid: boolean[][] = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(false));

  // 1. Finder patterns (Top-Left, Top-Right, Bottom-Left)
  const drawFinderPattern = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinderPattern(0, 0); // Top-left
  drawFinderPattern(0, 14); // Top-right
  drawFinderPattern(14, 0); // Bottom-left

  // 2. Timing patterns
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Fill data modules deterministically using SKU characters
  let seed = 0;
  for (let i = 0; i < sku.length; i++) {
    seed = (seed << 5) - seed + sku.charCodeAt(i);
    seed |= 0;
  }

  let lcg = Math.abs(seed);
  const nextRandom = () => {
    lcg = (lcg * 1664525 + 1013904223) % 4294967296;
    return lcg / 4294967296;
  };

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Avoid finder patterns and separators
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= 13;
      const inBL = r >= 13 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        grid[r][c] = nextRandom() > 0.45;
      }
    }
  }

  return (
    <div 
      className={`relative flex items-center justify-center bg-white p-2 rounded-lg shadow-inner ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox={`0 0 ${matrixSize} ${matrixSize}`} 
        className="w-full h-full text-slate-900" 
        shapeRendering="crispEdges"
      >
        {grid.map((row, r) =>
          row.map((filled, c) => (
            filled ? (
              <rect 
                key={`${r}-${c}`} 
                x={c} 
                y={r} 
                width="1.02" 
                height="1.02" 
                fill="currentColor" 
              />
            ) : null
          ))
        )}
      </svg>
      {/* Subtle center logo accent */}
      <div className="absolute inset-0 m-auto w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-[10px] text-white font-black shadow-sm pointer-events-none">
        SS
      </div>
    </div>
  );
};
