import React, { useEffect, useState } from 'react';
import { gameEvents } from '../game/events/GameEventManager';
import StatsBar from './StatsBar';
import InventorySlot from './InventorySlot';
import tempItemIcon from '../assets/ui/stats_placeholder.png';
import dashIcon from "../assets/ui/dash_icon.png";

export const Hud = () => {
    const [isDashing, setIsDashing] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState(0);

    const [stats, setStats] = useState({
        health: 100, maxHealth: 100,
        hunger: 80, maxHunger: 100,
        thirst: 100, maxThirst: 100,
        temperature: 100, maxTemperature: 100,
        stamina: 100, maxStamina: 100
    });

    // Inventory State (10 slots)
    const [inventory, setInventory] = useState([
        { id: 1, name: 'Wood', count: 5, icon: tempItemIcon },
        { id: 2, name: 'Potion', count: 1, icon: tempItemIcon },
        null, null, null, null, null, null, null, null
    ]);

    useEffect(() => {
        const onDash = (durationMs) => {
            setIsDashing(true);
            setTimeout(() => setIsDashing(false), durationMs);
        };

        const onStatsUpdate = (dto) => {
            setStats(prev => ({
                ...prev,
                health: dto.health,
                stamina: dto.stamina,
                hunger: dto.hunger,
                thirst: dto.thirst,
                temperature: dto.temperature
            }));
        };

        gameEvents.on('PLAYER_DASH', onDash);
        gameEvents.on('PLAYER_STATS_UPDATE', onStatsUpdate);

        return () => {
            gameEvents.off('PLAYER_DASH', onDash);
            gameEvents.off('PLAYER_STATS_UPDATE', onStatsUpdate);
        };
    }, []);

    // Keyboard Input for Inventory Selection
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = parseInt(e.key);
            if (!isNaN(key) && key >= 0 && key <= 9) {
                const newIndex = key === 0 ? 9 : key - 1;
                setActiveSlotIndex(newIndex);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between font-pixel">

            {/* --- TOP RIGHT: LEADERBOARD --- */}
            <div className="self-end text-white text-sm bg-black/50 p-3 border border-gray-600 pixelated pointer-events-auto">
                Leaderboard (WIP)
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="flex items-end gap-6 pointer-events-auto w-full">

                {/* DASH WIDGET (Bottom Left) */}
                {/* SIZE: 80px (w-20 h-20) */}
                <div className="relative w-20 h-20 bg-gray-900 border-4 border-gray-700 flex items-center justify-center overflow-hidden shadow-xl pixelated flex-shrink-0">
                    <span className="text-4xl z-10 filter drop-shadow-md"><img src={dashIcon} alt="dash_icon" className="w-full h-full object-contain pixelated filter drop-shadow-sm" /></span>
                    <div
                        className={`absolute bottom-0 left-0 w-full bg-blue-500/50 transition-all ease-linear`}
                        style={{ height: isDashing ? '100%' : '0%', transitionDuration: isDashing ? '0s' : '0.5s' }}
                    />
                    <span className="absolute top-1 left-1 text-xs text-gray-400">SPC</span>
                </div>

                {/* STATS BARS (Horizontal Layout) */}
                {/* Placed right next to Dash Widget */}
                <div className="flex flex-row gap-2 pb-1 flex-shrink-0">
                    <StatsBar label="Health" value={stats.health} max={stats.maxHealth} colorClass="bg-red-600" icon="❤️" />
                    <StatsBar label="Stamina" value={stats.stamina} max={stats.maxStamina} colorClass="bg-slate-400" icon="⚡" />
                    <StatsBar label="Hunger" value={stats.hunger} max={stats.maxHunger} colorClass="bg-amber-600" icon="🍖" />
                    <StatsBar label="Thirst" value={stats.thirst} max={stats.maxThirst} colorClass="bg-blue-500" icon="💧" />
                    <StatsBar label="Temperature" value={stats.temperature} max={stats.maxTemperature} colorClass="bg-cyan-400" icon="❄️" />
                </div>

                {/* INVENTORY BAR */}
                {/* Removed black background. Added margin-left to separate from stats. */}
                <div className="flex gap-1 ml-auto pb-0">
                    {inventory.map((item, index) => (
                        <InventorySlot
                            key={index}
                            index={index}
                            item={item}
                            isActive={activeSlotIndex === index}
                            onClick={setActiveSlotIndex}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};