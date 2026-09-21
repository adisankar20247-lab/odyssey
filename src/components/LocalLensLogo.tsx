import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightMode?: boolean;
}

export const LocalLensLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  lightMode = false
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' }
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision SVG matching uploaded Local Lens Logo */}
      <svg
        width={dim.icon}
        height={dim.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      >
        {/* Outer Location Pin Ring with dynamic coastal swoop */}
        <path
          d="M50 8C31.2 8 16 23.2 16 42C16 63 46 88 50 92C54 88 84 63 84 42C84 23.2 68.8 8 50 8Z"
          stroke={lightMode ? "#38BDF8" : "#0F2942"}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={lightMode ? "#0F2942" : "#FFFFFF"}
        />
        {/* Inner dynamic camera lens swoop */}
        <path
          d="M26 48C28 62 40 70 52 68C61 66.5 68 59 70 51"
          stroke={lightMode ? "#34D399" : "#0D9488"}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Camera body */}
        <rect
          x="30"
          y="32"
          width="40"
          height="28"
          rx="5"
          fill={lightMode ? "#F8FAFC" : "#0F2942"}
        />
        {/* Camera flash / top notch */}
        <path
          d="M40 32V29C40 27.5 41.5 26 43 26H57C58.5 26 60 27.5 60 29V32H40Z"
          fill={lightMode ? "#F8FAFC" : "#0F2942"}
        />
        {/* Central Camera Lens */}
        <circle
          cx="50"
          cy="46"
          r="8.5"
          fill={lightMode ? "#0F2942" : "#FFFFFF"}
          stroke={lightMode ? "#38BDF8" : "#0D9488"}
          strokeWidth="2.5"
        />
        {/* Lens reflection dot */}
        <circle
          cx="52.5"
          cy="43.5"
          r="2"
          fill={lightMode ? "#38BDF8" : "#0F2942"}
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={`font-extrabold tracking-tight ${dim.text} ${
                lightMode ? 'text-white' : 'text-[#0F2942]'
              }`}
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
            >
              Local<span className="text-[#0D9488] ml-1">Lens</span>
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Pilot
            </span>
          </div>
          <span
            className={`font-medium tracking-wide ${dim.sub} ${
              lightMode ? 'text-emerald-300' : 'text-slate-500'
            }`}
          >
            Responsible Kerala Tourism
          </span>
        </div>
      )}
    </div>
  );
};
