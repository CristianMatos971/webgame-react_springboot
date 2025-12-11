import React, { useEffect, useState } from 'react';
import { gameEvents } from '../game/events/GameEventManager';

export const Hud = () => {
    const [isDashing, setIsDashing] = useState(false);

    useEffect(() => {
        const onDash = (durationMs) => {
            setIsDashing(true);
            setTimeout(() => setIsDashing(false), durationMs);
        };

        gameEvents.on('PLAYER_DASH', onDash);
        return () => gameEvents.off('PLAYER_DASH', onDash);
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between">

            <div className="self-end text-white font-bold bg-black/50 p-2 rounded">
                Leaderboard (WIP)
            </div>

            {/* Bottom: Skills and Status */}
            <div className="flex gap-4 items-end">
                {/* Dash Widget */}
                <div className="relative w-16 h-16 bg-gray-900 border-2 border-gray-600 rounded-lg flex items-center justify-center overflow-hidden shadow-lg transition-transform transform">

                    {/* icon */}
                    <span className="text-2xl z-10">🏃</span>

                    <div
                        className={`absolute bottom-0 left-0 w-full bg-blue-500/50 transition-all ease-linear`}
                        style={{
                            height: isDashing ? '100%' : '0%',
                            transitionDuration: isDashing ? '0s' : '0.5s' // Reset instantâneo, ou fade out
                        }}
                    />

                    <span className="absolute top-0 left-1 text-xs text-gray-400 font-mono">SPC</span>
                </div>

                {/* Future: Health Bar */}
                <div className="w-64 h-6 bg-gray-800 rounded border border-gray-600 relative overflow-hidden">
                    <div className="h-full bg-red-600 w-full" />
                    <span className="absolute inset-0 text-xs text-white flex items-center justify-center font-bold">100 / 100</span>
                </div>
            </div>
        </div>
    );
};