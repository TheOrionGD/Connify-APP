import React from 'react';

/**
 * Connify Official Brand Logo:
 * Red Pin marker, peer nodes, and community handshake forming a heart-shield contour.
 */
export default function ConnifyLogo({ size = 38, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ verticalAlign: 'middle' }}
    >
      <g>
        {/* Map Pin Top Center */}
        <path
          d="M60 6C50 6 42 14 42 24C42 37 60 52 60 52C60 52 78 37 78 24C78 14 70 6 60 6ZM60 28.5C57.5 28.5 55.5 26.5 55.5 24C55.5 21.5 57.5 19.5 60 19.5C62.5 19.5 64.5 21.5 64.5 24C64.5 26.5 62.5 28.5 60 28.5Z"
          fill="#e11d48"
        />

        {/* Left Person Head */}
        <circle cx="31" cy="37" r="10" fill="#e11d48" />

        {/* Right Person Head */}
        <circle cx="89" cy="37" r="10" fill="#e11d48" />

        {/* Left Arm / Shoulder Body Arcing Down */}
        <path
          d="M24 50C16 57 16 66 23 75L38 88C43 93 51 93 56 88L62 82L49 71C46 68 46 63 50 60C53 56 58 57 61 60L74 71L70 56C69 51 64 48 59 48L32 48C29 48 26 49 24 50Z"
          fill="#e11d48"
        />

        {/* Right Arm / Shoulder Body Arcing Down & Shaking Hand */}
        <path
          d="M96 50C104 57 104 66 97 75L82 88C77 93 69 93 64 88L58 82L71 71C74 68 74 63 70 60C67 56 62 57 59 60L46 71L50 56C51 51 56 48 61 48L88 48C91 48 94 49 96 50Z"
          fill="#e11d48"
        />

        {/* Handshake fingers detail & heart bottom contour */}
        <path
          d="M45 84C42 81 42 76 46 73C49 70 54 70 57 73L60 76L63 73C66 70 71 70 74 73C78 76 78 81 75 84L62 96C61 97 59 97 58 96L45 84Z"
          fill="#be123c"
        />
        
        {/* Fingers grip line */}
        <circle cx="43" cy="78" r="3.5" fill="#ffffff" />
        <circle cx="48" cy="83" r="3.5" fill="#ffffff" />
        <circle cx="54" cy="87" r="3.5" fill="#ffffff" />
      </g>
    </svg>
  );
}
