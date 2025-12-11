import React from 'react';
import slotBg from '../assets/ui/inventory_slot.png';
import slotHoverBg from '../assets/ui/hover_inventory_slot.png';

const InventorySlot = ({ item, isActive, onClick, index }) => {
    // If item exists, show icon and count
    return (
        <div
            onClick={() => onClick(index)}
            // SIZE INCREASED: w-20 h-20 (80px) to match Dash Widget height
            className={`
                relative w-20 h-20 group cursor-pointer flex-shrink-0
                ${isActive ? 'transform -translate-y-2' : ''} /* Lift effect on select */
            `}
        >
            {/* Layer 1: Normal Background */}
            <img
                src={slotBg}
                alt="slot"
                className="absolute inset-0 w-full h-full pixelated z-0 block group-hover:hidden"
            />

            {/* Layer 2: Hover Background */}
            <img
                src={slotHoverBg}
                alt="slot active"
                className="absolute inset-0 w-full h-full pixelated z-0 hidden group-hover:block"
            />

            {/* Selection Highlight (Optional gold border effect) */}
            {isActive && (
                <div className="absolute inset-0 border-2 border-yellow-400 z-10 pointer-events-none opacity-50 rounded-sm" />
            )}

            {/* Layer 3: Item Icon */}
            {item && (
                <div className="absolute inset-3 z-20 flex items-center justify-center">
                    <img
                        src={item.icon}
                        alt={item.name}
                        className="w-full h-full object-contain pixelated filter drop-shadow-sm"
                    />
                </div>
            )}

            {/* Layer 4: Quantity */}
            {item && item.count > 1 && (
                <span className="absolute bottom-1.5 right-1.5 z-30 text-xs text-white font-pixel leading-none drop-shadow-md bg-black/60 px-1 rounded">
                    {item.count}
                </span>
            )}

            {/* Hotkey Number (1-0) */}
            <span className="absolute top-1 left-2 z-30 text-[10px] text-gray-500 font-pixel group-hover:text-yellow-200 shadow-black drop-shadow-sm">
                {index === 9 ? 0 : index + 1}
            </span>
        </div>
    );
};

export default InventorySlot;