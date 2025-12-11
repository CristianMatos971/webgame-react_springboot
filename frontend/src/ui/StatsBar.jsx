import React from 'react';
import statsPlaceholder from '../assets/ui/stats_placeholder.png';

const StatsBar = ({ label, value, max, colorClass, icon }) => {
    const safeValue = isNaN(value) ? 0 : value;

    // Calculate width percentage (clamped between 0 and 100)
    const percent = Math.max(0, Math.min(100, (safeValue / max) * 100));

    return (
        <div className="relative w-[180px] h-[40px] group cursor-help" title={label}>

            {/* Layer 1: Pixel Art Frame (Top) */}
            <img
                src={statsPlaceholder}
                alt="Frame"
                className="absolute inset-0 w-full h-full z-10 pixelated pointer-events-none"
            />

            {/* Layer 2: Colored Bar (Background) */}
            {/* Inset adjusted to 4px to fit inside the frame border */}
            <div className="absolute top-[4px] bottom-[4px] left-[4px] right-[4px] z-0 bg-gray-900/50">
                <div
                    className={`h-full ${colorClass} transition-all duration-300 ease-out origin-left`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* Layer 3: Text/Icon Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center text-xs font-pixel text-white drop-shadow-md">

                <div className="flex items-center gap-2">
                    {/* Icon always visible */}
                    <span className="text-base filter drop-shadow-sm">{icon}</span>

                    {/* Value visible on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 px-1 rounded">
                        {Math.floor(safeValue)}/{max}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatsBar;